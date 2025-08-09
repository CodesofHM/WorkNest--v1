// File: worknest/client/src/components/proposals/ProposalList.jsx
import React from 'react';

const ProposalList = ({ proposals, loading, onEdit, onDelete }) => {
  if (loading) return <p>Loading proposals...</p>;
  if (proposals.length === 0) return <p>No proposals found. Try adjusting your filter.</p>;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Accepted': return 'bg-green-100 text-green-800';
      case 'Ready to Send': return 'bg-blue-100 text-blue-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800'; // Draft
    }
  };

  // UPDATED: This function now correctly handles Firestore's timestamp object
  const formatDate = (timestamp) => {
    if (!timestamp || typeof timestamp.toDate !== 'function') {
      return 'N/A';
    }
    // Use the .toDate() method to convert the Firestore timestamp to a JavaScript Date
    return timestamp.toDate().toLocaleDateString();
  };

  return (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b bg-gray-50">
          <th className="p-4">Project Title</th>
          <th className="p-4">Client</th>
          <th className="p-4">Amount</th>
          <th className="p-4">Date</th>
          <th className="p-4">Status</th>
          <th className="p-4">Actions</th>
        </tr>
      </thead>
      <tbody>
        {proposals.map(p => (
          <tr key={p.id} className="border-b hover:bg-gray-50">
            <td className="p-4 font-medium">{p.title}</td>
            <td className="p-4 text-gray-600">{p.clientName}</td>
            <td className="p-4 text-gray-600">${p.total.toFixed(2)}</td>
            <td className="p-4 text-gray-600">{formatDate(p.createdAt)}</td>
            <td className="p-4">
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(p.status)}`}>
                {p.status}
              </span>
            </td>
            <td className="p-4">
              <div className="flex space-x-2">
                <button onClick={() => onEdit(p)} className="text-blue-600 hover:underline">Edit</button>
                <button onClick={() => onDelete(p.id)} className="text-red-600 hover:underline">Delete</button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ProposalList;