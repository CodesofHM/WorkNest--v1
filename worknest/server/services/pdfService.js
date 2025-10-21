const fs = require('fs').promises;
const path = require('path');
const os = require('os'); // Required for finding the system's temporary directory
const { db } = require('../config/firebase');
const cloudinary = require('../config/cloudinary.config');
const { getPage, isBrowserHealthy, restartBrowser } = require('./browserService');

// Helper function to format dates
const formatDate = (ts) => {
    if (!ts) return 'N/A';
    if (ts.toDate) return ts.toDate().toLocaleDateString('en-US');
    if (ts instanceof Date) return ts.toLocaleDateString('en-US');
    return String(ts);
};

// Helper function to upload a buffer to Cloudinary
const streamUploadToCloudinary = (buffer, public_id) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({
            folder: "worknest-proposals",
            resource_type: "raw",
            public_id: public_id
        }, (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
        });
        stream.end(buffer);
    });
};

const generateProposalPDF = async (proposalId) => {
  let page;
  let tempHtmlPath; // This will hold the path to our temporary HTML file

  try {
    // --- Health Check (remains the same) ---
    if (!await isBrowserHealthy()) {
      console.warn(`[PDF Service] Browser is unhealthy. Restarting...`);
      await restartBrowser();
    }

    // --- Data Fetching and HTML Template Logic (remains the same) ---
    const proposalDoc = await db.collection('proposals').doc(proposalId).get();
    if (!proposalDoc.exists) throw new Error('Proposal not found.');
    const proposalData = proposalDoc.data();

    const clientDoc = await db.collection('clients').doc(proposalData.clientId).get();
    if (!clientDoc.exists) throw new Error('Client not found.');
    const clientData = clientDoc.data();

    let ownerData = {};
    if (proposalData.userId) {
        const ownerDoc = await db.collection('users').doc(proposalData.userId).get();
        if (ownerDoc.exists) ownerData = ownerDoc.data();
    }

    const templatePath = path.join(__dirname, '..', 'proposal-template.html');
    let html = await fs.readFile(templatePath, 'utf8');
    const logoSrc = ownerData.photoURL || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

    // All html.replace() calls remain the same...
    html = html.replace(/{{proposalTitle}}/g, proposalData.title || '');
    html = html.replace(/{{clientName}}/g, clientData.name || '');
    html = html.replace(/{{clientCompany}}/g, clientData.company || '');
    html = html.replace(/{{clientEmail}}/g, clientData.email || '');
    html = html.replace(/{{proposalDate}}/g, formatDate(proposalData.createdAt));
    html = html.replace(/{{validUntil}}/g, formatDate(proposalData.validUntil));
    html = html.replace(/{{total}}/g, `₹${(proposalData.total || 0).toFixed(2)}`);
    html = html.replace(/{{terms}}/g, (proposalData.terms || '').replace(/\n/g, '<br>'));
    html = html.replace(/{{ownerLogo}}/g, logoSrc);
    html = html.replace(/{{ownerName}}/g, ownerData.displayName || '');
    html = html.replace(/{{ownerPhone}}/g, ownerData.phoneNumber || '');
    html = html.replace(/{{ownerField}}/g, ownerData.freelancerField || '');
    html = html.replace(/{{ownerEmail}}/g, ownerData.email || '');
    if (!Array.isArray(proposalData.services)) {
        proposalData.services = [];
    }
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

    // --- 💡 NEW STRATEGY: Write the final HTML to a temporary file ---
    tempHtmlPath = path.join(os.tmpdir(), `proposal-${proposalId}-${Date.now()}.html`);
    await fs.writeFile(tempHtmlPath, html, 'utf8');

    // --- PDF Generation from the temporary file ---
    page = await getPage();
    
    // Navigate to the local HTML file. This is more stable than setContent.
    await page.goto(`file://${tempHtmlPath}`, { waitUntil: 'networkidle0', timeout: 30000 });
    
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, timeout: 30000 });

    const cloudinaryUrl = await streamUploadToCloudinary(pdfBuffer, `proposal_${proposalId}`);
    
    return { url: cloudinaryUrl };

  } catch (error) {
    console.error(`[PDF Service] ❌ Final error for proposal ${proposalId}:`, error.message);
    throw new Error(`PDF generation failed: ${error.message}`);
  } finally {
    // --- CRUCIAL Cleanup Step ---
    // Always close the page and delete the temporary HTML file.
    if (page && !page.isClosed()) {
      await page.close();
    }
    if (tempHtmlPath) {
      try {
        await fs.unlink(tempHtmlPath);
      } catch (cleanupError) {
        console.warn(`[PDF Service] Could not delete temporary file: ${tempHtmlPath}`, cleanupError);
      }
    }
  }
};

module.exports = { generateProposalPDF };

