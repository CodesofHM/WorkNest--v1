// File: worknest/client/src/pages/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getClientsForUser, getProposalsForUser, getInvoicesForUser } from '../services/firestoreService';
import StatCard from '../components/dashboard/StatCard';
import QuickActions from '../components/dashboard/QuickActions';
import RecentActivity from '../components/dashboard/RecentActivity';
import RevenueChart from '../components/dashboard/RevenueChart';
import { Users, FileText, Receipt } from 'lucide-react';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [clients, setClients] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        try {
          const [clientsData, proposalsData, invoicesData] = await Promise.all([
            getClientsForUser(currentUser.uid),
            getProposalsForUser(currentUser.uid),
            getInvoicesForUser(currentUser.uid),
          ]);
          setClients(clientsData);
          setProposals(proposalsData);
          setInvoices(invoicesData);
          
          const monthlyRevenue = {};
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          
          invoicesData.forEach(invoice => {
            // Check if status is 'Paid' and paidAt exists and is a valid timestamp
            if (invoice.status === 'Paid' && invoice.paidAt && typeof invoice.paidAt.toDate === 'function') {
              const date = invoice.paidAt.toDate();
              const month = date.getMonth();
              const year = date.getFullYear();
              const key = `${year}-${month}`;
              
              if (!monthlyRevenue[key]) {
                monthlyRevenue[key] = { name: monthNames[month], total: 0 };
              }
              monthlyRevenue[key].total += invoice.total;
            }
          });
          setChartData(Object.values(monthlyRevenue));

        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [currentUser]);

  const paidInvoicesTotal = invoices.filter(inv => inv.status === 'Paid').reduce((sum, inv) => sum + inv.total, 0);
  const pendingInvoicesTotal = invoices.filter(inv => inv.status === 'Pending').reduce((sum, inv) => sum + inv.total, 0);

  if (loading) {
    return <div className="p-8">Loading Dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Clients" value={clients.length} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Proposals Sent" value={proposals.length} icon={<FileText className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Paid Invoices" value={`₹${paidInvoicesTotal.toFixed(2)}`} icon={<Receipt className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Pending Invoices" value={`₹${pendingInvoicesTotal.toFixed(2)}`} icon={<Receipt className="h-4 w-4 text-muted-foreground" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={chartData} />
        </div>
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>
      
      <div>
        <RecentActivity />
      </div>
    </div>
  );
};

export default Dashboard;
  