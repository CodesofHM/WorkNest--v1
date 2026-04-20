// File: worknest/client/src/components/templates/AddTemplateForm.jsx
import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';

const AddTemplateForm = ({ onSave, onCancel, initialData }) => {
  const [templateName, setTemplateName] = useState(initialData?.templateName || '');
  const [lineItems, setLineItems] = useState(initialData?.lineItems || [{ service: '', qty: 1, rate: 0 }]);

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
    <Card className="mx-auto w-full max-w-3xl">
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Pricing Template' : 'New Pricing Template'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4">
        <Input type="text" placeholder="Template Name (e.g., Basic Website Package)" value={templateName} onChange={(e) => setTemplateName(e.target.value)} required />

        <h4 className="font-semibold pt-2">Line Items</h4>
          <div className="flex items-center space-x-2 text-sm font-medium text-gray-500 px-1">
          <div className="flex-grow">Service Description</div>
          <div className="w-20">Qty</div>
          <div className="w-24">Rate ($)</div>
          <div className="w-10 text-transparent">Remove</div>
        </div>
        {lineItems.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Input type="text" placeholder="Service Description" value={item.service} onChange={(e) => handleItemChange(index, 'service', e.target.value)} className="flex-grow" required />
            <Input type="number" placeholder="Qty" value={item.qty} onChange={(e) => handleItemChange(index, 'qty', Number(e.target.value))} className="w-20" required />
            <Input type="number" placeholder="Rate ($)" value={item.rate} onChange={(e) => handleItemChange(index, 'rate', Number(e.target.value))} className="w-24" required />
            <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 p-2">&times;</button>
          </div>
        ))}
        <button type="button" onClick={addItem} className="text-sm text-blue-600 hover:underline">+ Add Item</button>
      </CardContent>
      <CardFooter className="justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initialData ? 'Update Template' : 'Save Template'}</Button>
      </CardFooter>
    </form>
    </Card>
  );
};

export default AddTemplateForm;
