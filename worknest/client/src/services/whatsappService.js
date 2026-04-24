import { getAuth } from 'firebase/auth';

import.meta.env.VITE_API_URL
const getAuthHeaders = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error('You must be logged in to continue.');
  }

  const token = await user.getIdToken();

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

const parseJsonResponse = async (response, fallbackMessage) => {
  let payload = {};

  try {
    payload = await response.json();
  } catch (error) {
    payload = {};
  }

  if (!response.ok) {
    throw new Error(payload.message || fallbackMessage);
  }

  return payload;
};

export const getWhatsAppConnectionStatus = async () => {
  const response = await fetch(`${API_URL}/api/integrations/whatsapp/status`, {
    method: 'GET',
    headers: await getAuthHeaders(),
  });

  return parseJsonResponse(response, 'Failed to load WhatsApp connection status.');
};

export const saveWhatsAppConnection = async (payload) => {
  const response = await fetch(`${API_URL}/api/integrations/whatsapp/connect`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(payload || {}),
  });

  return parseJsonResponse(response, 'Failed to save WhatsApp connection.');
};

export const disconnectWhatsAppConnection = async () => {
  const response = await fetch(`${API_URL}/api/integrations/whatsapp/connect`, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
  });

  return parseJsonResponse(response, 'Failed to disconnect WhatsApp.');
};

export const sendWhatsAppDocument = async (payload) => {
  const response = await fetch(`${API_URL}/api/integrations/whatsapp/send-document`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(payload || {}),
  });

  return parseJsonResponse(response, 'Failed to send WhatsApp document.');
};
