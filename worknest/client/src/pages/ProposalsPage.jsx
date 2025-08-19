import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getProposalsForUser, addProposal, updateProposal, deleteProposal, getProposalPDF } from '../services/proposalService';
import { getClientsForUser } from '../services/clientService';
import ProposalList from '../components/proposals/ProposalList';
import AddProposalForm from '../components/proposals/AddProposalForm';
import { Button } from '../components/ui/Button';
import { PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ProposalsPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState(null);

  const fetchData = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const [userProposals, userClients] = await Promise.all([
        getProposalsForUser(currentUser.uid),
        getClientsForUser(currentUser.uid),
      ]);
      setProposals(userProposals);
      setClients(userClients);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch proposals and clients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const handleSave = async (proposalData) => {
    const toastId = toast.loading('Saving proposal...');
    try {
      if (editingProposal) {
        await updateProposal(editingProposal.id, proposalData);
        toast.success("Proposal updated successfully!", { id: toastId });
        if (proposalData.status !== 'Draft') {
          try {
            const { response, pdfUrl } = await getProposalPDF(editingProposal.id);
            if (pdfUrl) window.open(pdfUrl, '_blank');
            else if (response && response.ok) {
              const blob = await response.blob();
              const tmpUrl = window.URL.createObjectURL(blob);
              window.open(tmpUrl, '_blank');
            }
          } catch (err) {
            console.warn('Auto-preview failed:', err);
          }
        }
      } else {
        const docRef = await addProposal(currentUser.uid, proposalData);
        toast.success("Proposal created successfully!", { id: toastId });
        // If saved as Ready, automatically generate and open preview in new tab
        if (proposalData.status !== 'Draft') {
          try {
            const { response, pdfUrl } = await getProposalPDF(docRef.id);
            if (pdfUrl) {
              window.open(pdfUrl, '_blank');
            } else if (response && response.ok) {
              const blob = await response.blob();
              const tmpUrl = window.URL.createObjectURL(blob);
              window.open(tmpUrl, '_blank');
            }
          } catch (err) {
            console.warn('Auto-preview failed:', err);
          }
        }
      }
      fetchData();
      setIsFormOpen(false);
      setEditingProposal(null);
    } catch (error) {
      console.error("Error saving proposal:", error);
      toast.error("Failed to save proposal.", { id: toastId });
    }
  };
  
  const handleEdit = (proposal) => {
    setEditingProposal(proposal);
    setIsFormOpen(true);
  };

  const handleDelete = async (proposalId) => {
    if (window.confirm("Are you sure you want to delete this proposal?")) {
      try {
        await deleteProposal(proposalId);
        toast.success("Proposal deleted successfully!");
        setProposals(proposals.filter(p => p.id !== proposalId));
      } catch (error) {
        console.error("Error deleting proposal:", error);
        toast.error("Failed to delete proposal.");
      }
    }
  };

  const handlePDFAction = async (proposalId, action) => {
    const toastId = toast.loading('Generating PDF...');
    try {
      const { response, pdfUrl } = await getProposalPDF(proposalId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (action === 'preview') {
        if (pdfUrl) {
          // Use the server-saved URL for stable preview
          window.open(pdfUrl, '_blank');
          toast.success('PDF ready for preview!', { id: toastId });
        } else {
          // Fallback to blob URL
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          window.open(url, '_blank');
          toast.success('PDF ready for preview!', { id: toastId });
        }
      } else {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        const contentDisposition = response.headers.get('content-disposition');
        let fileName = 'proposal.pdf';
        if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename=\"(.+)\"/);
            if (fileNameMatch && fileNameMatch.length === 2) fileName = fileNameMatch[1];
        }
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast.success('PDF downloaded!', { id: toastId });
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("PDF Action Error:", error);
      toast.error(`Failed to generate PDF: ${error.message}`, { id: toastId });
    }
  };

  if (isFormOpen) {
    return (
      <AddProposalForm
        clients={clients}
        initialData={editingProposal}
        onSave={handleSave}
        onCancel={() => { setIsFormOpen(false); setEditingProposal(null); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Proposals</h1>
          <p className="text-muted-foreground">Create and manage your client proposals.</p>
        </div>
        <Button onClick={() => { setEditingProposal(null); setIsFormOpen(true); }}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Proposal
        </Button>
      </div>

      <ProposalList
        proposals={proposals}
        clients={clients}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPreview={(id) => handlePDFAction(id, 'preview')}
        onDownload={(id) => handlePDFAction(id, 'download')}
      />
    </div>
  );
};

export default ProposalsPage;