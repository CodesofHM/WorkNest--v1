
// services/AIService.js
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const generateProposal = async (clientData, serviceDetails, userStyle = '') => {
  const prompt = `
    Create a professional business proposal for:
    Client: ${clientData.name} (${clientData.company})
    Industry: ${clientData.industry || 'General'}
    Services: ${serviceDetails.services.join(', ')}
    Budget Range: ₹${serviceDetails.budgetMin} - ₹${serviceDetails.budgetMax}
    Timeline: ${serviceDetails.timeline}

    Style preferences: ${userStyle}

    Generate a compelling proposal with:
    1. Executive Summary
    2. Project Scope
    3. Deliverables
    4. Timeline
    5. Investment Details

    Make it professional yet personalized for the Indian market.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1500,
      temperature: 0.7
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('AI Proposal Generation Error:', error);
    throw new Error('Failed to generate proposal. Please try again.');
  }
};

export const improveEmailCommunication = async (originalEmail, context) => {
  const prompt = `
    Improve this email for professional client communication:

    Original: "${originalEmail}"
    Context: ${context}

    Make it:
    - More professional yet friendly
    - Clear and concise
    - Appropriate for Indian business culture
    - Action-oriented
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 500,
    temperature: 0.6
  });

  return response.choices[0].message.content;
};

export const generateInvoiceDescription = async (projectDetails) => {
  const prompt = `
    Create professional invoice line item descriptions for:
    ${JSON.stringify(projectDetails)}

    Make descriptions clear, professional, and suitable for client invoices.
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 300
  });

  return response.choices[0].message.content;
};