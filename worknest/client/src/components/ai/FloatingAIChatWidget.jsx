import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Bot, Copy, Download, FileText, HelpCircle, MessageSquareText, SendHorizonal, Sparkles, Wand2, X } from 'lucide-react';
import { runAIAssistant, generateAIAssistantPdf } from '../../services/assistantService';
import { useAuth } from '../../hooks/useAuth';
import { addClient, getClientsForUser } from '../../services/clientService';
import { addInvoice, getInvoicesForUser } from '../../services/invoiceService';
import { GUEST_LIMITS, isGuestUser } from '../../utils/guestMode';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import GuestLimitModal from '../GuestLimitModal';

const placeholders = {
  proposal: 'Draft a website redesign proposal for a salon client with a 4-week timeline and staged payment terms.',
  email: 'Rewrite this follow-up email so it sounds confident, warm, and professional.',
  invoice: 'Write invoice line items for logo design, homepage build, CMS setup, and launch support.',
  payment: 'Write a polite overdue payment reminder for invoice INV-104 that was due 7 days ago.',
  general: 'Ask for help with proposals, invoices, client communication, pricing, workflow, or what to do next.',
};

const taskLabels = {
  proposal: 'Proposal Draft',
  email: 'Email Rewrite',
  invoice: 'Invoice Copy',
  payment: 'Payment Follow-up',
  general: 'Manual Help',
};

const fastPresets = [
  {
    id: 'proposal-fast',
    label: 'Proposal',
    task: 'proposal',
    tone: 'Polite',
    prompt: 'Create a short, professional business proposal for a client. Include project overview, scope, timeline, pricing summary, and next steps.',
  },
  {
    id: 'invoice-fast',
    label: 'Invoice Copy',
    task: 'invoice',
    tone: 'Polite',
    prompt: 'Write clean invoice wording with concise line items and a clear payment note for a freelance service project.',
  },
  {
    id: 'payment-fast',
    label: 'Payment Reminder',
    task: 'payment',
    tone: 'Polite',
    prompt: 'Write a polite overdue payment reminder that sounds professional, clear, and respectful.',
  },
  {
    id: 'email-fast',
    label: 'Client Email',
    task: 'email',
    tone: 'Friendly',
    prompt: 'Write a client update email that is warm, confident, and professional with a clear next step.',
  },
];

const manualWelcomeMessage = {
  id: 'manual-welcome',
  role: 'assistant',
  text: "Hi, I'm WORKNEST's AI. Ask me anything, or tell me to do simple work like: make one client named Harshit, or make one invoice of the client named Harshit of Rs 2500 for web. Type @ to pick an existing client.",
  links: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Proposals', path: '/proposals' },
    { label: 'Clients', path: '/clients' },
    { label: 'Settings', path: '/settings' },
  ],
};

const navigationHints = [
  { label: 'Dashboard', path: '/dashboard', keywords: ['dashboard', 'overview', 'what can i do', 'what is here', 'start', 'home'] },
  { label: 'Clients', path: '/clients', keywords: ['client', 'clients', 'lead', 'contact'] },
  { label: 'Proposals', path: '/proposals', keywords: ['proposal', 'quote', 'pricing', 'offer'] },
  { label: 'Invoices', path: '/invoices', keywords: ['invoice', 'payment', 'paid', 'billing', 'overdue'] },
  { label: 'Contracts', path: '/contracts', keywords: ['contract', 'agreement'] },
  { label: 'Templates', path: '/templates', keywords: ['template', 'package', 'pricing template'] },
  { label: 'Settings', path: '/settings', keywords: ['setting', 'brand', 'branding', 'pdf color', 'logo'] },
  { label: 'My Account', path: '/account', keywords: ['account', 'profile', 'my account'] },
];

const buildManualPrompt = (query) => `You are helping a user inside the WorkNest app.

Explain the answer clearly and practically.
If the user is asking how to do something, give short numbered steps.
When relevant, mention the matching WorkNest section names exactly, such as Dashboard, Clients, Proposals, Contracts, Invoices, Templates, Settings, or My Account.
Keep the answer useful for an in-app assistant.

User question:
${query}`;

const getSuggestedLinks = (text) => {
  const haystack = String(text || '').toLowerCase();
  const matches = navigationHints.filter((item) => item.keywords.some((keyword) => haystack.includes(keyword)));
  return matches.slice(0, 4).map(({ label, path }) => ({ label, path }));
};

const addDays = (date, days) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate.toISOString().slice(0, 10);
};

const cleanName = (value) => String(value || '')
  .replace(/^named\s+/i, '')
  .replace(/^(the\s+)?client\s+/i, '')
  .replace(/[.,!?]+$/g, '')
  .trim();

const parseClientCommand = (text) => {
  const match = text.match(/\b(?:make|create|add)\s+(?:one\s+|a\s+)?client\s+(?:named\s+|name\s+)?([a-z][a-z0-9 .'-]*?)(?=\s+(?:with|for|of|and)\b|$)/i);
  if (!match) return null;

  const name = cleanName(match[1]);
  return name ? { type: 'create-client', name } : null;
};

const parseInvoiceCommand = (text) => {
  if (!/\b(?:make|create|add)\s+(?:one\s+|an?\s+)?invoice\b/i.test(text)) return null;

  const amountMatch = text.match(/(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d+)?)/i);
  const amount = amountMatch ? Number(amountMatch[1].replace(/,/g, '')) : 0;

  const clientMatch = text.match(/(?:client\s+(?:named\s+)?|for\s+client\s+|for\s+)(@?[a-z][a-z0-9 .'-]*?)(?=\s+(?:of|for|with|rs\.?|inr|₹|\d)\b|$)/i);
  const clientName = cleanName(clientMatch?.[1]?.replace(/^@/, ''));

  const amountEndIndex = amountMatch ? amountMatch.index + amountMatch[0].length : -1;
  const serviceFromAfterAmount = amountEndIndex >= 0
    ? text.slice(amountEndIndex).match(/\bfor\s+(.+?)(?=$|[.!?])/i)?.[1]
    : '';
  const serviceFromGeneral = text.match(/\bfor\s+(.+?)(?=\s+(?:of\s+)?(?:rs\.?|inr|₹)\b|$)/i)?.[1];
  const service = cleanName(serviceFromAfterAmount || serviceFromGeneral || 'Service work');

  if (!clientName || !amount) return null;

  return {
    type: 'create-invoice',
    clientName,
    amount,
    service,
  };
};

const FloatingAIChatWidget = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isGuest = isGuestUser(currentUser);
  const [isOpen, setIsOpen] = useState(false);
  const [assistantMode, setAssistantMode] = useState('fast');
  const [task, setTask] = useState('proposal');
  const [tone, setTone] = useState('Polite');
  const [outputMode, setOutputMode] = useState('content');
  const [prompt, setPrompt] = useState(placeholders.proposal);
  const [manualPrompt, setManualPrompt] = useState('');
  const [messages, setMessages] = useState([manualWelcomeMessage]);
  const [output, setOutput] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [provider, setProvider] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestLimitModalOpen, setGuestLimitModalOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [clientMentionOpen, setClientMentionOpen] = useState(false);

  const downloadFileName = useMemo(() => `worknest-ai-${task}.pdf`, [task]);

  const refreshWorkspaceData = async () => {
    if (!currentUser) return;

    const [nextClients, nextInvoices] = await Promise.all([
      getClientsForUser(currentUser.uid),
      getInvoicesForUser(currentUser.uid),
    ]);

    setClients(nextClients);
    setInvoices(nextInvoices);
  };

  useEffect(() => {
    refreshWorkspaceData().catch((error) => {
      console.error('Failed to load AI workspace context:', error);
    });
  }, [currentUser]);

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const resetPdfUrl = () => {
    setPdfUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
      return '';
    });
  };

  const handleTaskChange = (nextTask) => {
    setTask(nextTask);
    setPrompt(placeholders[nextTask] || '');
    setOutput('');
    setProvider('');
    resetPdfUrl();
  };

  const handleAssistantModeChange = (nextMode) => {
    setAssistantMode(nextMode);
    setOutput('');
    setProvider('');
    resetPdfUrl();

    if (nextMode === 'manual') {
      setTask('general');
      setOutputMode('content');
      setManualPrompt('');
      setMessages([manualWelcomeMessage]);
      return;
    }

    setTask('proposal');
    setTone('Polite');
    setPrompt(placeholders.proposal);
  };

  const handleOutputModeChange = (nextMode) => {
    if (isGuest && nextMode === 'pdf') {
      setGuestLimitModalOpen(true);
      return;
    }

    setOutputMode(nextMode);
    setOutput('');
    setProvider('');
    resetPdfUrl();
  };

  const handlePresetSelect = (preset) => {
    setTask(preset.task);
    setTone(preset.tone);
    setPrompt(preset.prompt);
    setOutput('');
    setProvider('');
    resetPdfUrl();
  };

  const handleSuggestedNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const appendClientMention = (clientName) => {
    const nextPrompt = manualPrompt.replace(/@\S*$/, `@${clientName} `);
    setManualPrompt(nextPrompt);
    setClientMentionOpen(false);
  };

  const createInvoicePdfSummary = async ({ clientName, amount, service }) => {
    if (isGuest) return null;

    const pdfBlob = await generateAIAssistantPdf({
      task: 'invoice',
      tone: 'Polite',
      prompt: `Create a clean invoice PDF summary for client ${clientName}. Service: ${service}. Amount: Rs. ${amount.toFixed(2)}. Include payment status as Pending and a short professional payment note.`,
    });

    const nextPdfUrl = URL.createObjectURL(pdfBlob);
    setPdfUrl(nextPdfUrl);
    return nextPdfUrl;
  };

  const handleDirectAction = async (query) => {
    if (!currentUser) return false;

    const invoiceCommand = parseInvoiceCommand(query);
    if (invoiceCommand) {
      if (isGuest && invoices.length >= GUEST_LIMITS.invoices) {
        setGuestLimitModalOpen(true);
        return true;
      }

      let matchedClient = clients.find((client) =>
        client.name?.toLowerCase() === invoiceCommand.clientName.toLowerCase()
      );
      let createdClient = false;

      if (!matchedClient) {
        if (isGuest && clients.length >= GUEST_LIMITS.clients) {
          setGuestLimitModalOpen(true);
          return true;
        }

        const clientRef = await addClient(currentUser.uid, {
          name: invoiceCommand.clientName,
          company: invoiceCommand.clientName,
          email: '',
          phone: '',
          status: 'Active',
        });

        matchedClient = {
          id: clientRef.id,
          name: invoiceCommand.clientName,
          company: invoiceCommand.clientName,
        };
        createdClient = true;
      }

      const invoiceRef = await addInvoice(currentUser.uid, {
        clientId: matchedClient.id,
        clientName: matchedClient.name,
        total: invoiceCommand.amount,
        dueDate: addDays(new Date(), 7),
        status: 'Pending',
        notes: invoiceCommand.service,
      });

      await refreshWorkspaceData();

      let pdfReady = false;
      try {
        pdfReady = Boolean(await createInvoicePdfSummary(invoiceCommand));
      } catch (error) {
        console.warn('Invoice PDF summary generation failed:', error);
      }

      setMessages((current) => [...current, {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: `${createdClient ? `Created client ${matchedClient.name}. ` : ''}Created invoice for ${matchedClient.name} of Rs. ${invoiceCommand.amount.toFixed(2)} for ${invoiceCommand.service}.${pdfReady ? ' I also prepared a PDF summary you can preview or download.' : ''}`,
        links: [
          { label: 'Invoices', path: '/invoices' },
          { label: 'Clients', path: '/clients' },
        ],
      }]);

      toast.success(`Invoice created for ${matchedClient.name}.`);
      return true;
    }

    const clientCommand = parseClientCommand(query);
    if (clientCommand) {
      if (isGuest && clients.length >= GUEST_LIMITS.clients) {
        setGuestLimitModalOpen(true);
        return true;
      }

      const existingClient = clients.find((client) =>
        client.name?.toLowerCase() === clientCommand.name.toLowerCase()
      );

      if (existingClient) {
        setMessages((current) => [...current, {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: `${existingClient.name} already exists in your client list.`,
          links: [{ label: 'Clients', path: '/clients' }],
        }]);
        return true;
      }

      await addClient(currentUser.uid, {
        name: clientCommand.name,
        company: clientCommand.name,
        email: '',
        phone: '',
        status: 'Active',
      });

      await refreshWorkspaceData();
      setMessages((current) => [...current, {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: `Created client ${clientCommand.name}.`,
        links: [{ label: 'Clients', path: '/clients' }],
      }]);
      toast.success(`Client ${clientCommand.name} created.`);
      return true;
    }

    return false;
  };

  const handleManualSend = async () => {
    if (!manualPrompt.trim()) {
      toast.error('Please type your question first.');
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: manualPrompt.trim(),
    };

    setMessages((current) => [...current, userMessage]);
    setManualPrompt('');
    resetPdfUrl();

    try {
      setLoading(true);
      const handledDirectly = await handleDirectAction(userMessage.text);
      if (handledDirectly) return;

      const result = await runAIAssistant({
        task: 'general',
        tone: 'Polite',
        prompt: buildManualPrompt(userMessage.text),
      });

      const links = getSuggestedLinks(`${userMessage.text}\n${result.output || ''}`);
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: result.output || 'I was not able to generate a response.',
        links,
      };

      setMessages((current) => [...current, assistantMessage]);
      setProvider(result.provider || '');
    } catch (error) {
      console.error('Manual AI chat request failed:', error);
      toast.error(error.message || 'AI assistant failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualInputKeyDown = async (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      await handleManualSend();
    }
  };

  const handleManualPromptChange = (event) => {
    const nextValue = event.target.value;
    setManualPrompt(nextValue);
    setClientMentionOpen(/@\w*$/i.test(nextValue));
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt first.');
      return;
    }

    try {
      setLoading(true);
      setOutput('');
      setProvider('');
      resetPdfUrl();

      if (outputMode === 'pdf') {
        if (isGuest) {
          setGuestLimitModalOpen(true);
          return;
        }
        const pdfBlob = await generateAIAssistantPdf({ task, tone, prompt });
        const nextPdfUrl = URL.createObjectURL(pdfBlob);
        setPdfUrl(nextPdfUrl);
        toast.success('PDF generated. You can preview or download it now.');
        return;
      }

      const result = await runAIAssistant({ task, tone, prompt });
      setOutput(result.output || '');
      setProvider(result.provider || '');
      if (result.provider === 'fallback') {
        toast.success('Generated with the built-in fallback assistant.');
      }
    } catch (error) {
      console.error('AI widget request failed:', error);
      toast.error(error.message || 'AI assistant failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    toast.success('Content copied.');
  };

  const handlePreviewPdf = () => {
    if (!pdfUrl) return;
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadPdf = () => {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = downloadFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <GuestLimitModal
        isOpen={guestLimitModalOpen}
        resourceName="AI PDF export"
        onClose={() => setGuestLimitModalOpen(false)}
      />
      {isOpen ? (
        <div className="fixed inset-0 z-40 bg-black/20 md:bg-transparent" onClick={() => setIsOpen(false)} role="presentation" />
      ) : null}

      {isOpen ? (
        <div
          className="fixed inset-x-4 bottom-28 z-50 md:bottom-24 md:left-auto md:right-6 md:w-[420px]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="max-h-[calc(100vh-7.5rem)] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
            <div className="bg-[linear-gradient(135deg,_#020617,_#0f172a_35%,_#1d4ed8)] px-5 py-4 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-sky-200">
                    <Sparkles className="h-4 w-4" />
                    WORKNEST's AI
                  </div>
                  <h3 className="mt-2 text-xl font-semibold">Fast drafts, manual help, and export-ready output</h3>
                  <p className="mt-1 text-sm text-slate-300">Choose the fast lane for speed or manual help when you want to ask anything directly.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
                  aria-label="Close AI assistant"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="max-h-[calc(100vh-15rem)] space-y-4 overflow-y-auto p-5">
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => handleAssistantModeChange('fast')}
                  className={`inline-flex items-center justify-center rounded-2xl px-3 py-2 text-sm font-medium transition ${assistantMode === 'fast' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  <Wand2 className="mr-2 h-4 w-4" />
                  Fast Way
                </button>
                <button
                  type="button"
                  onClick={() => handleAssistantModeChange('manual')}
                  className={`inline-flex items-center justify-center rounded-2xl px-3 py-2 text-sm font-medium transition ${assistantMode === 'manual' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Manual Help
                </button>
              </div>

              {assistantMode === 'fast' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Quick start</label>
                    <div className="flex flex-wrap gap-2">
                      {fastPresets.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handlePresetSelect(preset)}
                          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500">Fast Way prefills useful prompts so users can generate something valuable with less typing.</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Task</label>
                      <Select value={task} onChange={(event) => handleTaskChange(event.target.value)}>
                        <option value="proposal">Proposal Draft</option>
                        <option value="email">Email Rewrite</option>
                        <option value="invoice">Invoice Copy</option>
                        <option value="payment">Payment Follow-up</option>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Output</label>
                      <Select value={outputMode} onChange={(event) => handleOutputModeChange(event.target.value)}>
                        <option value="content">Direct Content</option>
                        {!isGuest ? <option value="pdf">PDF File</option> : null}
                      </Select>
                      {isGuest ? (
                        <p className="mt-1 text-xs text-slate-500">Guest AI supports direct content only.</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-1">
                      <label className="text-sm font-medium text-slate-700">Tone</label>
                      <Select value={tone} onChange={(event) => setTone(event.target.value)}>
                        <option value="Friendly">Friendly</option>
                        <option value="Polite">Polite</option>
                        <option value="Strict">Strict</option>
                      </Select>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
                      <span className="font-semibold text-slate-900">{taskLabels[task]}</span>
                      <p className="mt-1">Generate as editable text or a shareable PDF from the same prompt.</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Prompt</label>
                    <Textarea
                      rows={6}
                      value={prompt}
                      onChange={(event) => setPrompt(event.target.value)}
                      placeholder={placeholders[task] || placeholders.general}
                      className="resize-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="max-h-[360px] space-y-3 overflow-y-auto rounded-3xl border border-slate-200 bg-slate-50 p-3">
                      {messages.map((message) => (
                        <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-6 shadow-sm ${
                              message.role === 'user'
                                ? 'bg-slate-950 text-white'
                                : 'border border-slate-200 bg-white text-slate-700'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{message.text}</p>
                            {message.links?.length ? (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {message.links.map((link) => (
                                  <button
                                    key={`${message.id}-${link.path}`}
                                    type="button"
                                    onClick={() => handleSuggestedNavigation(link.path)}
                                    className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700 transition hover:bg-sky-100"
                                  >
                                    Open {link.label}
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ))}
                      {loading ? (
                        <div className="flex justify-start">
                          <div className="max-w-[85%] rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                            Thinking...
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
                      {clientMentionOpen && clients.length > 0 ? (
                        <div className="mb-2 flex max-h-32 flex-wrap gap-2 overflow-y-auto rounded-2xl bg-slate-50 p-2">
                          {clients.slice(0, 6).map((client) => (
                            <button
                              key={client.id}
                              type="button"
                              onClick={() => appendClientMention(client.name)}
                              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
                            >
                              @{client.name}
                            </button>
                          ))}
                        </div>
                      ) : null}
                      <div className="flex items-end gap-2">
                        <Input
                          value={manualPrompt}
                          onChange={handleManualPromptChange}
                          onKeyDown={handleManualInputKeyDown}
                          placeholder="Ask WORKNEST's AI anything, or type @ to select a client..."
                          className="h-12 border-0 bg-transparent text-sm shadow-none focus-visible:ring-0"
                        />
                        <Button
                          type="button"
                          onClick={handleManualSend}
                          disabled={loading || !manualPrompt.trim()}
                          size="icon"
                          className="h-11 w-11 rounded-full"
                        >
                          <SendHorizonal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {pdfUrl ? (
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={handlePreviewPdf}>
                          <FileText className="mr-2 h-4 w-4" />
                          Preview PDF
                        </Button>
                        <Button variant="outline" onClick={handleDownloadPdf}>
                          <Download className="mr-2 h-4 w-4" />
                          Download PDF
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </>
              )}

              {assistantMode === 'fast' ? (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button onClick={handleGenerate} disabled={loading}>
                      <Sparkles className="mr-2 h-4 w-4" />
                      {loading ? 'Generating...' : outputMode === 'pdf' ? 'Generate PDF' : 'Generate Content'}
                    </Button>
                    {outputMode === 'content' ? (
                      <Button variant="outline" onClick={handleCopy} disabled={!output}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline" onClick={handlePreviewPdf} disabled={!pdfUrl}>
                          <FileText className="mr-2 h-4 w-4" />
                          Preview PDF
                        </Button>
                        <Button variant="outline" onClick={handleDownloadPdf} disabled={!pdfUrl}>
                          <Download className="mr-2 h-4 w-4" />
                          Download PDF
                        </Button>
                      </>
                    )}
                  </div>

                  {provider && outputMode === 'content' ? (
                    <p className="text-xs text-slate-500">Provider: {provider}</p>
                  ) : null}

                  {outputMode === 'content' ? (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Output</label>
                      <Textarea
                        rows={10}
                        value={output}
                        onChange={(event) => setOutput(event.target.value)}
                        placeholder="Your AI-generated content will appear here."
                        className="min-h-[220px]"
                      />
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600">
                      {pdfUrl ? (
                        <p>Your PDF is ready. Use Preview PDF to open it in a new tab or Download PDF to save it.</p>
                      ) : (
                        <p>Choose PDF mode and generate from your prompt. The widget will prepare a proper downloadable PDF for you.</p>
                      )}
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,_#020617,_#1d4ed8)] text-white shadow-[0_20px_45px_rgba(15,23,42,0.35)] transition hover:scale-105 md:bottom-6 md:right-6 md:h-16 md:w-16"
        aria-label="Open AI assistant"
      >
        {isOpen ? <X className="h-6 w-6 md:h-7 md:w-7" /> : <Bot className="h-6 w-6 md:h-7 md:w-7" />}
      </button>

      {!isOpen ? (
        <div className="fixed bottom-24 right-6 z-40 hidden rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-slate-700 shadow-lg md:flex">
          <MessageSquareText className="mr-2 h-4 w-4 text-sky-600" />
          WORKNEST's AI
        </div>
      ) : null}
    </>
  );
};

export default FloatingAIChatWidget;
