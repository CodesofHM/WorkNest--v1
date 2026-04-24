const API_URL = import.meta.env.VITE_API_URL;

export const runAIAssistant = async ({ task, prompt, tone = 'Polite' }) => {
  const response = await fetch(`${API_URL}/ai/assist`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ task, prompt, tone }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'AI assistant request failed.');
  }
  return data;
};

export const generateAIAssistantPdf = async ({ task, prompt, tone = 'Polite' }) => {
  const response = await fetch(`${API_URL}/ai/assist/pdf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ task, prompt, tone }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'AI PDF generation failed.');
  }

  const fileBlob = await response.blob();
  return new Blob([fileBlob], { type: 'application/pdf' });
};
