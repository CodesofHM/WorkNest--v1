import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Eye, MessageCircleMore } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getProposalById, getProposalPDFBlob, getProposalPDFUrl } from '../services/proposalService';
import { getClientById } from '../services/clientService';
import { sendWhatsAppDocument } from '../services/whatsappService';
import { logClientCommunication } from '../services/clientCommunicationService';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const ProposalDetailPage = () => {
  const { proposalId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [proposal, setProposal] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);

  const scopeSections = proposal?.scopeSections?.length
    ? proposal.scopeSections
    : proposal?.scopeOfWork
      ? [{ heading: 'Scope of Work', content: proposal.scopeOfWork }]
      : [];

  useEffect(() => {
    const loadProposal = async () => {
      try {
        setLoading(true);
        const proposalData = await getProposalById(proposalId);
        setProposal(proposalData);
        if (proposalData?.clientId) {
          const clientDoc = await getClientById(proposalData.clientId);
          if (clientDoc.exists()) {
            setClient({ id: clientDoc.id, ...clientDoc.data() });
          }
        }
      } catch (error) {
        console.error('Error loading proposal:', error);
        toast.error('Unable to load proposal details.');
      } finally {
        setLoading(false);
      }
    };

    loadProposal();
  }, [proposalId]);

  const handlePdfAction = async (action) => {
    try {
      setPdfLoading(true);
      const blob = await getProposalPDFBlob(proposalId);
      const objectUrl = window.URL.createObjectURL(blob);

      if (action === 'preview') {
        window.open(objectUrl, '_blank');
      } else {
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = `${(proposal?.title || 'proposal').replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('Proposal PDF action failed:', error);
      toast.error('Unable to generate the proposal PDF right now.');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleSendWhatsApp = async () => {
    if (!client?.phone) {
      toast.error('This client does not have a phone number saved yet.');
      return;
    }

    const toastId = toast.loading('Sending proposal PDF to WhatsApp...');

    try {
      const pdfUrl = await getProposalPDFUrl(proposalId);
      await sendWhatsAppDocument({
        to: client.phone,
        documentUrl: pdfUrl,
        caption: `Hi ${client.name || proposal.clientName || ''}, here is your proposal PDF from WorkNest.`,
        filename: `${(proposal?.title || 'proposal').replace(/\s+/g, '_')}.pdf`,
      });

      await logClientCommunication({
        userId: currentUser?.uid,
        clientId: client.id,
        invoiceId: null,
        channel: 'WhatsApp',
        tone: 'Polite',
        type: 'document_send',
        message: `Proposal PDF sent via WhatsApp: ${proposal.title}`,
      });

      toast.success('Proposal PDF sent on WhatsApp.', { id: toastId });
    } catch (error) {
      console.error('Proposal WhatsApp send failed:', error);
      toast.error(error.message || 'Unable to send the proposal PDF on WhatsApp.', { id: toastId });
    }
  };

  if (loading) {
    return <div className="p-8">Loading proposal details...</div>;
  }

  if (!proposal) {
    return <div className="p-8">Proposal not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button variant="ghost" onClick={() => navigate('/proposals')} className="mb-3 px-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to proposals
          </Button>
          <h1 className="text-3xl font-bold">{proposal.title}</h1>
          <p className="text-muted-foreground">Client: {proposal.clientName || proposal.clientId}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handlePdfAction('preview')} disabled={pdfLoading}>
            <Eye className="mr-2 h-4 w-4" />
            Preview PDF
          </Button>
          <Button variant="outline" onClick={handleSendWhatsApp}>
            <MessageCircleMore className="mr-2 h-4 w-4" />
            Send WhatsApp
          </Button>
          <Button onClick={() => handlePdfAction('download')} disabled={pdfLoading}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(proposal.services || []).map((service, index) => (
              <div key={`${service.name}-${index}`} className="rounded-md border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{service.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{service.description || 'No description provided.'}</p>
                  </div>
                  <div className="font-semibold">Rs. {Number(service.price || 0).toFixed(2)}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Status</span>
              <span className="font-medium">{proposal.status || 'Draft'}</span>
            </div>
            <div className="flex justify-between">
              <span>Total</span>
              <span className="font-medium">Rs. {Number(proposal.total || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Project Completion</span>
              <span className="font-medium">
                {proposal.completionTimeMin && proposal.completionTimeMax
                  ? `${proposal.completionTimeMin} to ${proposal.completionTimeMax} ${proposal.completionTimeUnit || 'days'}`
                  : proposal.completionTimeMin
                    ? `${proposal.completionTimeMin} ${proposal.completionTimeUnit || 'days'}`
                    : 'Not set'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">All completion estimates are based on working time only.</p>
            <div>
              <div className="mb-1 font-medium">Scope of Work</div>
              {scopeSections.length ? (
                <div className="space-y-3">
                  {scopeSections.map((section, index) => (
                    <div key={`scope-summary-${index}`} className="rounded-md border border-slate-200 p-3">
                      <p className="font-medium text-slate-900">{section.heading || `Section ${index + 1}`}</p>
                      <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{section.content || 'No content added.'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="whitespace-pre-wrap text-muted-foreground">No scope of work added.</p>
              )}
            </div>
            <div>
              <div className="mb-1 font-medium">Additional Details</div>
              <p className="whitespace-pre-wrap text-muted-foreground">{proposal.extraDetails || 'No additional details added.'}</p>
            </div>
            <div>
              <div className="mb-1 font-medium">Terms</div>
              <p className="whitespace-pre-wrap text-muted-foreground">{proposal.terms || 'No terms added.'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProposalDetailPage;
