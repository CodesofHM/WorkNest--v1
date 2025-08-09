// File: worknest/client/src/services/firestoreService.js

import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase'; // Import your Firestore instance

// Generic function to fetch all documents from a collection
const getCollectionData = async (collectionName) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  const data = [];
  querySnapshot.forEach((doc) => {
    data.push({ id: doc.id, ...doc.data() });
  });
  return data;
};

// Specific functions for each of your collections
export const getClients = () => {
  return getCollectionData('clients');
};

export const getProposals = () => {
  return getCollectionData('proposals');
};

export const getInvoices = () => {
  return getCollectionData('invoices');
};