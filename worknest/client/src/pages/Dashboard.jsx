import React, { useState, useEffect } from 'react';
import { getClients, getProposals, getInvoices } from '../services/firestoreService';
import StatCard from '../components/dashboard/StatCard';
import QuickActions from '../components/dashboard/QuickActions';

// Icons...
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.975 5.975 0 0112 13a5.975 5.975 0 01-3 5.197M15 21a9 9 0 100-18 9 9 0 000 18zm-9-5.197a9 9 0 100-18 9 9 0 000 18z" /></svg>;
const DocumentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const InvoiceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0z" /></svg>;

const Dashboard = () => {
  // ... (your state and useEffect hooks remain the same)
  const [clients, setClients] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsData, proposalsData, invoicesData] = await Promise.all([ getClients(), getProposals(), getInvoices() ]);
        setClients(clientsData); setProposals(proposalsData); setInvoices(invoicesData);
      } catch (error) { console.error("Error fetching dashboard data:", error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const paidInvoicesTotal = invoices.filter(inv => inv.status === 'Paid').reduce((sum, inv) => sum + inv.total, 0);
  const pendingInvoicesTotal = invoices.filter(inv => inv.status === 'Pending').reduce((sum, inv) => sum + inv.total, 0);

  if (loading) { return <div className="p-8">Loading Dashboard...</div>; }

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Clients" value={clients.length} icon={<UsersIcon />} />
        <StatCard title="Proposals Sent" value={proposals.length} icon={<DocumentIcon />} />
        <StatCard title="Paid Invoices" value={`₹${paidInvoicesTotal.toFixed(2)}`} icon={<InvoiceIcon />} />
        <StatCard title="Pending Invoices" value={`₹${pendingInvoicesTotal.toFixed(2)}`} icon={<InvoiceIcon />} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <p className="text-gray-500">Activity feed will be displayed here...</p>
        </div>
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;