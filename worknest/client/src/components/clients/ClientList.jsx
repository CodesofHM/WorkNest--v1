import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, Tags } from 'lucide-react';
import Spinner from '../ui/Spinner';

const SortIcon = ({ direction }) => {
  if (!direction) return null;
  return direction === 'ascending' ? '▲' : '▼';
};

const ClientList = ({ clients, loading, onEdit, onDelete, onSort, sortConfig }) => {
  if (loading) return <div className="flex justify-center items-center h-40"><Spinner /></div>;
  if (clients.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
        <p className="text-lg font-medium text-slate-900">No clients found</p>
        <p className="mt-2 text-sm text-slate-500">Try adjusting your search or add your first client to start tracking relationships.</p>
      </div>
    );
  }

  const SortableHeader = ({ label, sortKey }) => (
    <th className="px-5 py-4 cursor-pointer text-xs font-semibold uppercase tracking-[0.2em] text-slate-500" onClick={() => onSort(sortKey)}>
      {label}
      <span className="ml-2">
        {sortConfig.key === sortKey && <SortIcon direction={sortConfig.direction} />}
      </span>
    </th>
  );

  return (
    <>
    <div className="space-y-3 md:hidden">
      {clients.map((client) => (
        <div key={client.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sm font-semibold text-sky-700">
              {(client.name || '?').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <Link to={`/clients/${client.id}`} className="text-sm font-semibold text-slate-900 hover:text-sky-700">
                {client.name}
              </Link>
              <p className="mt-1 flex items-center gap-2 text-sm text-slate-500"><Building2 className="h-3.5 w-3.5" />{client.company || 'Independent client'}</p>
              <p className="mt-1 flex items-center gap-2 text-sm text-slate-500"><Mail className="h-3.5 w-3.5" />{client.email}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {(client.tags || []).length ? (client.tags || []).map((tag) => (
              <span key={tag} className="rounded-full bg-sky-100 px-2 py-1 text-xs font-medium text-sky-800">{tag}</span>
            )) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500"><Tags className="h-3 w-3" />No tags</span>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${client.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {client.status}
            </span>
            <div className="flex gap-4 text-sm">
              <button onClick={() => onEdit(client)} className="text-blue-600 hover:underline">Edit</button>
              <button onClick={() => onDelete(client.id)} className="text-red-600 hover:underline">Delete</button>
            </div>
          </div>
        </div>
      ))}
    </div>
    <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block">
    <table className="w-full text-left">
      <thead className="bg-slate-50">
        <tr className="border-b border-slate-200">
          <SortableHeader label="Name" sortKey="name" />
          <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Tags</th>
          <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Status</th>
          <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 bg-white">
        {clients.map(client => (
          <tr key={client.id} className="hover:bg-slate-50/70">
            <td className="px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sm font-semibold text-sky-700">
                  {(client.name || '?').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <Link to={`/clients/${client.id}`} className="text-sm font-semibold text-slate-900 transition hover:text-sky-700 hover:underline">
                    {client.name}
                  </Link>
                  <div className="mt-1 space-y-1 text-sm text-slate-500">
                    <p className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5" />
                      {client.company || 'Independent client'}
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5" />
                      {client.email}
                    </p>
                  </div>
                </div>
              </div>
            </td>
            <td className="px-5 py-4">
              <div className="flex flex-wrap gap-1">
                {(client.tags || []).length ? (client.tags || []).map(tag => (
                  <span key={tag} className="px-2 py-1 text-xs font-medium bg-sky-100 text-sky-800 rounded-full">
                    {tag}
                  </span>
                )) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
                    <Tags className="h-3 w-3" />
                    No tags
                  </span>
                )}
              </div>
            </td>
            <td className="px-5 py-4">
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                client.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {client.status}
              </span>
            </td>
            <td className="px-5 py-4">
              <div className="flex space-x-2">
                <button onClick={() => onEdit(client)} className="text-blue-600 hover:underline">Edit</button>
                <button onClick={() => onDelete(client.id)} className="text-red-600 hover:underline">Delete</button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
    </>
  );
};

export default ClientList;
