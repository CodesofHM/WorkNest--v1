// File: worknest/client/src/components/clients/AddClientForm.jsx

import React, { useState, useEffect } from 'react';

const AddClientForm = ({ onSave, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', company: '', address: '',
    communicationChannel: 'Email', notes: '', status: 'Active',
  });
  // NEW: Separate state to handle the tags string
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '', email: initialData.email || '',
        phone: initialData.phone || '', company: initialData.company || '',
        address: initialData.address || '', communicationChannel: initialData.communicationChannel || 'Email',
        notes: initialData.notes || '', status: initialData.status || 'Active',
      });
      // Convert the tags array back to a comma-separated string for editing
      setTagsInput((initialData.tags || []).join(', '));
    } else {
      // Reset form for new client
      setFormData({
        name: '', email: '', phone: '', company: '', address: '',
        communicationChannel: 'Email', notes: '', status: 'Active'
      });
      setTagsInput('');
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setFormData({ ...formData, [name]: value.replace(/[^0-9]/g, '') });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convert the comma-separated string into an array of trimmed, non-empty tags
    const tagsArray = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
    onSave({ ...formData, tags: tagsArray });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-xl font-semibold mb-6">
        {initialData ? 'Edit Client' : 'Add New Client'}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* ... (other input fields remain the same) ... */}
        <input name="name" type="text" placeholder="Full Name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
        <input name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
        <input name="phone" type="tel" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
        <input name="company" type="text" placeholder="Company Name" value={formData.company} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
        <input name="address" type="text" placeholder="Address" value={formData.address} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg md:col-span-2" />
        <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <select name="communicationChannel" value={formData.communicationChannel} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
          <option value="Email">Preferred Contact: Email</option>
          <option value="WhatsApp">Preferred Contact: WhatsApp</option>
          <option value="Call">Preferred Contact: Call</option>
        </select>

        {/* NEW: Tags Input Field */}
        <input
          name="tags"
          type="text"
          placeholder="Tags (e.g., High Value, Repeat)"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg md:col-span-2"
        />

        <textarea name="notes" placeholder="Notes (special requirements, etc.)" value={formData.notes} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg md:col-span-2 h-24" />
      </div>
      <div className="flex justify-end space-x-4 mt-6">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Client</button>
      </div>
    </form>
  );
};

export default AddClientForm;