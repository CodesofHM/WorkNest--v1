// File: worknest/client/src/services/contractService.js

import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { logActivity } from './activityService';

const CONTRACTS_COLLECTION = 'contracts';

// Function to add a new contract
export const addContract = (userId, contractData) => {
  return addDoc(collection(db, CONTRACTS_COLLECTION), {
    userId,
    ...contractData,
    status: contractData.status || 'Draft',
    createdAt: new Date(),
  });
};

// Function to get all contracts for a specific user
export const getContractsForUser = async (userId) => {
  const contractsQuery = query(collection(db, CONTRACTS_COLLECTION), where('userId', '==', userId));
  const querySnapshot = await getDocs(contractsQuery);
  
  const contracts = [];
  querySnapshot.forEach((doc) => {
    contracts.push({ id: doc.id, ...doc.data() });
  });
  
  return contracts;
};

export const updateContract = async (contractId, updatedData, userId) => {
  const contractRef = doc(db, CONTRACTS_COLLECTION, contractId);
  await updateDoc(contractRef, updatedData);
  if (userId) {
    await logActivity(userId, 'Contract Updated', `Contract "${updatedData.title || 'Untitled'}" was updated.`);
  }
};

export const deleteContract = async (contractId, userId, title = 'Untitled') => {
  const contractRef = doc(db, CONTRACTS_COLLECTION, contractId);
  await deleteDoc(contractRef);
  if (userId) {
    await logActivity(userId, 'Contract Deleted', `Contract "${title}" was deleted.`);
  }
};
