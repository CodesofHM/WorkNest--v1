import React, { useEffect, useState } from 'react';
import { AlertTriangle, DollarSign, FileText, CheckSquare, TrendingUp, Users } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import QuickActions from '../components/dashboard/QuickActions';
import RecentActivity from '../components/dashboard/RecentActivity';
import RevenueChart from '../components/dashboard/RevenueChart';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { getClientsForUser } from '../services/clientService';
import { getInvoicesForUser } from '../services/invoiceService';
import { getProposalsForUser } from '../services/proposalService';
import { getContractsForUser } from '../services/contractService';
import { getDailyBusinessQuote } from '../services/dashboardService';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeClients: 0,
    pendingProposals: 0,
    completedProjects: 0,
    outstandingRevenue: 0,
    overdueInvoices: 0,
    proposalWinRate: 0,
    averageInvoiceValue: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [proposalBreakdown, setProposalBreakdown] = useState({ draft: 0, accepted: 0, declined: 0, ready: 0 });
  const [invoiceWatchlist, setInvoiceWatchlist] = useState([]);
  const [topClients, setTopClients] = useState([]);
  const [dailyQuote, setDailyQuote] = useState(null);
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

        const paidInvoices = invoices.filter((invoice) => invoice.status === 'Paid' || invoice.status === 'paid');
        const overdueInvoices = invoices.filter((invoice) => invoice.status === 'Overdue');
        const unpaidInvoices = invoices.filter((invoice) => invoice.status !== 'Paid' && invoice.status !== 'paid');
        const totalRevenue = paidInvoices.reduce((sum, invoice) => sum + (parseFloat(invoice.total || invoice.amount || 0) || 0), 0);
        const outstandingRevenue = unpaidInvoices.reduce((sum, invoice) => sum + (parseFloat(invoice.total || invoice.amount || 0) || 0), 0);
        const averageInvoiceValue = invoices.length
          ? invoices.reduce((sum, invoice) => sum + (parseFloat(invoice.total || invoice.amount || 0) || 0), 0) / invoices.length
          : 0;
        const acceptedProposals = proposals.filter((proposal) => proposal.status === 'Accepted').length;
        const activeProposals = proposals.filter((proposal) => proposal.status && proposal.status !== 'Draft').length;
        const proposalWinRate = activeProposals ? Math.round((acceptedProposals / activeProposals) * 100) : 0;

        const monthMap = {};
        paidInvoices.forEach((invoice) => {
          const createdAt = invoice.createdAt && invoice.createdAt.toDate ? invoice.createdAt.toDate() : new Date();
          const key = createdAt.toLocaleString('default', { month: 'short', year: 'numeric' });
          monthMap[key] = (monthMap[key] || 0) + (parseFloat(invoice.total || invoice.amount || 0) || 0);
        });
        const chartData = Object.keys(monthMap).map((key) => ({ name: key, total: monthMap[key] }));

        const rankedClients = clients
          .map((client) => {
            const clientInvoices = invoices.filter((invoice) => invoice.clientId === client.id);
            const clientProposals = proposals.filter((proposal) => proposal.clientId === client.id);
            const clientContracts = contracts.filter((contract) => contract.clientId === client.id);
            const totalBilled = clientInvoices.reduce((sum, invoice) => sum + (parseFloat(invoice.total || invoice.amount || 0) || 0), 0);
            const activityScore = clientInvoices.length + clientProposals.length + clientContracts.length;

            return {
              id: client.id,
              name: client.name || client.company || 'Unnamed Client',
              company: client.company || '',
              totalBilled,
              activityScore,
            };
          })
          .filter((client) => client.activityScore > 0 || client.totalBilled > 0)
          .sort((a, b) => {
            if (b.totalBilled !== a.totalBilled) return b.totalBilled - a.totalBilled;
            return b.activityScore - a.activityScore;
          })
          .slice(0, 3);

        setStats({
          totalRevenue,
          activeClients: clients.length,
          pendingProposals: proposals.filter((proposal) => (
            proposal.status === 'Draft' || proposal.status === 'Pending' || proposal.status === 'Ready'
          ) ? proposal.status !== 'Accepted' : false).length,
          completedProjects: contracts.filter((contract) => contract.status === 'Completed' || contract.status === 'complete').length,
          outstandingRevenue,
          overdueInvoices: overdueInvoices.length,
          proposalWinRate,
          averageInvoiceValue,
        });
        setRevenueData(chartData.reverse());
        setProposalBreakdown({
          draft: proposals.filter((proposal) => proposal.status === 'Draft').length,
          accepted: acceptedProposals,
          declined: proposals.filter((proposal) => proposal.status === 'Declined').length,
          ready: proposals.filter((proposal) => proposal.status === 'Ready' || proposal.status === 'Pending').length,
        });
        setInvoiceWatchlist(
          unpaidInvoices
            .slice()
            .sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0))
            .slice(0, 5),
        );
        setTopClients(rankedClients);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [currentUser]);

  useEffect(() => {
    const loadDailyQuote = async () => {
      try {
        const quote = await getDailyBusinessQuote();
        setDailyQuote(quote);
      } catch (error) {
        console.error('Error loading daily quote:', error);
      }
      console.log("API CALL TRIGGERED");
    };

    loadDailyQuote();
  }, []);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-none bg-slate-950 text-white shadow-xl">
        <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">
              WorkNest overview
            </div>
            <h2 className="mt-4 text-3xl font-semibold leading-tight">Keep proposals, invoices, and follow-ups moving from one workspace.</h2>
            <p className="mt-3 text-sm text-slate-300 md:text-base">
              Track revenue, catch overdue payments early, and use WORKNEST&apos;s AI for quick drafts, guidance, and export-ready help anywhere in the app.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 md:min-w-[360px]">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Revenue</p>
              <p className="mt-2 text-2xl font-semibold">Rs. {loading ? '...' : stats.totalRevenue.toFixed(0)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Watchlist</p>
              <p className="mt-2 text-2xl font-semibold">{loading ? '...' : stats.overdueInvoices}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Win rate</p>
              <p className="mt-2 text-2xl font-semibold">{loading ? '...' : `${stats.proposalWinRate}%`}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-slate-200 bg-white/95 shadow-sm">
            <CardHeader>
              <CardTitle>Daily Business Quote</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <blockquote className="text-lg font-medium leading-8 text-slate-900">
                {dailyQuote?.quote ? `"${dailyQuote.quote}"` : "Loading today's quote..."}
              </blockquote>
              <div className="text-sm text-slate-500">
                <span>{dailyQuote?.author ? `- ${dailyQuote.author}` : ''}</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total Revenue" value={loading ? 'Loading...' : `Rs. ${stats.totalRevenue.toFixed(2)}`} icon={<DollarSign className="h-5 w-5 text-muted-foreground" />} change="Compared to last period" />
            <StatCard title="Active Clients" value={loading ? '...' : String(stats.activeClients)} icon={<Users className="h-5 w-5 text-muted-foreground" />} change="Clients you interact with" />
            <StatCard title="Pending Proposals" value={loading ? '...' : String(stats.pendingProposals)} icon={<FileText className="h-5 w-5 text-muted-foreground" />} change="Awaiting action" />
            <StatCard title="Completed Projects" value={loading ? '...' : String(stats.completedProjects)} icon={<CheckSquare className="h-5 w-5 text-muted-foreground" />} change="Finished contracts/projects" />
            <StatCard title="Outstanding Revenue" value={loading ? '...' : `Rs. ${stats.outstandingRevenue.toFixed(2)}`} icon={<TrendingUp className="h-5 w-5 text-muted-foreground" />} change="Across unpaid invoices" />
            <StatCard title="Overdue Invoices" value={loading ? '...' : String(stats.overdueInvoices)} icon={<AlertTriangle className="h-5 w-5 text-muted-foreground" />} change="Needs follow-up" />
            <StatCard title="Proposal Win Rate" value={loading ? '...' : `${stats.proposalWinRate}%`} icon={<FileText className="h-5 w-5 text-muted-foreground" />} change="Accepted vs active proposals" />
            <StatCard title="Avg Invoice Value" value={loading ? '...' : `Rs. ${stats.averageInvoiceValue.toFixed(2)}`} icon={<DollarSign className="h-5 w-5 text-muted-foreground" />} change="Across all invoices" />
          </div>

          <RevenueChart data={revenueData} />
          <RecentActivity />
        </div>

        <div className="space-y-6 lg:col-span-1">
          <QuickActions />

          <Card>
            <CardHeader>
              <CardTitle>Top Clients</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topClients.length > 0 ? topClients.map((client, index) => (
                <div key={client.id} className="rounded-md border p-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{client.name}</p>
                      {client.company ? <p className="text-xs text-muted-foreground">{client.company}</p> : null}
                    </div>
                    <span className="text-xs font-medium text-slate-500">#{index + 1}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{client.activityScore} tracked items</span>
                    <span className="font-medium text-slate-700">Rs. {client.totalBilled.toFixed(2)}</span>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">Add more client activity to highlight your top relationships here.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Proposal Pipeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span>Draft</span><span className="font-medium">{proposalBreakdown.draft}</span></div>
              <div className="flex justify-between"><span>Ready / Pending</span><span className="font-medium">{proposalBreakdown.ready}</span></div>
              <div className="flex justify-between"><span>Accepted</span><span className="font-medium">{proposalBreakdown.accepted}</span></div>
              <div className="flex justify-between"><span>Declined</span><span className="font-medium">{proposalBreakdown.declined}</span></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invoice Watchlist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {invoiceWatchlist.length > 0 ? invoiceWatchlist.map((invoice) => (
                <div key={invoice.id} className="rounded-md border p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{invoice.clientName}</span>
                    <span className="text-xs text-muted-foreground">{invoice.status}</span>
                  </div>
                  <div className="mt-1 text-muted-foreground">Due: {invoice.dueDate || 'Not set'}</div>
                  <div className="mt-1 font-medium">Rs. {Number(invoice.total || 0).toFixed(2)}</div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">No unpaid invoices to watch right now.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
