import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { getClientsForUser } from '../services/clientService';
import { addInvoice, deleteInvoice, getInvoicesForUser, updateInvoice } from '../services/invoiceService';
import { buildPaymentMessage, getClientCommunications, logClientCommunication } from '../services/clientCommunicationService';
import AddInvoiceForm from '../components/invoices/AddInvoiceForm';
import InvoiceList from '../components/invoices/InvoiceList';
import { Button } from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { PlusCircle, ReceiptText, Clock3, BadgeCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import PageHero from '../components/layout/PageHero';
import { GUEST_LIMITS, isGuestUser } from '../utils/guestMode';
import GuestLimitModal from '../components/GuestLimitModal';

const InvoicesPage = () => {
  const { currentUser } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [messageInvoice, setMessageInvoice] = useState(null);
  const [messageTone, setMessageTone] = useState('Polite');
  const [messageType, setMessageType] = useState('reminder');
  const [messageText, setMessageText] = useState('');
  const [messageHistory, setMessageHistory] = useState([]);
  const [guestLimitModalOpen, setGuestLimitModalOpen] = useState(false);

  const fetchData = async () => {
    if (currentUser) {
      try {
        setLoading(true);
        const [userInvoices, userClients] = await Promise.all([
          getInvoicesForUser(currentUser.uid),
          getClientsForUser(currentUser.uid)
        ]);
        setInvoices(userInvoices);
        setClients(userClients);
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

  const handleSaveInvoice = async (invoiceData) => {
    try {
      if (editingInvoice) {
        await updateInvoice(editingInvoice.id, invoiceData, currentUser.uid);
        toast.success('Invoice updated successfully!');
      } else {
        if (isGuestUser(currentUser) && invoices.length >= GUEST_LIMITS.invoices) {
          setGuestLimitModalOpen(true);
          return;
        }
        await addInvoice(currentUser.uid, invoiceData);
        toast.success('Invoice created successfully!');
      }
      setIsFormVisible(false);
      setEditingInvoice(null);
      fetchData();
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast.error('Failed to save invoice.');
    }
  };

  const handleDeleteInvoice = async (invoice) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;

    try {
      await deleteInvoice(invoice.id, currentUser.uid, invoice.clientName);
      toast.success('Invoice deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice.');
    }
  };

  const handleStatusChange = async (invoice, status) => {
    try {
      await updateInvoice(invoice.id, { ...invoice, status }, currentUser.uid);
      toast.success(`Invoice marked as ${status}.`);
      fetchData();
    } catch (error) {
      console.error('Error updating invoice status:', error);
      toast.error('Failed to update invoice status.');
    }
  };

  const openMessageModal = async (invoice) => {
    const client = clients.find((item) => item.id === invoice.clientId) || null;
    const nextType = invoice.status === 'Paid' ? 'thank_you' : invoice.status === 'Overdue' ? 'overdue' : 'reminder';
    setMessageInvoice(invoice);
    setMessageType(nextType);
    setMessageTone('Polite');
    setMessageText(buildPaymentMessage({ invoice, client, tone: 'Polite', type: nextType }));

    try {
      const history = await getClientCommunications(currentUser.uid, invoice.clientId);
      setMessageHistory(history);
    } catch (error) {
      console.error('Error loading communication history:', error);
      setMessageHistory([]);
    }
  };

  useEffect(() => {
    if (!messageInvoice) return;
    const client = clients.find((item) => item.id === messageInvoice.clientId) || null;
    setMessageText(buildPaymentMessage({ invoice: messageInvoice, client, tone: messageTone, type: messageType }));
  }, [messageInvoice, messageTone, messageType, clients]);

  const handleSendMessage = async (channel) => {
    if (!messageInvoice) return;

    const client = clients.find((item) => item.id === messageInvoice.clientId) || null;
    const targetPhone = client?.phone ? client.phone.replace(/\D/g, '') : '';
    const targetEmail = client?.email || '';

    try {
      if (channel === 'WhatsApp') {
        const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(messageText)}`;
        window.open(whatsappUrl, '_blank');
      } else {
        window.location.href = `mailto:${targetEmail}?subject=${encodeURIComponent('Payment update from WorkNest')}&body=${encodeURIComponent(messageText)}`;
      }

      await logClientCommunication({
        userId: currentUser.uid,
        clientId: messageInvoice.clientId,
        invoiceId: messageInvoice.id,
        channel,
        tone: messageTone,
        type: messageType,
        message: messageText,
      });

      toast.success(`${channel} message prepared and logged.`);
      setMessageInvoice(null);
      setMessageHistory([]);
    } catch (error) {
      console.error('Error logging communication:', error);
      toast.error('Failed to log this communication.');
    }
  };

  const pendingInvoices = invoices.filter((invoice) => invoice.status === 'Pending').length;
  const paidInvoices = invoices.filter((invoice) => invoice.status === 'Paid').length;
  const overdueInvoices = invoices.filter((invoice) => invoice.status === 'Overdue').length;
  const outstandingAmount = invoices
    .filter((invoice) => invoice.status !== 'Paid')
    .reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);
  const openCreateInvoiceForm = () => {
    if (isGuestUser(currentUser) && invoices.length >= GUEST_LIMITS.invoices) {
      setGuestLimitModalOpen(true);
      return;
    }

    setEditingInvoice(null);
    setIsFormVisible(true);
  };

  if (isFormVisible) {
    return (
      <AddInvoiceForm
        clients={clients}
        initialData={editingInvoice}
        onSave={handleSaveInvoice}
        onCancel={() => { setIsFormVisible(false); setEditingInvoice(null); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <GuestLimitModal
        isOpen={guestLimitModalOpen}
        resourceName="invoice"
        onClose={() => setGuestLimitModalOpen(false)}
      />
      <PageHero
        themeClassName="bg-[linear-gradient(135deg,#172554_0%,#1e293b_38%,#c2410c_100%)]"
        badgeText="Billing Flow"
        title="Manage billing, follow-ups, and overdue payments from one calmer invoice desk."
        description="Create invoices, update payment status quickly, and prepare reminder messages without jumping between tools."
        helperLabel="Outstanding value"
        helperText={isGuestUser(currentUser) ? 'Guest mode includes one invoice.' : `Rs. ${outstandingAmount.toFixed(2)} across all pending and overdue invoices in your workspace right now.`}
        actionLabel="New Invoice"
        actionIcon={PlusCircle}
        onAction={openCreateInvoiceForm}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200 bg-white/95 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="mt-2 text-3xl font-semibold">{pendingInvoices}</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
              <ReceiptText className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-white/95 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Paid</p>
              <p className="mt-2 text-3xl font-semibold">{paidInvoices}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <BadgeCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-white/95 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Overdue</p>
              <p className="mt-2 text-3xl font-semibold">{overdueInvoices}</p>
            </div>
            <div className="rounded-2xl bg-rose-50 p-3 text-rose-700">
              <Clock3 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 bg-white/95 shadow-sm">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Invoice Desk</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Update billing records and trigger payment communication from the same table.</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200">
            Total invoices <span className="font-semibold text-slate-900">{invoices.length}</span>
          </div>
        </CardHeader>
        <CardContent>
          <InvoiceList
            invoices={invoices}
            loading={loading}
            onEdit={(invoice) => { setEditingInvoice(invoice); setIsFormVisible(true); }}
            onDelete={handleDeleteInvoice}
            onChangeStatus={handleStatusChange}
            onCommunicate={openMessageModal}
          />
        </CardContent>
      </Card>

      <Modal isOpen={Boolean(messageInvoice)} onClose={() => setMessageInvoice(null)}>
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Payment Communication</h2>
            <p className="text-sm text-muted-foreground">Prepare a reminder or thank-you message and save the history for this client.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tone</label>
              <Select value={messageTone} onChange={(event) => setMessageTone(event.target.value)}>
                <option value="Friendly">Friendly</option>
                <option value="Polite">Polite</option>
                <option value="Strict">Strict</option>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={messageType} onChange={(event) => setMessageType(event.target.value)}>
                <option value="reminder">Payment Reminder</option>
                <option value="overdue">Overdue Reminder</option>
                <option value="thank_you">Thank You</option>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Message</label>
            <Textarea rows={7} value={messageText} onChange={(event) => setMessageText(event.target.value)} />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => handleSendMessage('Email')}>Prepare Email</Button>
            <Button onClick={() => handleSendMessage('WhatsApp')}>Open WhatsApp</Button>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold">Recent Message History</h3>
            {messageHistory.length > 0 ? (
              <div className="space-y-2">
                {messageHistory.map((entry) => (
                  <div key={entry.id} className="rounded-md border p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{entry.channel} • {entry.tone}</span>
                      <span className="text-xs text-muted-foreground">
                        {entry.createdAt?.toDate ? entry.createdAt.toDate().toLocaleString() : ''}
                      </span>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{entry.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No communication history yet for this client.</p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InvoicesPage;
