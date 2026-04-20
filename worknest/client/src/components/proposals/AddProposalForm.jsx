import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const defaultScopeSection = { heading: '', content: '' };
const GST_RATE = 18;

const getPricingSummary = (services, options = {}) => {
  const subtotal = services.reduce((acc, service) => acc + Number(service.price || 0), 0);
  const gstAmount = options.addGst ? subtotal * (GST_RATE / 100) : 0;
  const totalBeforeRoundOff = subtotal + gstAmount;
  const finalTotal = options.roundOffAmount ? Math.round(totalBeforeRoundOff) : totalBeforeRoundOff;
  const roundOffAdjustment = finalTotal - totalBeforeRoundOff;

  return {
    subtotal,
    gstAmount,
    roundOffAdjustment,
    total: finalTotal,
  };
};

const AddProposalForm = ({ clients, templates = [], initialData, onSave, onCancel }) => {
  const [step, setStep] = useState(1);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [proposal, setProposal] = useState({
    title: '',
    clientId: '',
    status: 'Draft',
    services: [{ name: '', description: '', price: '' }],
    scopeOfWork: '',
    scopeSections: [{ ...defaultScopeSection }],
    extraDetails: '',
    addGst: false,
    roundOffAmount: false,
    total: 0,
    completionTimeMin: '',
    completionTimeMax: '',
    completionTimeUnit: 'days',
    terms: '',
  });

  useEffect(() => {
    if (initialData) {
      setProposal({
        title: initialData.title || '',
        clientId: initialData.clientId || '',
        status: initialData.status || 'Draft',
        services: initialData.services || [{ name: '', description: '', price: '' }],
        scopeOfWork: initialData.scopeOfWork || '',
        scopeSections: initialData.scopeSections?.length
          ? initialData.scopeSections
          : initialData.scopeOfWork
            ? [{ heading: 'Scope of Work', content: initialData.scopeOfWork }]
            : [{ ...defaultScopeSection }],
        extraDetails: initialData.extraDetails || '',
        addGst: Boolean(initialData.addGst),
        roundOffAmount: Boolean(initialData.roundOffAmount),
        total: initialData.total || 0,
        completionTimeMin: initialData.completionTimeMin || '',
        completionTimeMax: initialData.completionTimeMax || '',
        completionTimeUnit: initialData.completionTimeUnit || 'days',
        terms: initialData.terms || 'Payment to be made within 15 days of invoice receipt.',
      });
    }
  }, [initialData]);

  const applyTemplate = (templateId) => {
    const template = templates.find((item) => item.id === templateId);
    if (!template) return;

    const templateServices = (template.lineItems || []).map((item) => {
      const qty = Number(item.qty || 1);
      const rate = Number(item.rate || 0);
      const lineTotal = qty * rate;

      return {
        name: item.service || '',
        description: qty > 1 ? `${qty} x ${rate}` : `Rate: ${rate}`,
        price: lineTotal,
      };
    });

    if (templateServices.length === 0) {
      toast.error('This template has no line items to apply.');
      return;
    }

    setProposal((prev) => ({
      ...prev,
      services: templateServices,
      total: getPricingSummary(templateServices, {
        addGst: prev.addGst,
        roundOffAmount: prev.roundOffAmount,
      }).total,
    }));
    setSelectedTemplateId(templateId);
    toast.success(`Applied template "${template.templateName}".`);
  };

  const calculateTotal = (services, options) => {
    setProposal((prev) => ({
      ...prev,
      total: getPricingSummary(services, options || {
        addGst: prev.addGst,
        roundOffAmount: prev.roundOffAmount,
      }).total,
    }));
  };

  const handleServiceChange = (index, event) => {
    const values = [...proposal.services];
    values[index][event.target.name] = event.target.value;
    setProposal((prev) => ({ ...prev, services: values }));
    calculateTotal(values, {
      addGst: proposal.addGst,
      roundOffAmount: proposal.roundOffAmount,
    });
  };

  const addService = () => {
    setProposal((prev) => ({ ...prev, services: [...prev.services, { name: '', description: '', price: '' }] }));
  };

  const removeService = (index) => {
    const values = [...proposal.services];
    values.splice(index, 1);
    setProposal((prev) => ({ ...prev, services: values }));
    calculateTotal(values, {
      addGst: proposal.addGst,
      roundOffAmount: proposal.roundOffAmount,
    });
  };

  const handleScopeSectionChange = (index, field, value) => {
    const nextSections = [...proposal.scopeSections];
    nextSections[index] = {
      ...nextSections[index],
      [field]: value,
    };
    setProposal((prev) => ({ ...prev, scopeSections: nextSections }));
  };

  const addScopeSection = () => {
    setProposal((prev) => ({
      ...prev,
      scopeSections: [...prev.scopeSections, { ...defaultScopeSection }],
    }));
  };

  const removeScopeSection = (index) => {
    const nextSections = proposal.scopeSections.filter((_, sectionIndex) => sectionIndex !== index);
    setProposal((prev) => ({
      ...prev,
      scopeSections: nextSections.length ? nextSections : [{ ...defaultScopeSection }],
    }));
  };

  const handlePricingOptionChange = (field, checked) => {
    const nextFlags = {
      addGst: field === 'addGst' ? checked : proposal.addGst,
      roundOffAmount: field === 'roundOffAmount' ? checked : proposal.roundOffAmount,
    };

    setProposal((prev) => ({
      ...prev,
      [field]: checked,
      total: getPricingSummary(prev.services, nextFlags).total,
    }));
  };

  const nextStep = () => {
    if (step === 1 && (!proposal.title || !proposal.clientId)) {
      toast.error('Please fill in the proposal title and select a client.');
      return;
    }
    setStep((s) => s + 1);
  };

  const prevStep = () => setStep((s) => s - 1);

  const handleSubmit = () => {
    if (proposal.services.some((service) => !service.name || !service.price)) {
      toast.error('Please ensure all services have a name and a price.');
      return;
    }
    onSave({
      ...proposal,
      total: pricingSummary.total,
      scopeOfWork: proposal.scopeSections
        .filter((section) => section.heading.trim() || section.content.trim())
        .map((section) => `${section.heading.trim()}\n${section.content.trim()}`.trim())
        .join('\n\n'),
    });
  };

  const pricingSummary = getPricingSummary(proposal.services, {
    addGst: proposal.addGst,
    roundOffAmount: proposal.roundOffAmount,
  });

  return (
    <Card className="mx-auto max-w-4xl">
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Proposal' : 'Create a New Proposal'}</CardTitle>
        <CardDescription>Step {step} of 3</CardDescription>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label>Proposal Title</label>
              <Input
                placeholder="e.g., Website Redesign Project"
                value={proposal.title}
                onChange={(e) => setProposal({ ...proposal, title: e.target.value })}
              />
            </div>
            <div>
              <label>Client</label>
              <Select
                value={proposal.clientId}
                onChange={(e) => setProposal({ ...proposal, clientId: e.target.value })}
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </Select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="mb-4 text-lg font-medium">Services & Pricing</h3>
            {templates.length > 0 ? (
              <div className="mb-4 rounded-lg border bg-slate-50 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-end">
                  <div className="flex-1">
                    <label className="mb-2 block text-sm font-medium">Use Saved Template</label>
                    <Select value={selectedTemplateId} onChange={(e) => setSelectedTemplateId(e.target.value)}>
                      <option value="">Select a pricing template</option>
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>{template.templateName}</option>
                      ))}
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => applyTemplate(selectedTemplateId)}
                    disabled={!selectedTemplateId}
                  >
                    Apply Template
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Templates help you reuse common service packages instead of retyping the same pricing again and again.
                </p>
              </div>
            ) : null}

            {proposal.services.map((service, index) => (
              <div key={index} className="mb-2 grid grid-cols-12 gap-2 rounded-md border p-2">
                <Input name="name" placeholder="Service Name" value={service.name} onChange={(e) => handleServiceChange(index, e)} className="col-span-4" />
                <Input name="description" placeholder="Description" value={service.description} onChange={(e) => handleServiceChange(index, e)} className="col-span-5" />
                <Input name="price" type="number" placeholder="Price" value={service.price} onChange={(e) => handleServiceChange(index, e)} className="col-span-2" />
                <Button variant="ghost" size="icon" onClick={() => removeService(index)} className="col-span-1">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button variant="outline" onClick={addService}>
              <Plus className="mr-2 h-4 w-4" /> Add Service
            </Button>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium">Scope of Work Formatter</label>
                <Button type="button" variant="outline" onClick={addScopeSection}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Section
                </Button>
              </div>
              <div className="space-y-3">
                {proposal.scopeSections.map((section, index) => (
                  <div key={`scope-section-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="grid gap-3">
                      <div className="flex items-center justify-between gap-3">
                        <Input
                          placeholder="Section heading, e.g. Website Design & Development"
                          value={section.heading}
                          onChange={(e) => handleScopeSectionChange(index, 'heading', e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeScopeSection(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <Textarea
                        placeholder="Write what will be provided under this heading. Put each deliverable on a new line."
                        value={section.content}
                        onChange={(e) => handleScopeSectionChange(index, 'content', e.target.value)}
                        rows={5}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Users control the heading and the content under that heading. Put each deliverable on a new line for cleaner PDF formatting.
              </p>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium">Additional Proposal Details</label>
              <Textarea
                placeholder="Add any extra scope details, assumptions, exclusions, milestones, or custom notes you want included in the proposal."
                value={proposal.extraDetails}
                onChange={(e) => setProposal({ ...proposal, extraDetails: e.target.value })}
                rows={5}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Optional: use this for anything you want to write beyond the service list.
              </p>
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={proposal.addGst}
                    onChange={(e) => handlePricingOptionChange('addGst', e.target.checked)}
                  />
                  <span>Add GST ({GST_RATE}%)</span>
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={proposal.roundOffAmount}
                    onChange={(e) => handlePricingOptionChange('roundOffAmount', e.target.checked)}
                  />
                  <span>Make Round Off the Amount</span>
                </label>
              </div>
              <div className="mt-4 space-y-1 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>Rs. {pricingSummary.subtotal.toFixed(2)}</span>
                </div>
                {proposal.addGst ? (
                  <div className="flex items-center justify-between">
                    <span>GST ({GST_RATE}%)</span>
                    <span>Rs. {pricingSummary.gstAmount.toFixed(2)}</span>
                  </div>
                ) : null}
                {proposal.roundOffAmount ? (
                  <div className="flex items-center justify-between">
                    <span>Round Off</span>
                    <span>{pricingSummary.roundOffAdjustment >= 0 ? '+' : '-'}Rs. {Math.abs(pricingSummary.roundOffAdjustment).toFixed(2)}</span>
                  </div>
                ) : null}
              </div>
              <div className="mt-4 text-right text-xl font-bold">
                Total: Rs. {pricingSummary.total.toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={proposal.status === 'Draft'} onChange={(e) => setProposal({ ...proposal, status: e.target.checked ? 'Draft' : 'Ready' })} />
                <span className="text-sm">Save as Draft</span>
              </label>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium">Project Completion Time</label>
              <div className="grid gap-3 md:grid-cols-3">
                <Input
                  type="number"
                  min="1"
                  placeholder="Minimum"
                  value={proposal.completionTimeMin}
                  onChange={(e) => setProposal({ ...proposal, completionTimeMin: e.target.value })}
                />
                <Input
                  type="number"
                  min="1"
                  placeholder="Maximum"
                  value={proposal.completionTimeMax}
                  onChange={(e) => setProposal({ ...proposal, completionTimeMax: e.target.value })}
                />
                <Select
                  value={proposal.completionTimeUnit}
                  onChange={(e) => setProposal({ ...proposal, completionTimeUnit: e.target.value })}
                >
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                Example: 5 to 7 days, or 2 to 3 weeks. All completion estimates are based on working time only.
              </p>
            </div>
            <div>
              <label>Terms & Conditions</label>
              <Textarea
                placeholder="e.g., Payment terms, project scope..."
                value={proposal.terms}
                onChange={(e) => setProposal({ ...proposal, terms: e.target.value })}
                rows={5}
              />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          {step > 1 && <Button variant="outline" onClick={prevStep}>Back</Button>}
        </div>
        <div className="space-x-2">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          {step < 3 && <Button onClick={nextStep}>Next</Button>}
          {step === 3 && <Button onClick={handleSubmit}>Save Proposal</Button>}
        </div>
      </CardFooter>
    </Card>
  );
};

export default AddProposalForm;
