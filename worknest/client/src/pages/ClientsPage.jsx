// File: worknest/client/src/pages/ClientsPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { addClient, getClientsForUser, updateClient, deleteClient } from '../services/clientService';
import AddClientForm from '../components/clients/AddClientForm';
import ClientList from '../components/clients/ClientList';

const ClientsPage = () => {
  const { currentUser } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });

  // Fetches the client list from Firestore
  const fetchClients = async () => {
    if (currentUser) {
      try {
        setLoading(true);
        const userClients = await getClientsForUser(currentUser.uid);
        setClients(userClients);
      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Run fetchClients when the component mounts
  useEffect(() => {
    fetchClients();
  }, [currentUser]);

  // Handles saving a new client or updating an existing one
  const handleSaveClient = async (clientData) => {
    try {
      if (editingClient) {
        await updateClient(editingClient.id, clientData);
      } else {
        await addClient(currentUser.uid, clientData);
      }
      setEditingClient(null);
      setIsFormVisible(false);
      fetchClients(); // Refresh the list
    } catch (error) {
      console.error("Error saving client:", error);
    }
  };

  // Sets the state for editing a client
  const handleEditClient = (client) => {
    setEditingClient(client);
    setIsFormVisible(true);
  };

  // Handles deleting a client
  const handleDeleteClient = async (clientId) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        await deleteClient(clientId);
        fetchClients(); // Refresh the list
      } catch (error) {
        console.error("Error deleting client:", error);
      }
    }
  };

  // Hides the form and resets the editing state
  const handleCancel = () => {
    setIsFormVisible(false);
    setEditingClient(null);
  };

  // Handles sort requests from the list component
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Memoized logic to filter and then sort the clients
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

  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Clients</h1>
        <button
          onClick={() => { setEditingClient(null); setIsFormVisible(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Add New Client
        </button>
      </header>

      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm flex items-center space-x-4">
        <input
          type="text"
          placeholder="Search by name, email, or company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg bg-white"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <main className="bg-white p-6 rounded-lg shadow-md">
        {isFormVisible ? (
          <AddClientForm 
            onSave={handleSaveClient} 
            onCancel={handleCancel} 
            initialData={editingClient}
          />
        ) : (
          <ClientList 
            clients={sortedAndFilteredClients}
            loading={loading} 
            onEdit={handleEditClient} 
            onDelete={handleDeleteClient}
            onSort={handleSort}
            sortConfig={sortConfig}
          />
        )}
      </main>
    </div>
  );
};

export default ClientsPage;
