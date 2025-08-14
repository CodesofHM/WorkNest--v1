// File: worknest/client/src/components/templates/TemplateList.jsx
import React from 'react';

const TemplateList = ({ templates, loading, onDelete }) => {
  if (loading) return <p>Loading templates...</p>;
  if (templates.length === 0) return <p>No pricing templates found. Click "New Template" to create one.</p>;

  return (
    <div className="space-y-4">
      {templates.map(template => (
        <div key={template.id} className="border rounded-lg p-4 flex justify-between items-center">
          <div>
            <h4 className="font-semibold">{template.templateName}</h4>
            <p className="text-sm text-gray-500">{template.lineItems.length} items</p>
          </div>
          <button onClick={() => onDelete(template.id)} className="text-red-500 hover:underline text-sm">Delete</button>
        </div>
      ))}
    </div>
  );
};

export default TemplateList;