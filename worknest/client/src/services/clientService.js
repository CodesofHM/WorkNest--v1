// File: worknest/client/src/services/clientService.js

import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

const CLIENTS_COLLECTION = 'clients';

// Function to add a new client to Firestore
export const addClient = (userId, clientData) => {
  return addDoc(collection(db, CLIENTS_COLLECTION), {
    userId,
    ...clientData,
    tags: [], // Initialize with an empty tags array
    createdAt: new Date(),
  });
};

// Function to get all clients for a specific user
export const getClientsForUser = async (userId) => {
  const clientsQuery = query(collection(db, CLIENTS_COLLECTION), where('userId', '==', userId));
  const querySnapshot = await getDocs(clientsQuery);
  
  const clients = [];
  querySnapshot.forEach((doc) => {
    clients.push({ id: doc.id, ...doc.data() });
  });
  
  return clients;
};

// Function to get a single client by its ID
export const getClientById = (clientId) => {
  const clientDocRef = doc(db, 'clients', clientId);
  return getDoc(clientDocRef);
};

// Function to update an existing client
export const updateClient = (clientId, updatedData) => {
  const clientDocRef = doc(db, CLIENTS_COLLECTION, clientId);
  return updateDoc(clientDocRef, updatedData);
};

// Function to delete a client
export const deleteClient = (clientId) => {
  const clientDocRef = doc(db, CLIENTS_COLLECTION, clientId);
  return deleteDoc(clientDocRef);
};