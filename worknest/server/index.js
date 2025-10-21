require('dotenv').config();
require('./config/firebase');

const express = require('express');
const cors = require('cors');
const http = require('http');
// Correctly import the functions from the browser service
const { initializeBrowser, closeBrowser } = require('./services/browserService');
const uploadRoute = require('./routes/uploadRoute');
const { generateProposalPDF } = require('./services/pdfService');

const app = express();
const server = http.createServer(app);

app.use(cors({
  exposedHeaders: ['X-PDF-URL', 'Content-Disposition'],
}));
app.use(express.json());

// --- API ROUTES ---
app.use('/', uploadRoute);

app.post('/generate-pdf/:proposalId', async (req, res) => {
  const { proposalId } = req.params;
  if (!proposalId) {
    return res.status(400).json({ message: 'Missing proposalId' });
  }
  try {
    const { url } = await generateProposalPDF(proposalId);
    if (url) {
      res.set('X-PDF-URL', url);
      return res.status(200).json({ url });
    }
    return res.status(500).json({ message: 'PDF generation failed: No URL was returned.' });
  } catch (err) {
    console.error(`[Server] ❌ Error in /generate-pdf route for ${proposalId}:`, err);
    return res.status(500).json({ message: 'Server error during PDF generation.', detail: err.message });
  }
});

// --- SERVER INITIALIZATION ---
const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  try {
    // This call should now work correctly
    await initializeBrowser();
  } catch (error) {
    console.error('WARN: Could not start the browser. PDF features will be unavailable.');
  }
});

// --- PROCESS & ERROR HANDLING ---
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ FATAL: Port ${PORT} is already in use.`);
    process.exit(1);
  } else {
    console.error('Server startup error:', err);
  }
});

const cleanup = async () => {
  console.log('Shutting down server gracefully...');
  await closeBrowser();
};

process.on('SIGINT', () => cleanup().then(() => process.exit(0)));
process.on('SIGTERM', () => cleanup().then(() => process.exit(0)));

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});