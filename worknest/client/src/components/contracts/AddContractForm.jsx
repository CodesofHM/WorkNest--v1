// File: worknest/client/src/components/contracts/AddContractForm.jsx
import React, { useState } from 'react';

const AddContractForm = ({ clients, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState('');
  const [terms, setTerms] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const client = clients.find(c => c.id === clientId);
    onSave({ title, clientId, clientName: client.name, terms });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-xl font-semibold mb-4">New Contract</h3>
      <div className="space-y-4">
        <input type="text" placeholder="Contract Title (e.g., Service Agreement)" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
        <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required>
          <option value="" disabled>Select a Client</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>{client.name}</option>
          ))}
        </select>
        <textarea placeholder="Enter contract terms here..." value={terms} onChange={(e) => setTerms(e.target.value)} className="w-full px-3 py-2 border rounded-lg h-40" />
      </div>
      <div className="flex justify-end space-x-4 mt-6">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-purple-500 text-white rounded-lg">Save Contract</button>
      </div>
    </form>
  );
};

export default AddContractForm;