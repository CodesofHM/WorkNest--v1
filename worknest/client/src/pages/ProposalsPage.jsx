// File: worknest/client/src/pages/ProposalsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getClientsForUser } from '../services/clientService';
import { getTemplatesForUser } from '../services/pricingTemplateService'; // Import template service
import { addProposal, getProposalsForUser, updateProposal, deleteProposal } from '../services/proposalService';
import AddProposalForm from '../components/proposals/AddProposalForm';
import ProposalList from '../components/proposals/ProposalList';

const ProposalsPage = () => {
  const { currentUser } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [clients, setClients] = useState([]);
  const [templates, setTemplates] = useState([]); // State for pricing templates
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingProposal, setEditingProposal] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchData = async () => {
    if (currentUser) {
      setLoading(true);
      try {
        const [userProposals, userClients, userTemplates] = await Promise.all([
          getProposalsForUser(currentUser.uid),
          getClientsForUser(currentUser.uid),
          getTemplatesForUser(currentUser.uid)
        ]);
        setProposals(userProposals);
        setClients(userClients);
        setTemplates(userTemplates);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const handleSaveProposal = async (proposalData) => {
    try {
      if (editingProposal) {
        await updateProposal(editingProposal.id, proposalData);
      } else {
        await addProposal(currentUser.uid, proposalData);
      }
      setEditingProposal(null);
      setIsFormVisible(false);
      fetchData();
    } catch (error) {
      console.error("Error saving proposal:", error);
    }
  };

  const handleEditProposal = (proposal) => {
    setEditingProposal(proposal);
    setIsFormVisible(true);
  };

  const handleDeleteProposal = async (proposalId) => {
    if (window.confirm("Are you sure you want to delete this proposal?")) {
      try {
        await deleteProposal(proposalId);
        fetchData();
      } catch (error) {
        console.error("Error deleting proposal:", error);
      }
    }
  };
  
  const handleCancel = () => {
    setIsFormVisible(false);
    setEditingProposal(null);
  };

  const filteredProposals = useMemo(() => {
    return proposals.filter(p => statusFilter === 'All' || p.status === statusFilter);
  }, [proposals, statusFilter]);

  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Proposals</h1>
        <button
          onClick={() => { setEditingProposal(null); setIsFormVisible(true); }}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
        >
          + New Proposal
        </button>
      </header>
      
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm flex items-center">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-lg bg-white">
          <option value="All">Filter by Status: All</option>
          <option value="Draft">Draft</option>
          <option value="Ready to Send">Ready to Send</option>
          <option value="Accepted">Accepted (Manual)</option>
          <option value="Rejected">Rejected (Manual)</option>
        </select>
      </div>

      <main className="bg-white p-6 rounded-lg shadow-md">
        {isFormVisible ? (
          <AddProposalForm 
            clients={clients} 
            templates={templates}
            onSave={handleSaveProposal} 
            onCancel={handleCancel} 
            initialData={editingProposal} 
          />
        ) : (
          <ProposalList 
            proposals={filteredProposals} 
            loading={loading} 
            onEdit={handleEditProposal} 
            onDelete={handleDeleteProposal}
          />
        )}
      </main>
    </div>
  );
};

export default ProposalsPage;
