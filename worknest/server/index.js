require('dotenv').config();
require('./config/firebase');

const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { db } = require('./config/firebase');
const { verifyToken } = require('./middlewares/auth');
// Correctly import the functions from the browser service
const { initializeBrowser, closeBrowser } = require('./services/browserService');
const uploadRoute = require('./routes/uploadRoute');
const { generateProposalPDF } = require('./services/pdfService');
const { generateAssistantReply, generateAssistantPdfBuffer } = require('./services/aiService');
const { sendDocumentMessage } = require('./services/whatsappService');

const app = express();
const server = http.createServer(app);
const dashboardQuoteFallbacks = [
  {
    quote: 'Business opportunities are like buses, there is always another one coming.',
    author: 'Richard Branson',
    source: 'fallback',
  },
  {
    quote: 'Success usually comes to those who are too busy to be looking for it.',
    author: 'Henry David Thoreau',
    source: 'fallback',
  },
  {
    quote: 'The way to get started is to quit talking and begin doing.',
    author: 'Walt Disney',
    source: 'fallback',
  },
];

let cachedDailyQuote = null;

const getUtcDateKey = () => {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
};

const getFallbackQuote = () => {
  const now = new Date();
  const index = now.getUTCDate() % dashboardQuoteFallbacks.length;
  return dashboardQuoteFallbacks[index];
};

const fetchDailyBusinessQuote = async () => {
  const todayKey = getUtcDateKey();
  if (cachedDailyQuote?.dateKey === todayKey) {
    return cachedDailyQuote;
  }

  try {
    const response = await fetch('https://zenquotes.io/api/today');
    const data = await response.json();
    const firstQuote = Array.isArray(data) ? data[0] : null;

    if (!response.ok || !firstQuote?.q || !firstQuote?.a) {
      throw new Error('Invalid quote response');
    }

    cachedDailyQuote = {
      dateKey: todayKey,
      quote: firstQuote.q,
      author: firstQuote.a,
      source: 'zenquotes',
      attribution: 'Quotes provided by ZenQuotes',
    };

    return cachedDailyQuote;
  } catch (error) {
    console.warn('[Server] Daily quote fallback in use:', error.message);
    cachedDailyQuote = {
      dateKey: todayKey,
      ...getFallbackQuote(),
    };
    return cachedDailyQuote;
  }
};

app.use(cors({
  exposedHeaders: ['X-PDF-URL', 'Content-Disposition'],
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- API ROUTES ---
app.use('/', uploadRoute);

app.get('/api/dashboard/daily-quote', async (req, res) => {
  try {
    const quote = await fetchDailyBusinessQuote();
    return res.status(200).json(quote);
  } catch (error) {
    console.error('[Server] Failed to load dashboard quote:', error);
    return res.status(500).json({ message: 'Failed to load daily quote.' });
  }
});

app.get('/api/user/profile', verifyToken, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    return res.status(200).json(userDoc.exists ? userDoc.data() : {});
  } catch (error) {
    console.error('[Server] Failed to load user profile:', error);
    return res.status(500).json({ message: 'Failed to load user profile.' });
  }
});

app.patch('/api/user/profile', verifyToken, async (req, res) => {
  try {
    const profilePayload = req.body && typeof req.body === 'object' ? req.body : {};
    await db.collection('users').doc(req.user.uid).set(profilePayload, { merge: true });
    const updatedDoc = await db.collection('users').doc(req.user.uid).get();
    return res.status(200).json(updatedDoc.exists ? updatedDoc.data() : {});
  } catch (error) {
    console.error('[Server] Failed to save user profile:', error);
    return res.status(500).json({ message: 'Failed to save user profile.' });
  }
});

app.patch('/api/user/settings', verifyToken, async (req, res) => {
  try {
    const settingsPayload = req.body && typeof req.body === 'object' ? req.body : {};
    await db.collection('users').doc(req.user.uid).set({ settings: settingsPayload }, { merge: true });
    const updatedDoc = await db.collection('users').doc(req.user.uid).get();
    return res.status(200).json(updatedDoc.exists ? updatedDoc.data() : {});
  } catch (error) {
    console.error('[Server] Failed to save user settings:', error);
    return res.status(500).json({ message: 'Failed to save user settings.' });
  }
});

app.get('/api/integrations/whatsapp/status', verifyToken, async (req, res) => {
  try {
    const integrationDoc = await db.collection('userIntegrations').doc(req.user.uid).get();
    const whatsapp = integrationDoc.exists ? integrationDoc.data()?.whatsapp || null : null;

    if (!whatsapp?.phoneNumberId || !whatsapp?.accessToken) {
      return res.status(200).json({ connected: false });
    }

    return res.status(200).json({
      connected: true,
      businessName: whatsapp.businessName || '',
      phoneNumberIdPreview: `••••${String(whatsapp.phoneNumberId).slice(-4)}`,
      updatedAt: whatsapp.updatedAt || whatsapp.connectedAt || null,
    });
  } catch (error) {
    console.error('[Server] Failed to load WhatsApp connection status:', error);
    return res.status(500).json({ message: 'Failed to load WhatsApp connection status.' });
  }
});

app.post('/api/integrations/whatsapp/connect', verifyToken, async (req, res) => {
  try {
    const { phoneNumberId, accessToken, businessName } = req.body || {};

    if (!phoneNumberId || !accessToken) {
      return res.status(400).json({ message: 'Phone Number ID and Access Token are required.' });
    }

    const now = new Date().toISOString();

    await db.collection('userIntegrations').doc(req.user.uid).set({
      whatsapp: {
        phoneNumberId: String(phoneNumberId).trim(),
        accessToken: String(accessToken).trim(),
        businessName: String(businessName || '').trim(),
        connectedAt: now,
        updatedAt: now,
      },
    }, { merge: true });

    return res.status(200).json({
      connected: true,
      businessName: String(businessName || '').trim(),
      phoneNumberIdPreview: `••••${String(phoneNumberId).trim().slice(-4)}`,
      updatedAt: now,
    });
  } catch (error) {
    console.error('[Server] Failed to save WhatsApp connection:', error);
    return res.status(500).json({ message: 'Failed to save WhatsApp connection.' });
  }
});

app.delete('/api/integrations/whatsapp/connect', verifyToken, async (req, res) => {
  try {
    await db.collection('userIntegrations').doc(req.user.uid).set({ whatsapp: null }, { merge: true });
    return res.status(200).json({ connected: false });
  } catch (error) {
    console.error('[Server] Failed to disconnect WhatsApp:', error);
    return res.status(500).json({ message: 'Failed to disconnect WhatsApp.' });
  }
});

app.post('/api/integrations/whatsapp/send-document', verifyToken, async (req, res) => {
  try {
    const { to, documentUrl, caption, filename } = req.body || {};
    const integrationDoc = await db.collection('userIntegrations').doc(req.user.uid).get();
    const whatsapp = integrationDoc.exists ? integrationDoc.data()?.whatsapp || null : null;

    if (!whatsapp?.phoneNumberId || !whatsapp?.accessToken) {
      return res.status(400).json({ message: 'WhatsApp is not connected yet. Add your Cloud API credentials in Settings first.' });
    }

    const result = await sendDocumentMessage({
      accessToken: whatsapp.accessToken,
      phoneNumberId: whatsapp.phoneNumberId,
      to,
      documentUrl,
      caption,
      filename,
    });

    return res.status(200).json({
      message: 'WhatsApp document message sent successfully.',
      result,
    });
  } catch (error) {
    console.error('[Server] Failed to send WhatsApp document:', error);
    return res.status(500).json({ message: error.message || 'Failed to send WhatsApp document.' });
  }
});

app.post('/ai/assist', async (req, res) => {
  try {
    const { task, prompt, tone } = req.body || {};
    const result = await generateAssistantReply({ task, prompt, tone });
    return res.status(200).json(result);
  } catch (error) {
    console.error('[Server] AI assistant error:', error);
    return res.status(500).json({ message: error.message || 'AI assistant failed.' });
  }
});

app.post('/ai/assist/pdf', async (req, res) => {
  try {
    const { task, prompt, tone } = req.body || {};
    const result = await generateAssistantPdfBuffer({ task, prompt, tone });
    const safeTask = (task || 'assistant').replace(/[^a-z0-9_-]/gi, '-').toLowerCase();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="worknest-ai-${safeTask}.pdf"`,
      'X-AI-Provider': result.provider || 'unknown',
    });

    return res.status(200).send(result.buffer);
  } catch (error) {
    console.error('[Server] AI PDF generation error:', error);
    return res.status(500).json({ message: error.message || 'AI PDF generation failed.' });
  }
});

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
