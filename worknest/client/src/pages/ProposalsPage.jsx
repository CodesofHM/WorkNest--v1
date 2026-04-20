import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getProposalsForUser, addProposal, updateProposal, deleteProposal, getProposalPDFBlob, getProposalPDFUrl } from '../services/proposalService';
import { getClientsForUser } from '../services/clientService';
import { getTemplatesForUser } from '../services/pricingTemplateService';
import { sendWhatsAppDocument } from '../services/whatsappService';
import { logClientCommunication } from '../services/clientCommunicationService';
import ProposalList from '../components/proposals/ProposalList';
import AddProposalForm from '../components/proposals/AddProposalForm';
import { Button } from '../components/ui/Button';
import { PlusCircle, FileText, CheckCircle2, PencilRuler } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import toast from 'react-hot-toast';
import PageHero from '../components/layout/PageHero';

const ProposalsPage = () => {
  const { currentUser } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [clients, setClients] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState(null);

  const fetchData = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const [userProposals, userClients, userTemplates] = await Promise.all([
        getProposalsForUser(currentUser.uid),
        getClientsForUser(currentUser.uid),
        getTemplatesForUser(currentUser.uid),
      ]);
      setProposals(userProposals);
      setClients(userClients);
      setTemplates(userTemplates);
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
        const selectedClient = clients.find((client) => client.id === proposalData.clientId);
        await updateProposal(editingProposal.id, {
          ...proposalData,
          clientName: selectedClient?.name || editingProposal.clientName || '',
        });
        toast.success("Proposal updated successfully!", { id: toastId });
        if (proposalData.status !== 'Draft') {
          try {
            const blob = await getProposalPDFBlob(editingProposal.id);
            const tmpUrl = window.URL.createObjectURL(blob);
            window.open(tmpUrl, '_blank');
          } catch (err) {
            console.warn('Auto-preview failed:', err);
          }
        }
      } else {
        const selectedClient = clients.find((client) => client.id === proposalData.clientId);
        const docRef = await addProposal(currentUser.uid, {
          ...proposalData,
          clientName: selectedClient?.name || '',
        });
        toast.success("Proposal created successfully!", { id: toastId });
        // If saved as Ready, automatically generate and open preview in new tab
        if (proposalData.status !== 'Draft') {
          try {
            const blob = await getProposalPDFBlob(docRef.id);
            const tmpUrl = window.URL.createObjectURL(blob);
            window.open(tmpUrl, '_blank');
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

  const getProposalFilename = (proposalTitle) => {
    const normalizedTitle = (proposalTitle || 'proposal')
      .trim()
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
      .replace(/\s+/g, '_');

    return `${normalizedTitle || 'proposal'}.pdf`;
  };

  const handlePDFAction = async (proposalId, action, proposalTitle) => {
    const toastId = toast.loading('Generating PDF...');
    try {
      const blob = await getProposalPDFBlob(proposalId);
      const url = window.URL.createObjectURL(blob);

      if (action === 'preview') {
        window.open(url, '_blank');
        toast.success('PDF ready for preview!', { id: toastId });
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.download = getProposalFilename(proposalTitle);
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast.success('PDF downloaded!', { id: toastId });
      }
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF Action Error:", error);
      toast.error(`Failed to generate PDF: ${error.message}`, { id: toastId });
    }
  };

  const handleSendProposalWhatsApp = async (proposal) => {
    const client = clients.find((item) => item.id === proposal.clientId);

    if (!client?.phone) {
      toast.error('This client does not have a phone number saved yet.');
      return;
    }

    const toastId = toast.loading('Preparing WhatsApp delivery...');

    try {
      const pdfUrl = await getProposalPDFUrl(proposal.id);
      await sendWhatsAppDocument({
        to: client.phone,
        documentUrl: pdfUrl,
        caption: `Hi ${client.name || proposal.clientName || ''}, here is your proposal PDF from WorkNest.`,
        filename: `${(proposal.title || 'proposal').replace(/\s+/g, '_')}.pdf`,
      });

      await logClientCommunication({
        userId: currentUser.uid,
        clientId: client.id,
        invoiceId: null,
        channel: 'WhatsApp',
        tone: 'Polite',
        type: 'document_send',
        message: `Proposal PDF sent via WhatsApp: ${proposal.title}`,
      });

      toast.success('Proposal PDF sent on WhatsApp.', { id: toastId });
    } catch (error) {
      console.error('WhatsApp proposal send failed:', error);
      toast.error(error.message || 'Failed to send the proposal PDF on WhatsApp.', { id: toastId });
    }
  };

  const draftCount = proposals.filter((proposal) => proposal.status === 'Draft').length;
  const readyCount = proposals.filter((proposal) => proposal.status === 'Ready' || proposal.status === 'Pending').length;
  const acceptedCount = proposals.filter((proposal) => proposal.status === 'Accepted').length;

  if (isFormOpen) {
    return (
      <AddProposalForm
        clients={clients}
        templates={templates}
        initialData={editingProposal}
        onSave={handleSave}
        onCancel={() => { setIsFormOpen(false); setEditingProposal(null); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHero
        themeClassName="bg-[linear-gradient(135deg,#0f172a_0%,#111827_45%,#2563eb_100%)]"
        badgeText="Proposal Studio"
        title="Create polished proposals faster and move client work from draft to approval smoothly."
        description="Apply saved pricing templates, review status at a glance, and generate PDF output from one focused workspace."
        helperLabel="Quick start"
        helperText="Open a new proposal when you want to send pricing, scope, and PDF-ready terms to a client."
        actionLabel="Create Proposal"
        actionIcon={PlusCircle}
        onAction={() => { setEditingProposal(null); setIsFormOpen(true); }}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200 bg-white/95 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Drafts</p>
              <p className="mt-2 text-3xl font-semibold">{draftCount}</p>
            </div>
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
              <PencilRuler className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-white/95 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Ready / Pending</p>
              <p className="mt-2 text-3xl font-semibold">{readyCount}</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
              <FileText className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-white/95 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Accepted</p>
              <p className="mt-2 text-3xl font-semibold">{acceptedCount}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 bg-white/95 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Proposal Library</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Review status, open details, and preview or download client-ready PDFs.</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200">
            Total proposals <span className="font-semibold text-slate-900">{proposals.length}</span>
          </div>
        </CardHeader>
        <CardContent>
          <ProposalList
            proposals={proposals}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPreview={(id) => handlePDFAction(id, 'preview')}
            onDownload={(id, title) => handlePDFAction(id, 'download', title)}
            onSendWhatsApp={handleSendProposalWhatsApp}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProposalsPage;
