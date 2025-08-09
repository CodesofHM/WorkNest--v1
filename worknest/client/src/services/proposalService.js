// File: worknest/client/src/services/proposalService.js

import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

const PROPOSALS_COLLECTION = 'proposals';

// Function to add a new proposal to Firestore
export const addProposal = (userId, proposalData) => {
  return addDoc(collection(db, PROPOSALS_COLLECTION), {
    userId,
    ...proposalData,
    createdAt: new Date(),
  });
};

// Function to get all proposals for a specific user
export const getProposalsForUser = async (userId) => {
  const proposalsQuery = query(collection(db, PROPOSALS_COLLECTION), where('userId', '==', userId));
  const querySnapshot = await getDocs(proposalsQuery);
  
  const proposals = [];
  querySnapshot.forEach((doc) => {
    proposals.push({ id: doc.id, ...doc.data() });
  });
  
  return proposals;
};

// NEW: Function to update an existing proposal
export const updateProposal = (proposalId, updatedData) => {
  const proposalDocRef = doc(db, PROPOSALS_COLLECTION, proposalId);
  return updateDoc(proposalDocRef, updatedData);
};

// NEW: Function to delete a proposal
export const deleteProposal = (proposalId) => {
  const proposalDocRef = doc(db, PROPOSALS_COLLECTION, proposalId);
  return deleteDoc(proposalDocRef);
};