import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';

const AddClientForm = ({ onSave, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', company: '', address: '',
    communicationChannel: 'Email', notes: '', status: 'Active',
  });
  const [tagsInput, setTagsInput] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '', email: initialData.email || '',
        phone: initialData.phone || '', company: initialData.company || '',
        address: initialData.address || '', communicationChannel: initialData.communicationChannel || 'Email',
        notes: initialData.notes || '', status: initialData.status || 'Active',
      });
      setTagsInput((initialData.tags || []).join(', '));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    const tagsArray = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
    onSave({ ...formData, tags: tagsArray });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Client' : 'Add New Client'}</CardTitle>
        <CardDescription>Fill in the details below to manage your client information.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name *</label>
              <Input id="name" name="name" type="text" placeholder="e.g., John Doe" value={formData.name} onChange={handleChange} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email *</label>
              <Input id="email" name="email" type="email" placeholder="e.g., john.doe@example.com" value={formData.email} onChange={handleChange} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <Input name="phone" type="tel" placeholder="Phone Number" value={formData.phone} onChange={handleChange} />
            <Input name="company" type="text" placeholder="Company Name" value={formData.company} onChange={handleChange} />
          </div>
          <Input name="address" type="text" placeholder="Address" value={formData.address} onChange={handleChange} className="w-full" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select name="status" value={formData.status} onChange={handleChange}>
              <option value="Active">Status: Active</option>
              <option value="Inactive">Status: Inactive</option>
            </Select>
            <Select name="communicationChannel" value={formData.communicationChannel} onChange={handleChange}>
              <option value="Email">Preferred Contact: Email</option>
              <option value="WhatsApp">Preferred Contact: WhatsApp</option>
              <option value="Call">Preferred Contact: Call</option>
            </Select>
          </div>
          
          {/* THE FIX IS HERE: Corrected 'e.targe.value' to 'e.target.value' */}
          <Input 
            name="tags" 
            type="text" 
            placeholder="Tags (comma-separated, e.g., High Value, Repeat)" 
            value={tagsInput} 
            onChange={(e) => setTagsInput(e.target.value)} 
          />

          <textarea name="notes" placeholder="Notes (special requirements, etc.)" value={formData.notes} onChange={handleChange} className="w-full px-3 py-2 border rounded-md bg-background text-sm h-24" />
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Save Client</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AddClientForm;