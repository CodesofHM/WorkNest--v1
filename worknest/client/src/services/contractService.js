// File: worknest/client/src/services/contractService.js

import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

const CONTRACTS_COLLECTION = 'contracts';

// Function to add a new contract
export const addContract = (userId, contractData) => {
  return addDoc(collection(db, CONTRACTS_COLLECTION), {
    userId,
    ...contractData,
    status: 'Draft', // Default status
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