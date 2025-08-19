import React from 'react';
import { Link } from 'react-router-dom';
import Spinner from '../ui/Spinner';

const SortIcon = ({ direction }) => {
  if (!direction) return null;
  return direction === 'ascending' ? '▲' : '▼';
};

const ClientList = ({ clients, loading, onEdit, onDelete, onSort, sortConfig }) => {
  if (loading) return <div className="flex justify-center items-center h-40"><Spinner /></div>;
  if (clients.length === 0) return <p>No clients found. Try adjusting your search or filter.</p>;

  const SortableHeader = ({ label, sortKey }) => (
    <th className="p-4 cursor-pointer" onClick={() => onSort(sortKey)}>
      {label}
      <span className="ml-2">
        {sortConfig.key === sortKey && <SortIcon direction={sortConfig.direction} />}
      </span>
    </th>
  );

  return (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b bg-gray-50">
          <SortableHeader label="Name" sortKey="name" />
          <th className="p-4">Tags</th>
          <th className="p-4">Status</th>
          <th className="p-4">Actions</th>
        </tr>
      </thead>
      <tbody>
        {clients.map(client => (
          <tr key={client.id} className="border-b hover:bg-gray-50">
            <td className="p-4 font-medium">
              <Link to={`/clients/${client.id}`} className="text-blue-600 hover:underline">
                {client.name}
              </Link>
              <p className="text-sm text-gray-500">{client.company}</p>
            </td>
            <td className="p-4">
              <div className="flex flex-wrap gap-1">
                {(client.tags || []).map(tag => (
                  <span key={tag} className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </td>
            <td className="p-4">
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                client.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {client.status}
              </span>
            </td>
            <td className="p-4">
              <div className="flex space-x-2">
                <button onClick={() => onEdit(client)} className="text-blue-600 hover:underline">Edit</button>
                <button onClick={() => onDelete(client.id)} className="text-red-600 hover:underline">Delete</button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ClientList;