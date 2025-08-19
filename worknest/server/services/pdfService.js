const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const { db } = require('../config/firebase');
const crypto = require('crypto');
const os = require('os');

const formatDate = (ts) => {
    if (!ts) return 'N/A';
    if (ts.toDate) return ts.toDate().toLocaleDateString('en-US');
    if (ts instanceof Date) return ts.toLocaleDateString('en-US');
    return String(ts);
};

const generateProposalPDF = async (proposalId) => {
    let browser;
    try {
        const proposalDoc = await db.collection('proposals').doc(proposalId).get();
        if (!proposalDoc.exists) throw new Error('Proposal not found.');
        const proposalData = proposalDoc.data();

        const clientDoc = await db.collection('clients').doc(proposalData.clientId).get();
        if (!clientDoc.exists) throw new Error('Client not found.');
        const clientData = clientDoc.data();

        // Fetch owner/user profile meta to include logo/name/phone in the PDF
        let ownerData = {};
        try {
            if (proposalData.userId) {
                const ownerDoc = await db.collection('users').doc(proposalData.userId).get();
                if (ownerDoc.exists) ownerData = ownerDoc.data();
            }
        } catch (ownerErr) {
            console.warn('[PDF Service] Warning: failed to fetch owner profile meta.', ownerErr.message || ownerErr);
        }

        // Debug: log fetched data used to render the template
        try {
            console.log(`[PDF Service] Debug: proposalData for ${proposalId}:`, JSON.stringify(proposalData));
            console.log(`[PDF Service] Debug: clientData for ${proposalId}:`, JSON.stringify(clientData));
        } catch (logErr) {
            console.warn('[PDF Service] Warning: failed to stringify proposal/client data for logs.', logErr.message || logErr);
        }

        const templatePath = path.join(__dirname, '..', 'proposal-template.html');
        let html = await fs.readFile(templatePath, 'utf8');

    html = html.replace(/{{proposalTitle}}/g, proposalData.title || '');
        html = html.replace(/{{clientName}}/g, clientData.name || '');
        html = html.replace(/{{clientCompany}}/g, clientData.company || '');
        html = html.replace(/{{clientEmail}}/g, clientData.email || '');
        html = html.replace(/{{proposalDate}}/g, formatDate(proposalData.createdAt));
        html = html.replace(/{{validUntil}}/g, formatDate(proposalData.validUntil));
    html = html.replace(/{{total}}/g, `₹${(proposalData.total || 0).toFixed(2)}`);
    html = html.replace(/{{terms}}/g, (proposalData.terms || '').replace(/\n/g, '<br>'));

    // Owner placeholders
    html = html.replace(/{{ownerLogo}}/g, ownerData.photoURL || '');
    html = html.replace(/{{ownerName}}/g, ownerData.displayName || '');
    html = html.replace(/{{ownerPhone}}/g, ownerData.phoneNumber || '');
    html = html.replace(/{{ownerField}}/g, ownerData.freelancerField || '');
    html = html.replace(/{{ownerEmail}}/g, ownerData.email || '');

        if (!Array.isArray(proposalData.services)) {
            proposalData.services = [];
        }

        // Build detailed rows with qty/unit if present; default qty=1
        let subtotal = 0;
        const servicesRows = proposalData.services.map(s => {
            const qty = Number(s.qty || 1);
            const unit = s.unit || '';
            const price = Number(s.price || 0);
            const lineTotal = qty * price;
            subtotal += lineTotal;
            return `<tr><td><strong>${s.name || ''}</strong><br><small>${s.description || ''}</small></td><td style="text-align:center;">${qty}${unit ? ' ' + unit : ''}</td><td style="text-align:right;">₹${price.toFixed(2)}</td><td style="text-align:right;">₹${lineTotal.toFixed(2)}</td></tr>`;
        }).join('');
        html = html.replace('{{servicesRows}}', servicesRows);
        html = html.replace('{{subtotal}}', `₹${subtotal.toFixed(2)}`);
        html = html.replace('{{servicesRows}}', servicesRows);

        // Debug: log and persist the final HTML so we can inspect what Puppeteer receives
        try {
            console.log(`[PDF Service] Debug: final HTML length for proposal ${proposalId}:`, html.length);
            const debugPath = path.join(__dirname, '..', `proposal_debug_${proposalId}.html`);
            await fs.writeFile(debugPath, html, 'utf8');
            console.log(`[PDF Service] Debug: written HTML to ${debugPath}`);
        } catch (dbgErr) {
            console.warn('[PDF Service] Warning: failed to write debug HTML file.', dbgErr.message || dbgErr);
        }

        browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        // Ensure page renders like a screen (helps with CSS)
        await page.emulateMediaType('screen');
        await page.setViewport({ width: 1200, height: 800 });
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

        console.log(`[PDF Service] Generated PDF buffer size for proposal ${proposalId}:`, pdfBuffer ? pdfBuffer.length : 0);

        // Ensure uploads directory exists and write the PDF there for local inspection
        let savedPdfRelativePath = null;
        try {
            const uploadsDir = path.join(__dirname, '..', 'uploads');
            await fs.mkdir(uploadsDir, { recursive: true });
            const pdfPath = path.join(uploadsDir, `proposal_${proposalId}.pdf`);
            await fs.writeFile(pdfPath, pdfBuffer);
            console.log(`[PDF Service] Debug: saved generated PDF to ${pdfPath}`);
                savedPdfRelativePath = path.join('uploads', `proposal_${proposalId}.pdf`);
                // Create a short-lived token file to secure the PDF URL
                try {
                    const token = crypto.randomBytes(16).toString('hex');
                    const tokenData = {
                        token,
                        pdf: savedPdfRelativePath.replace(/\\/g, '/'),
                        expiresAt: Date.now() + (1000 * 60 * 10) // 10 minutes
                    };
                    const tokenPath = path.join(__dirname, '..', 'uploads', `proposal_${proposalId}.token.json`);
                    await fs.writeFile(tokenPath, JSON.stringify(tokenData), 'utf8');
                    // Expose the token in the returned object so server can build a secure URL
                    return { pdfBuffer, savedPdfRelativePath, token: tokenData.token };
                } catch (tErr) {
                    console.warn('[PDF Service] Warning: failed to write token file.', tErr.message || tErr);
                    return { pdfBuffer, savedPdfRelativePath };
                }
        } catch (saveErr) {
            console.warn('[PDF Service] Warning: failed to save PDF to uploads folder.', saveErr.message || saveErr);
        }

        return { pdfBuffer, savedPdfRelativePath };
    } catch (error) {
        console.error(`[PDF Service] ❌ ERROR:`, error);
        throw error;
    } finally {
        if (browser) await browser.close();
    }

};
module.exports = { generateProposalPDF };