const OPENAI_API_URL = 'https://api.openai.com/v1/responses';
const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-5-mini';
const { getPage, isBrowserHealthy, restartBrowser } = require('./browserService');

const systemPrompts = {
  proposal: 'You are an expert freelance business assistant. Create concise, persuasive proposal content for freelance clients. Keep it practical, structured, and professional for small business use.',
  email: 'You are an expert client communication assistant. Rewrite messages so they are clear, confident, and professional while preserving the original intent.',
  invoice: 'You are an expert finance operations assistant for freelancers. Write concise invoice summaries or line-item descriptions that are clear and client-friendly.',
  payment: 'You are an expert payment follow-up assistant. Write tactful payment reminders and thank-you notes with the requested tone, staying professional and concise.',
  general: 'You are WorkNest AI, a practical assistant for freelancers. Give clear, usable output with minimal fluff.',
};

const taskLabels = {
  proposal: 'Proposal Draft',
  email: 'Email Rewrite',
  invoice: 'Invoice Copy',
  payment: 'Payment Follow-up',
  general: 'General Assistance',
};

const buildPrompt = ({ task = 'general', prompt, tone = 'Polite' }) => {
  return `${systemPrompts[task] || systemPrompts.general}

Tone: ${tone}
Task type: ${task}

User request:
${prompt}`;
};

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const extractOutputText = (responseData) => {
  if (responseData.output_text) {
    return responseData.output_text;
  }

  const textParts = [];
  for (const item of responseData.output || []) {
    if (item.type !== 'message') continue;
    for (const content of item.content || []) {
      if (content.type === 'output_text' && content.text) {
        textParts.push(content.text);
      }
    }
  }
  return textParts.join('\n').trim();
};

const buildFallbackResponse = ({ task = 'general', prompt, tone = 'Polite' }) => {
  const prefix = tone === 'Friendly' ? 'Sure, here is a friendly draft:\n\n' : tone === 'Strict' ? 'Here is a firm professional draft:\n\n' : 'Here is a polished draft:\n\n';

  if (task === 'proposal') {
    return `${prefix}Project Overview
${prompt}

Scope
- Clarify deliverables
- Confirm timeline and milestones
- Share communication expectations

Pricing
- Present the quote clearly
- Include payment schedule and validity

Next Step
Invite the client to confirm scope so the work can begin.`;
  }

  if (task === 'email') {
    return `${prefix}Hello,

${prompt}

Please let me know if you would like me to refine the scope, timeline, or pricing before I send the final version.

Best regards,`;
  }

  if (task === 'invoice') {
    return `${prefix}Invoice Summary
- Work completed as agreed
- Charges grouped clearly by deliverable
- Payment due as per the agreed schedule

Line Item Description
${prompt}`;
  }

  if (task === 'payment') {
    return `${prefix}${prompt}

Please share a quick update on the payment status when convenient. Thank you.`;
  }

  return `${prefix}${prompt}`;
};

const generateAssistantReply = async ({ task, prompt, tone }) => {
  if (!prompt || !prompt.trim()) {
    throw new Error('Prompt is required.');
  }

  if (!process.env.OPENAI_API_KEY) {
    return {
      provider: 'fallback',
      configured: false,
      output: buildFallbackResponse({ task, prompt, tone }),
    };
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      reasoning: { effort: 'low' },
      input: buildPrompt({ task, prompt, tone }),
      max_output_tokens: 500,
    }),
  });

  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = responseData.error?.message || 'OpenAI request failed.';
    throw new Error(message);
  }

  return {
    provider: 'openai',
    configured: true,
    output: extractOutputText(responseData),
    model: responseData.model || DEFAULT_MODEL,
  };
};

const buildAssistantPdfHtml = ({ task, tone, prompt, result }) => {
  const renderedOutput = escapeHtml(result.output || '').replace(/\n/g, '<br>');
  const renderedPrompt = escapeHtml(prompt || '').replace(/\n/g, '<br>');
  const generatedAt = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>WorkNest AI Output</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f7f8fb;
      color: #111827;
      margin: 0;
      padding: 32px;
    }
    .sheet {
      max-width: 760px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 18px;
      overflow: hidden;
    }
    .hero {
      padding: 28px 32px;
      background: linear-gradient(135deg, #0f172a, #1d4ed8);
      color: white;
    }
    .hero h1 {
      margin: 0 0 8px;
      font-size: 28px;
    }
    .hero p {
      margin: 0;
      opacity: 0.9;
      font-size: 14px;
    }
    .body {
      padding: 28px 32px 32px;
    }
    .meta {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
      margin-bottom: 24px;
    }
    .meta-card {
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      padding: 14px 16px;
      background: #f9fafb;
    }
    .meta-card .label {
      display: block;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #6b7280;
      margin-bottom: 6px;
    }
    .meta-card .value {
      font-size: 15px;
      font-weight: 600;
      color: #111827;
    }
    .section {
      margin-top: 24px;
    }
    .section h2 {
      margin: 0 0 12px;
      font-size: 17px;
      color: #1d4ed8;
    }
    .panel {
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      padding: 16px 18px;
      background: #ffffff;
      line-height: 1.7;
      font-size: 14px;
      white-space: normal;
      word-break: break-word;
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="hero">
      <h1>WorkNest AI</h1>
      <p>Generated ${escapeHtml(taskLabels[task] || taskLabels.general)} content for export.</p>
    </div>
    <div class="body">
      <div class="meta">
        <div class="meta-card">
          <span class="label">Task</span>
          <span class="value">${escapeHtml(taskLabels[task] || taskLabels.general)}</span>
        </div>
        <div class="meta-card">
          <span class="label">Tone</span>
          <span class="value">${escapeHtml(tone || 'Polite')}</span>
        </div>
        <div class="meta-card">
          <span class="label">Provider</span>
          <span class="value">${escapeHtml(result.provider || 'AI')}</span>
        </div>
        <div class="meta-card">
          <span class="label">Generated</span>
          <span class="value">${escapeHtml(generatedAt)}</span>
        </div>
      </div>

      <div class="section">
        <h2>Prompt</h2>
        <div class="panel">${renderedPrompt}</div>
      </div>

      <div class="section">
        <h2>AI Output</h2>
        <div class="panel">${renderedOutput}</div>
      </div>
    </div>
  </div>
</body>
</html>`;
};

const generateAssistantPdfBuffer = async ({ task, prompt, tone }) => {
  let page;

  try {
    if (!await isBrowserHealthy()) {
      await restartBrowser();
    }

    const result = await generateAssistantReply({ task, prompt, tone });
    const html = buildAssistantPdfHtml({ task, tone, prompt, result });

    page = await getPage();
    await page.setContent(html, { waitUntil: 'load' });
    await page.emulateMediaType('screen');

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '16px',
        right: '16px',
        bottom: '16px',
        left: '16px',
      },
    });

    return {
      buffer: pdfBuffer,
      provider: result.provider,
      configured: result.configured,
      model: result.model,
      output: result.output,
    };
  } finally {
    if (page && !page.isClosed()) {
      await page.close();
    }
  }
};

module.exports = {
  generateAssistantReply,
  generateAssistantPdfBuffer,
};
