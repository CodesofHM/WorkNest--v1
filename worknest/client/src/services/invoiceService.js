// File: worknest/client/src/services/invoiceService.js

import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { logActivity } from './activityService';

const INVOICES_COLLECTION = 'invoices';

// Function to add a new invoice
export const addInvoice = (userId, invoiceData) => {
  return addDoc(collection(db, INVOICES_COLLECTION), {
    userId,
    ...invoiceData,
    status: invoiceData.status || 'Pending',
    createdAt: new Date(),
  });
};

// Function to get all invoices for a specific user
export const getInvoicesForUser = async (userId) => {
  const invoicesQuery = query(collection(db, INVOICES_COLLECTION), where('userId', '==', userId));
  const querySnapshot = await getDocs(invoicesQuery);
  
  const invoices = [];
  querySnapshot.forEach((doc) => {
    invoices.push({ id: doc.id, ...doc.data() });
  });
  
  return invoices;
};

export const updateInvoice = async (invoiceId, updatedData, userId) => {
  const invoiceRef = doc(db, INVOICES_COLLECTION, invoiceId);
  await updateDoc(invoiceRef, updatedData);
  if (userId) {
    await logActivity(userId, 'Invoice Updated', `Invoice ${updatedData.clientName ? `for ${updatedData.clientName}` : ''} was updated.`);
  }
};

export const deleteInvoice = async (invoiceId, userId, clientName = '') => {
  const invoiceRef = doc(db, INVOICES_COLLECTION, invoiceId);
  await deleteDoc(invoiceRef);
  if (userId) {
    await logActivity(userId, 'Invoice Deleted', `Invoice ${clientName ? `for ${clientName}` : ''} was deleted.`);
  }
};
