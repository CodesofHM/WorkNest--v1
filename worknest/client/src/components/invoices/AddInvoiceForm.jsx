// File: worknest/client/src/components/invoices/AddInvoiceForm.jsx
import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';

const AddInvoiceForm = ({ clients, onSave, onCancel, initialData }) => {
  const [clientId, setClientId] = useState(initialData?.clientId || '');
  const [total, setTotal] = useState(initialData?.total || 0);
  const [dueDate, setDueDate] = useState(initialData?.dueDate || '');
  const [status, setStatus] = useState(initialData?.status || 'Pending');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const client = clients.find(c => c.id === clientId);
    onSave({
      clientId,
      clientName: client?.name || '',
      total: Number(total),
      dueDate,
      status,
      notes,
    });
  };

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Invoice' : 'New Invoice'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Client</label>
            <Select value={clientId} onChange={(e) => setClientId(e.target.value)} required>
              <option value="" disabled>Select a Client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </Select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Total Amount</label>
              <Input type="number" placeholder="Total Amount" value={total} onChange={(e) => setTotal(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label htmlFor="dueDate" className="text-sm font-medium">Due Date</label>
              <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional payment notes or invoice summary" rows={4} />
          </div>
        </CardContent>
        <CardFooter className="justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">{initialData ? 'Update Invoice' : 'Save Invoice'}</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AddInvoiceForm;
