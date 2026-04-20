import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { addClient, getClientsForUser, updateClient, deleteClient } from '../services/clientService';
import AddClientForm from '../components/clients/AddClientForm';
import ClientList from '../components/clients/ClientList';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select'; // Import the new Select component
import { PlusCircle, Search, Users, UserCheck, UserX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import PageHero from '../components/layout/PageHero';

const ClientsPage = () => {
  const { currentUser } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });

  const fetchClients = async () => {
    if (currentUser) {
      try {
        setLoading(true);
        const userClients = await getClientsForUser(currentUser.uid);
        setClients(userClients);
      } catch (error) {
        console.error("Error fetching clients:", error);
        toast.error("Failed to fetch clients.");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchClients();
  }, [currentUser]);

  const handleSaveClient = async (clientData) => {
    try {
      if (editingClient) {
        await updateClient(editingClient.id, clientData);
        toast.success("Client updated successfully!");
      } else {
        await addClient(currentUser.uid, clientData);
        toast.success("Client added successfully!");
      }
      setEditingClient(null);
      setIsFormVisible(false);
      fetchClients();
    } catch (error) {
      console.error("Error saving client:", error);
      toast.error("Failed to save client.");
    }
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setIsFormVisible(true);
  };

  const handleDeleteClient = async (clientId) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        await deleteClient(clientId);
        toast.success("Client deleted successfully!");
        fetchClients();
      } catch (error) {
        console.error("Error deleting client:", error);
        toast.error("Failed to delete client.");
      }
    }
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setEditingClient(null);
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredClients = useMemo(() => {
    let filtered = clients.filter(client => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = client.name.toLowerCase().includes(searchLower) ||
                            client.email.toLowerCase().includes(searchLower) ||
                            (client.company && client.company.toLowerCase().includes(searchLower));

      const matchesStatus = statusFilter === 'All' || client.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [clients, searchTerm, statusFilter, sortConfig]);

  const activeClients = clients.filter((client) => client.status === 'Active').length;
  const inactiveClients = clients.filter((client) => client.status === 'Inactive').length;

  if (isFormVisible) {
    return (
      <AddClientForm
        onSave={handleSaveClient}
        onCancel={handleCancel}
        initialData={editingClient}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHero
        themeClassName="bg-[linear-gradient(135deg,#020617_0%,#0f172a_45%,#1d4ed8_100%)]"
        badgeText="Client Hub"
        title="Keep every client relationship in one clean, easy-to-scan workspace."
        description="Track who is active, filter your pipeline quickly, and keep contact details ready for proposals, contracts, and invoices."
        helperLabel="Quick start"
        helperText="Add a new client, then use search and filters to keep your directory tidy."
        actionLabel="Add Client"
        actionIcon={PlusCircle}
        onAction={() => { setEditingClient(null); setIsFormVisible(true); }}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200 bg-white/95 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Total Clients</p>
              <p className="mt-2 text-3xl font-semibold">{clients.length}</p>
            </div>
            <div className="rounded-2xl bg-sky-50 p-3 text-sky-700">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-white/95 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="mt-2 text-3xl font-semibold">{activeClients}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-white/95 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Inactive</p>
              <p className="mt-2 text-3xl font-semibold">{inactiveClients}</p>
            </div>
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
              <UserX className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 bg-white/95 shadow-sm">
        <CardHeader>
          <CardTitle>Client Directory</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="mb-4 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {/* Use the new Select component here */}
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Select>
            <div className="rounded-xl bg-white px-4 py-3 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
              Showing <span className="font-semibold text-slate-900">{sortedAndFilteredClients.length}</span> clients
            </div>
          </div>

          <ClientList
            clients={sortedAndFilteredClients}
            loading={loading}
            onEdit={handleEditClient}
            onDelete={handleDeleteClient}
            onSort={handleSort}
            sortConfig={sortConfig}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientsPage;
