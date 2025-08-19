import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const AddProposalForm = ({ clients, initialData, onSave, onCancel }) => {
  const [step, setStep] = useState(1);
  const [proposal, setProposal] = useState({
    title: '',
    clientId: '',
  status: 'Draft',
    services: [{ name: '', description: '', price: '' }],
    total: 0,
    validUntil: '',
    terms: '',
  });

  useEffect(() => {
    if (initialData) {
      setProposal({
        title: initialData.title || '',
        clientId: initialData.clientId || '',
        status: initialData.status || 'Draft',
        services: initialData.services || [{ name: '', description: '', price: '' }],
        total: initialData.total || 0,
        validUntil: initialData.validUntil ? new Date(initialData.validUntil.seconds * 1000).toISOString().split('T')[0] : '',
        terms: initialData.terms || 'Payment to be made within 15 days of invoice receipt.',
      });
    }
  }, [initialData]);

  const handleServiceChange = (index, event) => {
    const values = [...proposal.services];
    values[index][event.target.name] = event.target.value;
    setProposal(prev => ({ ...prev, services: values }));
    calculateTotal(values);
  };
  
  const calculateTotal = (services) => {
    const total = services.reduce((acc, service) => acc + Number(service.price || 0), 0);
    setProposal(prev => ({ ...prev, total }));
  };
  
  const addService = () => {
    setProposal(prev => ({ ...prev, services: [...prev.services, { name: '', description: '', price: '' }] }));
  };
  
  const removeService = (index) => {
    const values = [...proposal.services];
    values.splice(index, 1);
    setProposal(prev => ({ ...prev, services: values }));
    calculateTotal(values);
  };

  const nextStep = () => {
    if (step === 1 && (!proposal.title || !proposal.clientId)) {
      toast.error('Please fill in the proposal title and select a client.');
      return;
    }
    setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = () => {
    // Final validation
    if (proposal.services.some(s => !s.name || !s.price)) {
      toast.error('Please ensure all services have a name and a price.');
      return;
    }
    onSave({
      ...proposal,
      // Convert date string back to Firestore Timestamp if needed by the backend
      validUntil: proposal.validUntil ? new Date(proposal.validUntil) : null,
    });
  };

  return (
    <Card className="max-w-4xl mx-auto">
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
                onChange={e => setProposal({ ...proposal, title: e.target.value })}
              />
            </div>
            <div>
              <label>Client</label>
              <Select
                value={proposal.clientId}
                onChange={e => setProposal({ ...proposal, clientId: e.target.value })}
              >
                <option value="">Select a client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </Select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="text-lg font-medium mb-4">Services & Pricing</h3>
            {proposal.services.map((service, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 mb-2 p-2 border rounded-md">
                <Input name="name" placeholder="Service Name" value={service.name} onChange={e => handleServiceChange(index, e)} className="col-span-4" />
                <Input name="description" placeholder="Description" value={service.description} onChange={e => handleServiceChange(index, e)} className="col-span-5" />
                <Input name="price" type="number" placeholder="Price" value={service.price} onChange={e => handleServiceChange(index, e)} className="col-span-2" />
                <Button variant="ghost" size="icon" onClick={() => removeService(index)} className="col-span-1">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={addService}>
              <Plus className="h-4 w-4 mr-2" /> Add Service
            </Button>
            <div className="text-right font-bold text-xl mt-4">
              Total: ₹{proposal.total.toFixed(2)}
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
            <div>
              <label>Valid Until</label>
              <Input
                type="date"
                value={proposal.validUntil}
                onChange={e => setProposal({ ...proposal, validUntil: e.target.value })}
              />
            </div>
            <div>
              <label>Terms & Conditions</label>
              <Textarea
                placeholder="e.g., Payment terms, project scope..."
                value={proposal.terms}
                onChange={e => setProposal({ ...proposal, terms: e.target.value })}
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