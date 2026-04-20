const GRAPH_VERSION = process.env.WHATSAPP_GRAPH_API_VERSION || 'v22.0';

const ensurePublicDocumentUrl = (documentUrl) => {
  if (!documentUrl) {
    throw new Error('A PDF URL is required to send a WhatsApp document message.');
  }

  const normalized = String(documentUrl).trim();

  if (!/^https?:\/\//i.test(normalized)) {
    throw new Error('WhatsApp document links must be absolute public URLs.');
  }

  if (/localhost|127\.0\.0\.1/i.test(normalized)) {
    throw new Error('WhatsApp Cloud API cannot fetch PDFs from localhost. Use a publicly reachable PDF URL.');
  }

  return normalized;
};

const normalizePhoneNumber = (phoneNumber) => {
  const normalized = String(phoneNumber || '').replace(/\D/g, '');
  if (!normalized) {
    throw new Error('A client phone number is required for WhatsApp delivery.');
  }
  return normalized;
};

const getMessagesEndpoint = (phoneNumberId) =>
  `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`;

const parseMetaError = async (response) => {
  try {
    const payload = await response.json();
    return payload?.error?.message || payload?.message || response.statusText;
  } catch (error) {
    return response.statusText;
  }
};

const sendDocumentMessage = async ({
  accessToken,
  phoneNumberId,
  to,
  documentUrl,
  caption,
  filename,
}) => {
  const endpoint = getMessagesEndpoint(phoneNumberId);
  const safeUrl = ensurePublicDocumentUrl(documentUrl);
  const recipient = normalizePhoneNumber(to);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipient,
      type: 'document',
      document: {
        link: safeUrl,
        caption: caption || 'Shared from WorkNest',
        filename: filename || 'document.pdf',
      },
    }),
  });

  if (!response.ok) {
    throw new Error(await parseMetaError(response));
  }

  return response.json();
};

module.exports = {
  sendDocumentMessage,
};
