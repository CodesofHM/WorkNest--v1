// File: worknest/client/src/components/contracts/AddContractForm.jsx
import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';

const AddContractForm = ({ clients, onSave, onCancel, initialData }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [clientId, setClientId] = useState(initialData?.clientId || '');
  const [terms, setTerms] = useState(initialData?.terms || '');
  const [status, setStatus] = useState(initialData?.status || 'Draft');

  const handleSubmit = (e) => {
    e.preventDefault();
    const client = clients.find(c => c.id === clientId);
    onSave({ title, clientId, clientName: client?.name || '', terms, status });
  };

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Contract' : 'New Contract'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Contract Title</label>
            <Input type="text" placeholder="Contract Title (e.g., Service Agreement)" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Client</label>
            <Select value={clientId} onChange={(e) => setClientId(e.target.value)} required>
              <option value="" disabled>Select a Client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Draft">Draft</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Terms</label>
            <Textarea placeholder="Enter contract terms here..." value={terms} onChange={(e) => setTerms(e.target.value)} rows={8} />
          </div>
        </CardContent>
        <CardFooter className="justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">{initialData ? 'Update Contract' : 'Save Contract'}</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AddContractForm;
