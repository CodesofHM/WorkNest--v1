// File: worknest/client/src/components/invoices/AddInvoiceForm.jsx
import React, { useState } from 'react';

const AddInvoiceForm = ({ clients, onSave, onCancel }) => {
  const [clientId, setClientId] = useState('');
  const [total, setTotal] = useState(0);
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const client = clients.find(c => c.id === clientId);
    onSave({ clientId, clientName: client.name, total: Number(total), dueDate });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-xl font-semibold mb-4">New Invoice</h3>
      <div className="space-y-4">
        <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required>
          <option value="" disabled>Select a Client</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>{client.name}</option>
          ))}
        </select>
        <input type="number" placeholder="Total Amount ($)" value={total} onChange={(e) => setTotal(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date</label>
          <input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg mt-1" required />
        </div>
      </div>
      <div className="flex justify-end space-x-4 mt-6">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-yellow-500 text-white rounded-lg">Save Invoice</button>
      </div>
    </form>
  );
};

export default AddInvoiceForm;