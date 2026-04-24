const API_URL = import.meta.env.VITE_API_URL;

export const getDailyBusinessQuote = async () => {
  const response = await fetch(`${API_URL}/api/dashboard/daily-quote`);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Failed to load daily quote.');
  }

  return data;
};

export default {
  getDailyBusinessQuote,
};
