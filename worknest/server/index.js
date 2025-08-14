// File: worknest/server/index.js

const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const fs = require('fs');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const upload = require('./middlewares/upload'); // Make sure your multer upload middleware is imported

// --- FIREBASE ADMIN SETUP ---
const serviceAccount = require('./serviceAccountKey.json');
initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore();
// --- END FIREBASE ADMIN SETUP ---

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- ADD THIS BACK: The File Upload Route ---
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file was uploaded.' });
    }
    res.status(200).json({
      message: 'File uploaded successfully!',
      url: req.file.path, // The Cloudinary URL
    });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});


// --- PDF Generation Route ---
app.get('/api/proposals/:id/pdf', async (req, res) => {
  try {
    const proposalId = req.params.id;
    const proposalDoc = await db.collection('proposals').doc(proposalId).get();
    if (!proposalDoc.exists) {
      return res.status(404).send('Proposal not found');
    }
    const proposalData = proposalDoc.data();
    const clientDoc = await db.collection('clients').doc(proposalData.clientId).get();
    const clientData = clientDoc.data();

    let html = fs.readFileSync('./proposal-template.html', 'utf-8');
    
    // Replace placeholders
    html = html.replace('{{title}}', proposalData.title);
    html = html.replace('{{clientName}}', clientData.name);
    html = html.replace('{{clientCompany}}', clientData.company || '');
    html = html.replace('{{currentDate}}', new Date().toLocaleDateString());
    html = html.replace('{{subtotal}}', proposalData.subtotal.toFixed(2));
    html = html.replace('{{taxRate}}', proposalData.taxRate);
    html = html.replace('{{taxAmount}}', proposalData.taxAmount.toFixed(2));
    html = html.replace('{{discount}}', proposalData.discount.toFixed(2));
    html = html.replace('{{total}}', proposalData.total.toFixed(2));
    html = html.replace('{{notes}}', proposalData.notes.replace(/\n/g, '<br>'));
    const lineItemsHtml = proposalData.lineItems.map(item => `
      <tr>
        <td>${item.service}</td>
        <td>${item.qty}</td>
        <td>$${item.rate.toFixed(2)}</td>
        <td>$${(item.qty * item.rate).toFixed(2)}</td>
      </tr>
    `).join('');
    html = html.replace('{{lineItems}}', lineItemsHtml);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,
      'Content-Disposition': `attachment; filename="proposal-${proposalId}.pdf"`
    });
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send('Error generating PDF');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});