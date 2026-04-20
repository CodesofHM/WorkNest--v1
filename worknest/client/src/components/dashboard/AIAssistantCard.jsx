import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Bot, Copy, Sparkles } from 'lucide-react';
import { runAIAssistant } from '../../services/assistantService';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';

const placeholders = {
  proposal: 'Draft a website redesign proposal for a salon client with a 4-week timeline and staged payment terms.',
  email: 'Rewrite this follow-up email so it sounds confident and professional but still friendly.',
  invoice: 'Write invoice line item descriptions for brand design, website development, and launch support.',
  payment: 'Write a polite overdue payment reminder for invoice INV-104, due 7 days ago.',
};

const taskLabels = {
  proposal: 'Proposal Draft',
  email: 'Email Rewrite',
  invoice: 'Invoice Copy',
  payment: 'Payment Follow-up',
};

const AIAssistantCard = () => {
  const [task, setTask] = useState('proposal');
  const [tone, setTone] = useState('Polite');
  const [prompt, setPrompt] = useState(placeholders.proposal);
  const [output, setOutput] = useState('');
  const [provider, setProvider] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTaskChange = (nextTask) => {
    setTask(nextTask);
    setPrompt(placeholders[nextTask]);
    setOutput('');
    setProvider('');
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter some context for the AI assistant.');
      return;
    }

    try {
      setLoading(true);
      const result = await runAIAssistant({ task, tone, prompt });
      setOutput(result.output || '');
      setProvider(result.provider || '');
      if (result.provider === 'fallback') {
        toast.success('Generated with the built-in fallback assistant.');
      }
    } catch (error) {
      console.error('AI assistant request failed:', error);
      toast.error(error.message || 'AI assistant failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    toast.success('AI output copied.');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>AI Assistant</CardTitle>
            <CardDescription>Generate proposal text, email drafts, invoice copy, and payment follow-ups from one place.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Task</label>
            <Select value={task} onChange={(event) => handleTaskChange(event.target.value)}>
              <option value="proposal">Proposal Draft</option>
              <option value="email">Email Rewrite</option>
              <option value="invoice">Invoice Copy</option>
              <option value="payment">Payment Follow-up</option>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tone</label>
            <Select value={tone} onChange={(event) => setTone(event.target.value)}>
              <option value="Friendly">Friendly</option>
              <option value="Polite">Polite</option>
              <option value="Strict">Strict</option>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{taskLabels[task]} Prompt</label>
          <Textarea rows={5} value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder={placeholders[task]} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handleGenerate} disabled={loading}>
            <Sparkles className="mr-2 h-4 w-4" />
            {loading ? 'Generating...' : 'Generate'}
          </Button>
          <Button variant="outline" onClick={handleCopy} disabled={!output}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Output
          </Button>
          {provider ? <span className="text-xs text-muted-foreground">Provider: {provider}</span> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Output</label>
          <Textarea rows={10} value={output} onChange={(event) => setOutput(event.target.value)} placeholder="The AI assistant output will appear here." />
        </div>
      </CardContent>
    </Card>
  );
};

export default AIAssistantCard;
