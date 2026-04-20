import { addDoc, collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { logActivity } from './activityService';

const COMMUNICATION_COLLECTION = 'clientCommunications';

const tonePrefixes = {
  Friendly: 'Hi',
  Polite: 'Hello',
  Strict: 'Dear',
};

export const buildPaymentMessage = ({ invoice, client, tone = 'Polite', type = 'reminder' }) => {
  const opening = tonePrefixes[tone] || tonePrefixes.Polite;
  const clientName = client?.name || invoice?.clientName || 'there';
  const amount = Number(invoice?.total || 0).toFixed(2);
  const dueDate = invoice?.dueDate || 'the due date';

  if (type === 'thank_you') {
    return `${opening} ${clientName}, thank you for your payment of Rs. ${amount} for invoice ${invoice?.id || ''}. We appreciate your trust and look forward to working with you again.`;
  }

  if (type === 'overdue') {
    return `${opening} ${clientName}, this is a reminder that invoice ${invoice?.id || ''} for Rs. ${amount} is overdue since ${dueDate}. Please share the payment update at your earliest convenience.`;
  }

  return `${opening} ${clientName}, just a quick reminder that invoice ${invoice?.id || ''} for Rs. ${amount} is pending and due on ${dueDate}. Please let me know if you need the invoice resent or have any questions.`;
};

export const logClientCommunication = async ({ userId, clientId, invoiceId, channel, tone, type, message }) => {
  await addDoc(collection(db, COMMUNICATION_COLLECTION), {
    userId,
    clientId,
    invoiceId,
    channel,
    tone,
    type,
    message,
    createdAt: new Date(),
  });

  if (userId) {
    await logActivity(userId, 'Client Communication', `Logged a ${type.replace('_', ' ')} ${channel} message.`);
  }
};

export const getClientCommunications = async (userId, clientId = null) => {
  const constraints = [
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(25),
  ];

  if (clientId) {
    constraints.unshift(where('clientId', '==', clientId));
  }

  const communicationQuery = query(collection(db, COMMUNICATION_COLLECTION), ...constraints);
  const communicationSnapshot = await getDocs(communicationQuery);
  const messages = [];
  communicationSnapshot.forEach((docSnap) => {
    messages.push({ id: docSnap.id, ...docSnap.data() });
  });
  return messages;
};
