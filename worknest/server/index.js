require('./config/firebase'); // Initialize Firebase first
const express = require('express');
const cors = require('cors');
const { generateProposalPDF } = require('./services/pdfService');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
// Serve uploaded files (PDFs)
// Note: uploads are served via the secure /secure-pdf/:token endpoint to prevent public access

app.post('/generate-pdf/:proposalId', async (req, res) => {
  const { proposalId } = req.params;
  try {
    const result = await generateProposalPDF(proposalId);
    // result may be either a Buffer (old behavior) or an object { pdfBuffer, savedPdfRelativePath }
    const pdfBuffer = result && result.pdfBuffer ? result.pdfBuffer : result;
    const savedPdfRelativePath = result && result.savedPdfRelativePath ? result.savedPdfRelativePath : null;

    if (!pdfBuffer || pdfBuffer.length === 0) throw new Error("Generated PDF buffer is empty.");

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="proposal_${proposalId}.pdf"`);
    // If we saved the PDF to disk, expose its URL in a header for the client to preview via iframe
    if (savedPdfRelativePath) {
      // If a token was returned, build a secure URL using the token
      if (result && result.token) {
        const secureUrl = `${req.protocol}://${req.get('host')}/secure-pdf/${result.token}`;
        res.setHeader('X-PDF-URL', secureUrl);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, X-PDF-URL');
      } else {
        const fullUrl = `${req.protocol}://${req.get('host')}/${savedPdfRelativePath.replace(/\\\\/g, '/')}`;
        res.setHeader('X-PDF-URL', fullUrl);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, X-PDF-URL');
      }
    } else {
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    }

    res.send(pdfBuffer);
  } catch (error) {
    console.error(`[Server] ❌ Failed to generate PDF. Error: ${error.message}`);
    res.status(500).send(`Server error: Could not generate the PDF.`);
  }
});

// Secure PDF serving endpoint: validates token file and streams PDF if valid
app.get('/secure-pdf/:token', async (req, res) => {
  const { token } = req.params;
  try {
    const uploadsDir = path.join(__dirname, 'uploads');
    // Search for a token file matching the token (simple approach: read all token files)
    const files = await fs.promises.readdir(uploadsDir);
    const tokenFiles = files.filter(f => f.endsWith('.token.json'));
    let matched = null;
    for (const tf of tokenFiles) {
      const fullPath = path.join(uploadsDir, tf);
      const content = await fs.promises.readFile(fullPath, 'utf8');
      const data = JSON.parse(content);
      if (data.token === token) {
        matched = data;
        break;
      }
    }
    if (!matched) return res.status(404).send('Not found or token invalid');
    if (matched.expiresAt < Date.now()) return res.status(403).send('Token expired');
    const pdfPath = path.join(__dirname, matched.pdf);
    if (!fs.existsSync(pdfPath)) return res.status(404).send('PDF not found');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${path.basename(pdfPath)}"`);
    const stream = fs.createReadStream(pdfPath);
    stream.pipe(res);
  } catch (err) {
    console.error('Secure PDF error:', err);
    res.status(500).send('Server error');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));