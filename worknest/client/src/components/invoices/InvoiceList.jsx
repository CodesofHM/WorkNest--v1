import React from 'react';
import { CalendarDays, Edit, MessageSquare, MoreVertical, Trash2, WalletCards } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/DropdownMenu';
import Spinner from '../ui/Spinner';

const InvoiceList = ({ invoices, loading, onEdit, onDelete, onChangeStatus, onCommunicate }) => {
  if (loading) return <div className="flex h-40 items-center justify-center"><Spinner /></div>;
  if (invoices.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
        <p className="text-lg font-medium text-slate-900">No invoices yet</p>
        <p className="mt-2 text-sm text-slate-500">Create your first invoice to track billing and payment follow-ups.</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
    <div className="space-y-3 md:hidden">
      {invoices.map((inv) => (
        <div key={inv.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">{inv.clientName}</p>
              <p className="mt-1 inline-flex items-center gap-2 text-sm text-slate-500"><WalletCards className="h-3.5 w-3.5" />Rs. {Number(inv.total || 0).toFixed(2)}</p>
            </div>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(inv.status)}`}>
              {inv.status}
            </span>
          </div>
          <p className="mt-3 inline-flex items-center gap-2 text-sm text-slate-500"><CalendarDays className="h-3.5 w-3.5" />{inv.dueDate}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
            <button onClick={() => onEdit?.(inv)} className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">Edit</button>
            <button onClick={() => onCommunicate?.(inv)} className="rounded-full bg-sky-50 px-3 py-1.5 text-sky-700">Message</button>
            <button onClick={() => onChangeStatus?.(inv, 'Paid')} className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700">Mark Paid</button>
            <button onClick={() => onDelete?.(inv)} className="rounded-full bg-rose-50 px-3 py-1.5 text-rose-700">Delete</button>
          </div>
        </div>
      ))}
    </div>
    <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block">
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-slate-200 bg-slate-50">
          <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Client</th>
          <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Amount</th>
          <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Due Date</th>
          <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Status</th>
          <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 bg-white">
        {invoices.map(inv => (
          <tr key={inv.id} className="hover:bg-slate-50/70">
            <td className="px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">{inv.clientName}</p>
                <p className="mt-1 text-sm text-slate-500">Invoice status and communication tracking</p>
              </div>
            </td>
            <td className="px-5 py-4 text-gray-600">
              <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                <WalletCards className="h-3.5 w-3.5" />
                Rs. {Number(inv.total || 0).toFixed(2)}
              </span>
            </td>
            <td className="px-5 py-4 text-gray-600">
              <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                <CalendarDays className="h-3.5 w-3.5" />
                {inv.dueDate}
              </span>
            </td>
            <td className="px-5 py-4">
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(inv.status)}`}>
                {inv.status}
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
                  <DropdownMenuItem onSelect={() => onEdit?.(inv)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => onCommunicate?.(inv)}>
                    <MessageSquare className="mr-2 h-4 w-4" /> Payment Message
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => onChangeStatus?.(inv, 'Pending')}>Mark Pending</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => onChangeStatus?.(inv, 'Paid')}>Mark Paid</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => onChangeStatus?.(inv, 'Overdue')}>Mark Overdue</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => onDelete?.(inv)} className="text-red-600">
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

export default InvoiceList;
