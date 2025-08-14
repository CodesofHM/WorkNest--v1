// File: worknest/client/src/services/invoiceService.js

import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

const INVOICES_COLLECTION = 'invoices';

// Function to add a new invoice
export const addInvoice = (userId, invoiceData) => {
  return addDoc(collection(db, INVOICES_COLLECTION), {
    userId,
    ...invoiceData,
    status: 'Pending', // Default status
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