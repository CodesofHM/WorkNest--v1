const fs = require('fs').promises;
const path = require('path');
const os = require('os'); // Required for finding the system's temporary directory
const { db } = require('../config/firebase');
const cloudinary = require('../config/cloudinary');
const { getPage, isBrowserHealthy, restartBrowser } = require('./browserService');
const uploadsDir = path.join(__dirname, '..', 'uploads');

// Helper function to format dates
const formatDate = (ts) => {
    if (!ts) return 'N/A';
    if (ts.toDate) return ts.toDate().toLocaleDateString('en-US');
    if (ts instanceof Date) return ts.toLocaleDateString('en-US');
    return String(ts);
};

const formatCompletionTime = (proposalData) => {
    const min = proposalData?.completionTimeMin;
    const max = proposalData?.completionTimeMax;
    const unit = proposalData?.completionTimeUnit || 'days';

    if (min && max) {
        return `${min} to ${max} ${unit} (working time)`;
    }

    if (min) {
        return `${min} ${unit} (working time)`;
    }

    return 'To be finalized';
};

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const escapeHtmlWithBreaks = (value) => escapeHtml(value).replace(/\n/g, '<br>');
const GST_RATE = 18;

const renderStructuredText = (value, options = {}) => {
    const {
        sectionClassName = 'formatted-section',
    } = options;

    const raw = String(value || '').trim();
    if (!raw) {
        return '';
    }

    const blocks = raw
        .split(/\n\s*\n/)
        .map((block) => block.split('\n').map((line) => line.trim()).filter(Boolean))
        .filter((block) => block.length);

    return blocks.map((lines) => {
        const [firstLine, ...restLines] = lines;
        const hasBody = restLines.length > 0;
        const looksLikeHeading = hasBody && firstLine.length <= 90;
        const heading = looksLikeHeading ? firstLine : null;
        const contentLines = looksLikeHeading ? restLines : lines;

        const renderedLines = contentLines.map((line) => {
            const bulletMatch = line.match(/^([\-*•●▪◦▸▶]+)\s*(.+)$/);
            if (bulletMatch) {
                return `<li>${escapeHtml(bulletMatch[2])}</li>`;
            }
            return `<li>${escapeHtml(line)}</li>`;
        }).join('');

        return `
          <div class="${sectionClassName}">
            ${heading ? `<h4>${escapeHtml(heading)}</h4>` : ''}
            <ul>${renderedLines}</ul>
          </div>
        `;
    }).join('');
};

const renderStructuredSections = (sections, options = {}) => {
    const {
        sectionClassName = 'formatted-section',
    } = options;

    if (!Array.isArray(sections) || !sections.length) {
        return '';
    }

    const sanitized = sections.filter((section) => String(section?.heading || '').trim() || String(section?.content || '').trim());
    if (!sanitized.length) {
        return '';
    }

    return sanitized.map((section, index) => {
        const heading = String(section?.heading || '').trim() || `Section ${index + 1}`;
        const lines = String(section?.content || '')
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean);

        const renderedLines = lines.length
            ? lines.map((line) => `<li>${escapeHtml(line.replace(/^([\-*•●▪◦▸▶]+)\s*/, ''))}</li>`).join('')
            : '';

        return `
          <div class="${sectionClassName}">
            <h4>${escapeHtml(heading)}</h4>
            ${renderedLines ? `<ul>${renderedLines}</ul>` : ''}
          </div>
        `;
    }).join('');
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

const savePdfLocally = async (buffer, proposalId) => {
    await fs.mkdir(uploadsDir, { recursive: true });
    const fileName = `proposal_${proposalId}.pdf`;
    const filePath = path.join(uploadsDir, fileName);
    await fs.writeFile(filePath, buffer);
    const publicBaseUrl = process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    return `${publicBaseUrl}/uploads/${fileName}`;
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

    const ownerSettings = ownerData.settings || {};
    const primaryColor = ownerSettings.primaryColor || '#111827';
    const secondaryColor = ownerSettings.secondaryColor || '#f3f4f6';
    const proposalFooter = ownerSettings.proposalFooter || 'Thank you for the opportunity to work together.';
    const companyName = ownerData.companyName || ownerData.displayName || '';
    const companyAddress = ownerData.address || '';

    const templatePath = path.join(__dirname, '..', 'proposal-template.html');
    let html = await fs.readFile(templatePath, 'utf8');
    const logoSrc = ownerSettings.logoUrl || ownerData.photoURL || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

    // All html.replace() calls remain the same...
    html = html.replace(/{{proposalTitle}}/g, escapeHtml(proposalData.title || ''));
    html = html.replace(/{{clientName}}/g, escapeHtml(clientData.name || ''));
    html = html.replace(/{{clientCompany}}/g, escapeHtml(clientData.company || ''));
    html = html.replace(/{{clientEmail}}/g, escapeHtml(clientData.email || ''));
    html = html.replace(/{{proposalDate}}/g, formatDate(proposalData.createdAt));
    html = html.replace(/{{completionTime}}/g, escapeHtml(formatCompletionTime(proposalData)));
    let subtotal = 0;
    html = html.replace(/{{scopeOfWork}}/g, Array.isArray(proposalData.scopeSections)
      ? renderStructuredSections(proposalData.scopeSections, {
          sectionClassName: 'scope-block',
        })
      : renderStructuredText(proposalData.scopeOfWork, {
          sectionClassName: 'scope-block',
        }));
    html = html.replace(/{{extraDetails}}/g, renderStructuredText(proposalData.extraDetails, {
      sectionClassName: 'detail-block',
    }));
    html = html.replace(/{{terms}}/g, escapeHtmlWithBreaks(proposalData.terms || ''));
    html = html.replace(/{{ownerLogo}}/g, logoSrc);
    html = html.replace(/{{ownerName}}/g, escapeHtml(ownerData.displayName || ''));
    html = html.replace(/{{ownerPhone}}/g, escapeHtml(ownerData.phoneNumber || ''));
    html = html.replace(/{{ownerField}}/g, escapeHtml(ownerData.freelancerField || ''));
    html = html.replace(/{{ownerEmail}}/g, escapeHtml(ownerData.email || ''));
    html = html.replace(/{{companyName}}/g, escapeHtml(companyName));
    html = html.replace(/{{companyAddress}}/g, escapeHtmlWithBreaks(companyAddress));
    html = html.replace(/{{proposalFooter}}/g, escapeHtmlWithBreaks(proposalFooter));
    html = html.replace(/{{primaryColor}}/g, primaryColor);
    html = html.replace(/{{secondaryColor}}/g, secondaryColor);
    if (!Array.isArray(proposalData.services)) {
        proposalData.services = [];
    }
    const servicesRows = proposalData.services.map(s => {
        const qty = Number(s.qty || 1);
        const unit = s.unit || '';
        const price = Number(s.price || 0);
        const lineTotal = qty * price;
        subtotal += lineTotal;
        return `<tr><td><strong>${escapeHtml(s.name || '')}</strong><br><small>${escapeHtml(s.description || '')}</small></td><td style="text-align:center;">${qty}${unit ? ` ${escapeHtml(unit)}` : ''}</td><td style="text-align:right;">Rs. ${price.toFixed(2)}</td><td style="text-align:right;">Rs. ${lineTotal.toFixed(2)}</td></tr>`;
    }).join('');
    const addGst = Boolean(proposalData.addGst);
    const roundOffAmount = Boolean(proposalData.roundOffAmount);
    const gstAmount = addGst ? subtotal * (GST_RATE / 100) : 0;
    const totalBeforeRoundOff = subtotal + gstAmount;
    const finalTotal = roundOffAmount ? Math.round(totalBeforeRoundOff) : totalBeforeRoundOff;
    const roundOffAdjustment = finalTotal - totalBeforeRoundOff;

    html = html.replace('{{servicesRows}}', servicesRows);
    html = html.replace('{{subtotal}}', `Rs. ${subtotal.toFixed(2)}`);
    html = html.replace(/{{gstRate}}/g, String(GST_RATE));
    html = html.replace(/{{gstAmount}}/g, `Rs. ${gstAmount.toFixed(2)}`);
    html = html.replace(/{{roundOffAmount}}/g, `${roundOffAdjustment >= 0 ? '+' : '-'}Rs. ${Math.abs(roundOffAdjustment).toFixed(2)}`);
    html = html.replace(/{{total}}/g, `Rs. ${finalTotal.toFixed(2)}`);
    html = html.replace(/{{gstRowDisplay}}/g, addGst ? 'table-row' : 'none');
    html = html.replace(/{{roundOffDisplay}}/g, roundOffAmount ? 'table-row' : 'none');
    html = html.replace(/{{scopeSectionDisplay}}/g, String((Array.isArray(proposalData.scopeSections) && proposalData.scopeSections.some((section) => String(section?.heading || '').trim() || String(section?.content || '').trim())) || String(proposalData.scopeOfWork || '').trim() ? 'block' : 'none'));
    html = html.replace(/{{extraDetailsDisplay}}/g, String(String(proposalData.extraDetails || '').trim() ? 'block' : 'none'));
    html = html.replace(/{{termsDisplay}}/g, String(String(proposalData.terms || '').trim() ? 'block' : 'none'));

    // --- 💡 NEW STRATEGY: Write the final HTML to a temporary file ---
    tempHtmlPath = path.join(os.tmpdir(), `proposal-${proposalId}-${Date.now()}.html`);
    await fs.writeFile(tempHtmlPath, html, 'utf8');

    // --- PDF Generation from the temporary file ---
    page = await getPage();
    
    await page.goto(`file://${tempHtmlPath}`, { waitUntil: 'load', timeout: 30000 });
    await page.emulateMediaType('screen');

    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, timeout: 30000 });

    try {
      const cloudinaryUrl = await streamUploadToCloudinary(pdfBuffer, `proposal_${proposalId}`);
      return { url: cloudinaryUrl };
    } catch (uploadError) {
      console.warn(`[PDF Service] Cloudinary upload failed, falling back to local storage: ${uploadError.message}`);
      const localUrl = await savePdfLocally(pdfBuffer, proposalId);
      return { url: localUrl };
    }

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
