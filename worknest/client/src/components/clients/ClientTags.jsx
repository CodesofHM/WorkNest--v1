// File: worknest/client/src/components/clients/ClientTags.jsx

import React, { useState } from 'react';

const ClientTags = ({ tags, onUpdateTags }) => {
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      onUpdateTags([...tags, newTag]);
    }
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove) => {
    onUpdateTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Tags</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        {tags && tags.length > 0 ? (
          tags.map(tag => (
            <span key={tag} className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {tag}
              <button onClick={() => handleRemoveTag(tag)} className="ml-2 text-blue-600 hover:text-blue-800">&times;</button>
            </span>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No tags yet.</p>
        )}
      </div>
      <div className="flex space-x-2">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Add a new tag..."
          className="w-full px-3 py-2 border rounded-lg"
        />
        <button onClick={handleAddTag} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add</button>
      </div>
    </div>
  );
};

export default ClientTags;