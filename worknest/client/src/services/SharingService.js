
// services/SharingService.js
import { doc, addDoc, collection, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export const shareViaWhatsApp = (documentUrl, message, clientPhone) => {
  const whatsappUrl = `https://wa.me/${clientPhone}?text=${encodeURIComponent(message + ' ' + documentUrl)}`;
  window.open(whatsappUrl, '_blank');

  // Track sharing event
  trackSharingEvent('whatsapp', documentUrl);
};

export const shareViaEmail = async (documentData, recipientEmail, template = 'proposal') => {
  const emailData = {
    to: recipientEmail,
    template: template,
    data: documentData,
    attachments: [documentData.pdfUrl]
  };

  const response = await fetch('/api/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(emailData)
  });

  if (response.ok) {
    trackSharingEvent('email', documentData.id);
  }

  return response.json();
};

export const createPublicLink = async (documentId, documentType, userId) => {
  const linkData = {
    documentId,
    documentType,
    userId,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    isActive: true,
    views: 0
  };

  const docRef = await addDoc(collection(db, 'shared_links'), linkData);
  const publicUrl = `${window.location.origin}/shared/${docRef.id}`;

  return { linkId: docRef.id, publicUrl };
};

export const trackSharingEvent = async (method, documentId) => {
  await addDoc(collection(db, 'sharing_events'), {
    method,
    documentId,
    timestamp: new Date(),
    userAgent: navigator.userAgent
  });
};

// Email templates for different document types
export const EMAIL_TEMPLATES = {
  proposal: {
    subject: 'Business Proposal from {senderName}',
    body: `
      Dear {clientName},

      I hope this email finds you well. Please find attached our detailed business proposal for your project.

      Key highlights:
      • Project Timeline: {timeline}
      • Investment: ₹{amount}
      • Deliverables: {deliverables}

      I'm excited about the opportunity to work together and would love to discuss this further.

      Best regards,
      {senderName}
      {senderCompany}
    `
  },
  invoice: {
    subject: 'Invoice #{invoiceNumber} from {senderName}',
    body: `
      Dear {clientName},

      Thank you for your business! Please find attached Invoice #{invoiceNumber}.

      Invoice Details:
      • Amount: ₹{amount}
      • Due Date: {dueDate}
      • Payment Methods: {paymentMethods}

      Please let me know if you have any questions.

      Best regards,
      {senderName}
    `
  }
};