// File: worknest/client/src/components/templates/AddTemplateForm.jsx
import React, { useState } from 'react';

const AddTemplateForm = ({ onSave, onCancel }) => {
  const [templateName, setTemplateName] = useState('');
  const [lineItems, setLineItems] = useState([{ service: '', qty: 1, rate: 0 }]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ templateName, lineItems });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-xl font-semibold mb-4">New Pricing Template</h3>
      <div className="space-y-4">
        <input type="text" placeholder="Template Name (e.g., Basic Website Package)" value={templateName} onChange={(e) => setTemplateName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
        
        <h4 className="font-semibold pt-2">Line Items</h4>
        {lineItems.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input type="text" placeholder="Service Description" value={item.service} onChange={(e) => handleItemChange(index, 'service', e.target.value)} className="flex-grow px-3 py-2 border rounded-lg" required />
            <input type="number" placeholder="Qty" value={item.qty} onChange={(e) => handleItemChange(index, 'qty', Number(e.target.value))} className="w-20 px-3 py-2 border rounded-lg" required />
            <input type="number" placeholder="Rate ($)" value={item.rate} onChange={(e) => handleItemChange(index, 'rate', Number(e.target.value))} className="w-24 px-3 py-2 border rounded-lg" required />
            <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 p-2">&times;</button>
          </div>
        ))}
        <button type="button" onClick={addItem} className="text-sm text-blue-600 hover:underline">+ Add Item</button>
      </div>
      <div className="flex justify-end space-x-4 mt-6">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-indigo-500 text-white rounded-lg">Save Template</button>
      </div>
    </form>
  );
};

export default AddTemplateForm;