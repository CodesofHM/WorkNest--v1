// File: worknest/client/src/components/contracts/ContractList.jsx
import React from 'react';

const ContractList = ({ contracts, loading }) => {
  if (loading) return <p>Loading contracts...</p>;
  if (contracts.length === 0) return <p>No contracts found. Click "New Contract" to start.</p>;

  return (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b bg-gray-50">
          <th className="p-4">Title</th>
          <th className="p-4">Client</th>
          <th className="p-4">Status</th>
        </tr>
      </thead>
      <tbody>
        {contracts.map(c => (
          <tr key={c.id} className="border-b hover:bg-gray-50">
            <td className="p-4 font-medium">{c.title}</td>
            <td className="p-4 text-gray-600">{c.clientName}</td>
            <td className="p-4 text-gray-600">{c.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ContractList;