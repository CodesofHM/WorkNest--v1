import React, { useEffect, useState } from 'react';
import StatCard from '../components/dashboard/StatCard';
import QuickActions from '../components/dashboard/QuickActions';
import RecentActivity from '../components/dashboard/RecentActivity';
import RevenueChart from '../components/dashboard/RevenueChart';
import { DollarSign, Users, FileText, CheckSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { getClientsForUser } from '../services/clientService';
import { getInvoicesForUser } from '../services/invoiceService';
import { getProposalsForUser } from '../services/proposalService';
import { getContractsForUser } from '../services/contractService';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeClients: 0,
    pendingProposals: 0,
    completedProjects: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        const [clients, invoices, proposals, contracts] = await Promise.all([
          getClientsForUser(currentUser.uid),
          getInvoicesForUser(currentUser.uid),
          getProposalsForUser(currentUser.uid),
          getContractsForUser(currentUser.uid),
        ]);

        const paidInvoices = invoices.filter(i => i.status === 'Paid' || i.status === 'paid');
        const totalRevenue = paidInvoices.reduce((sum, inv) => sum + (parseFloat(inv.total || inv.amount || 0) || 0), 0);

        // Build simple monthly revenue buckets (by invoice.createdAt month)
        const monthMap = {};
        paidInvoices.forEach(inv => {
          const d = inv.createdAt && inv.createdAt.toDate ? inv.createdAt.toDate() : new Date();
          const key = d.toLocaleString('default', { month: 'short', year: 'numeric' });
          monthMap[key] = (monthMap[key] || 0) + (parseFloat(inv.total || inv.amount || 0) || 0);
        });
        const chartData = Object.keys(monthMap).map(key => ({ name: key, total: monthMap[key] }));

        setStats({
          totalRevenue,
          activeClients: clients.length,
          pendingProposals: proposals.filter(p => p.status === 'Draft' || p.status === 'Pending' || p.status === 'Ready' ? p.status !== 'Accepted' : false).length,
          completedProjects: contracts.filter(c => c.status === 'Completed' || c.status === 'complete').length,
        });

        setRevenueData(chartData.reverse());
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [currentUser]);

  return (
    <div className="space-y-6">
      {/* Stat Cards - No change here, but they will look better in the new layout */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={loading ? 'Loading...' : `₹${stats.totalRevenue.toFixed(2)}`}
          icon={<DollarSign className="h-5 w-5 text-muted-foreground" />}
          change="Compared to last period"
        />
        <StatCard
          title="Active Clients"
          value={loading ? '...' : String(stats.activeClients)}
          icon={<Users className="h-5 w-5 text-muted-foreground" />}
          change="Clients you interact with"
        />
        <StatCard
          title="Pending Proposals"
          value={loading ? '...' : String(stats.pendingProposals)}
          icon={<FileText className="h-5 w-5 text-muted-foreground" />}
          change="Awaiting action"
        />
        <StatCard
          title="Completed Projects"
          value={loading ? '...' : String(stats.completedProjects)}
          icon={<CheckSquare className="h-5 w-5 text-muted-foreground" />}
          change="Finished contracts/projects"
        />
      </div>

      {/* NEW Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left (Wider) Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent>
                  <RevenueChart data={revenueData} />
            </CardContent>
          </Card>
          <QuickActions />
        </div>

        {/* Right (Narrower) Column */}
        <div className="lg:col-span-1">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;