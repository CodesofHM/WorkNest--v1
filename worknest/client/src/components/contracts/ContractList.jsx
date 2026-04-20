import React from 'react';
import { CalendarDays, Edit, FileText, MoreVertical, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/DropdownMenu';
import Spinner from '../ui/Spinner';

const ContractList = ({ contracts, loading, onEdit, onDelete }) => {
  if (loading) return <div className="flex h-40 items-center justify-center"><Spinner /></div>;
  if (contracts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
        <p className="text-lg font-medium text-slate-900">No contracts yet</p>
        <p className="mt-2 text-sm text-slate-500">Create your first contract to keep project agreements formal and easy to track.</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Signed':
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800';
      case 'Active':
      case 'Sent':
        return 'bg-sky-100 text-sky-800';
      case 'Draft':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-amber-100 text-amber-800';
    }
  };

  return (
    <>
    <div className="space-y-3 md:hidden">
      {contracts.map((c) => (
        <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">{c.title}</p>
              <p className="mt-1 text-sm text-slate-500">{c.clientName}</p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusColor(c.status)}`}>
              {c.status}
            </span>
          </div>
          <p className="mt-3 inline-flex items-center gap-2 text-sm text-slate-500">
            <FileText className="h-3.5 w-3.5" />
            Agreement record ready for review
          </p>
          <div className="mt-4 flex gap-2">
            <button onClick={() => onEdit?.(c)} className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">Edit</button>
            <button onClick={() => onDelete?.(c)} className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700">Delete</button>
          </div>
        </div>
      ))}
    </div>
    <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block">
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-slate-200 bg-slate-50">
          <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Contract</th>
          <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Client</th>
          <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Status</th>
          <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 bg-white">
        {contracts.map(c => (
          <tr key={c.id} className="hover:bg-slate-50/70">
            <td className="px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">{c.title}</p>
                <p className="mt-1 inline-flex items-center gap-2 text-sm text-slate-500">
                  <FileText className="h-3.5 w-3.5" />
                  Agreement record ready for review
                </p>
              </div>
            </td>
            <td className="px-5 py-4 text-sm text-slate-600">{c.clientName}</td>
            <td className="px-5 py-4">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusColor(c.status)}`}>
                {c.status}
              </span>
            </td>
            <td className="px-5 py-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-gray-500 hover:text-gray-700">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => onEdit?.(c)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => onDelete?.(c)} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
    </>
  );
};

export default ContractList;
