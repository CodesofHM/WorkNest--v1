import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { addClient, getClientsForUser, updateClient, deleteClient } from '../services/clientService';
import AddClientForm from '../components/clients/AddClientForm';
import ClientList from '../components/clients/ClientList';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select'; // Import the new Select component
import { PlusCircle, Search } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';

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
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clients</h1>
          <p className="text-muted-foreground">Manage your client list.</p>
        </div>
        <Button onClick={() => { setEditingClient(null); setIsFormVisible(true); }}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </header>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4 mb-4">
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