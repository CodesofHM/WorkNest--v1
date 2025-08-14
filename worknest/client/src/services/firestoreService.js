// File: worknest/client/src/services/firestoreService.js

import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase'; // Import your Firestore instance

// Generic function to fetch all documents from a collection for a specific user
const getCollectionDataForUser = async (collectionName, userId) => {
  const collectionQuery = query(collection(db, collectionName), where('userId', '==', userId));
  const querySnapshot = await getDocs(collectionQuery);
  const data = [];
  querySnapshot.forEach((doc) => {
    data.push({ id: doc.id, ...doc.data() });
  });
  return data;
};

// CORRECTED: Exported functions now have the correct names
export const getClientsForUser = (userId) => {
  return getCollectionDataForUser('clients', userId);
};

export const getProposalsForUser = (userId) => {
  return getCollectionDataForUser('proposals', userId);
};

export const getInvoicesForUser = (userId) => {
  return getCollectionDataForUser('invoices', userId);
};