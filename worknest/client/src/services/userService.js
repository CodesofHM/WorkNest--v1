import { getAuth } from 'firebase/auth';

const API_URL = import.meta.env.VITE_API_URL;

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

export const saveUserProfileMeta = async (userId, meta) => {
  if (!userId) throw new Error('User ID is required');

  try {
    const response = await fetch(`${API_URL}/api/user/profile`, {
      method: 'PATCH',
      headers: await getAuthHeaders(),
      body: JSON.stringify(meta || {}),
    });

    return await parseJsonResponse(response, 'Failed to save user profile.');
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Network error: ${error.message}. Make sure the server is running at ${API_URL}`);
    }
    throw error;
  }
};

export const getUserProfileMeta = async (userId) => {
  if (!userId) throw new Error('User ID is required');

  try {
    const response = await fetch(`${API_URL}/api/user/profile`, {
      method: 'GET',
      headers: await getAuthHeaders(),
    });

    return await parseJsonResponse(response, 'Failed to load user profile.');
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Network error: ${error.message}. Make sure the server is running at ${API_URL}`);
    }
    throw error;
  }
};

export const saveUserSettings = async (userId, settings) => {
  if (!userId) throw new Error('User ID is required');

  try {
    const response = await fetch(`${API_URL}/api/user/settings`, {
      method: 'PATCH',
      headers: await getAuthHeaders(),
      body: JSON.stringify(settings || {}),
    });

    return await parseJsonResponse(response, 'Failed to save user settings.');
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Network error: ${error.message}. Make sure the server is running at ${API_URL}`);
    }
    throw error;
  }
};

export default {
  saveUserProfileMeta,
  getUserProfileMeta,
  saveUserSettings,
};
