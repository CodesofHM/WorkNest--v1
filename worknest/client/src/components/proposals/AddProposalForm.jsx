// File: worknest/client/src/components/proposals/AddProposalForm.jsx
import React, { useState, useEffect } from 'react';

const AddProposalForm = ({ clients, onSave, onCancel, initialData }) => {
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState('');
  const [lineItems, setLineItems] = useState([{ service: '', qty: 1, rate: 0 }]);
  const [notes, setNotes] = useState('');
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setClientId(initialData.clientId || '');
      setLineItems(initialData.lineItems || [{ service: '', qty: 1, rate: 0 }]);
      setNotes(initialData.notes || '');
      setTaxRate(initialData.taxRate || 0);
      setDiscount(initialData.discount || 0);
    } else {
      setTitle(''); setClientId(''); setLineItems([{ service: '', qty: 1, rate: 0 }]);
      setNotes(''); setTaxRate(0); setDiscount(0);
    }
  }, [initialData]);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...lineItems];
    updatedItems[index][field] = value;
    setLineItems(updatedItems);
  };

  const addItem = () => {
    setLineItems([...lineItems, { service: '', qty: 1, rate: 0 }]);
  };

  const removeItem = (index) => {
    const updatedItems = lineItems.filter((_, i) => i !== index);
    setLineItems(updatedItems);
  };

  const subtotal = lineItems.reduce((sum, item) => sum + (item.qty * item.rate), 0);
  const taxAmount = subtotal * (taxRate / 100);
  const grandTotal = subtotal + taxAmount - discount;

  const handleSubmit = (status) => {
    const client = clients.find(c => c.id === clientId);
    const proposalData = {
      title, clientId, clientName: client.name, lineItems, notes,
      subtotal, taxRate, taxAmount, discount, total: grandTotal, status,
    };
    onSave(proposalData);
  };

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <h3 className="text-xl font-semibold mb-6">{initialData ? 'Edit Proposal' : 'New Proposal'}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <input type="text" placeholder="Project Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
        <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required>
          <option value="" disabled>Select a Client</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>{client.name}</option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold mb-2">Services</h4>
        {lineItems.map((item, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <input type="text" placeholder="Service Description" value={item.service} onChange={(e) => handleItemChange(index, 'service', e.target.value)} className="flex-grow px-3 py-2 border rounded-lg" required />
            <input type="number" placeholder="Qty" value={item.qty} onChange={(e) => handleItemChange(index, 'qty', Number(e.target.value))} className="w-20 px-3 py-2 border rounded-lg" required />
            <input type="number" placeholder="Rate ($)" value={item.rate} onChange={(e) => handleItemChange(index, 'rate', Number(e.target.value))} className="w-24 px-3 py-2 border rounded-lg" required />
            <p className="w-24 text-right pr-2">${(item.qty * item.rate).toFixed(2)}</p>
            <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700">&times;</button>
          </div>
        ))}
        <button type="button" onClick={addItem} className="text-sm text-blue-600 hover:underline mt-2">+ Add Item</button>
      </div>
      
      <div className="flex justify-end mb-6">
        <div className="w-full max-w-xs space-y-2">
          <div className="flex justify-between"><span>Subtotal:</span> <span>${subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between items-center">
            <span>Tax (%):</span>
            <input type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} className="w-24 px-2 py-1 border rounded-lg" />
          </div>
          <div className="flex justify-between items-center">
            <span>Discount ($):</span>
            <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="w-24 px-2 py-1 border rounded-lg" />
          </div>
          <div className="flex justify-between font-bold text-xl border-t pt-2">
            <span>Grand Total:</span> <span>${grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <textarea placeholder="Notes / Terms & Conditions" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-3 py-2 border rounded-lg h-24 mb-6" />

      <div className="flex justify-end space-x-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
        <button type="button" onClick={() => handleSubmit('Draft')} className="px-4 py-2 bg-gray-500 text-white rounded-lg">Save as Draft</button>
        {/* UPDATED: Button text and status */}
        <button type="button" onClick={() => handleSubmit('Ready to Send')} className="px-4 py-2 bg-green-500 text-white rounded-lg">Save as Ready</button>
      </div>
    </form>
  );
};

export default AddProposalForm;