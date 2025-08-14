// File: worknest/client/src/components/invoices/InvoiceList.jsx
import React from 'react';

const InvoiceList = ({ invoices, loading }) => {
  if (loading) return <p>Loading invoices...</p>;
  if (invoices.length === 0) return <p>No invoices found. Click "New Invoice" to start.</p>;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b bg-gray-50">
          <th className="p-4">Client</th>
          <th className="p-4">Amount</th>
          <th className="p-4">Due Date</th>
          <th className="p-4">Status</th>
        </tr>
      </thead>
      <tbody>
        {invoices.map(inv => (
          <tr key={inv.id} className="border-b hover:bg-gray-50">
            <td className="p-4 font-medium">{inv.clientName}</td>
            <td className="p-4 text-gray-600">${inv.total.toFixed(2)}</td>
            <td className="p-4 text-gray-600">{inv.dueDate}</td>
            <td className="p-4">
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(inv.status)}`}>
                {inv.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default InvoiceList;