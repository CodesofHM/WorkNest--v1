import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { logActivity } from './activityService';

const PROPOSALS_COLLECTION = 'proposals';
const API_URL = 'http://localhost:5000'; // Ensure this matches your server URL

export const addProposal = async (userId, proposalData) => {
  const docRef = await addDoc(collection(db, PROPOSALS_COLLECTION), {
    userId,
    ...proposalData,
    createdAt: new Date(),
  });
  await logActivity(userId, 'Proposal Created', `You created a new proposal: "${proposalData.title}".`);
  return docRef;
};

export const getProposalsForUser = async (userId) => {
  const proposalsQuery = query(collection(db, PROPOSALS_COLLECTION), where('userId', '==', userId));
  const querySnapshot = await getDocs(proposalsQuery);
  const proposals = [];
  querySnapshot.forEach((doc) => {
    proposals.push({ id: doc.id, ...doc.data() });
  });
  // Sort proposals by creation date, newest first
  return proposals.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
};

export const updateProposal = (proposalId, updatedData) => {
  const proposalRef = doc(db, PROPOSALS_COLLECTION, proposalId);
  return updateDoc(proposalRef, updatedData);
};

export const deleteProposal = (proposalId) => {
  const proposalRef = doc(db, PROPOSALS_COLLECTION, proposalId);
  return deleteDoc(proposalRef);
};

// --- NEW FUNCTION for downloading/previewing PDFs ---
export const getProposalPDF = async (proposalId) => {
  try {
    const response = await fetch(`${API_URL}/generate-pdf/${proposalId}`, {
      method: 'POST', // Use POST as defined in your server
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }
    
    // Return the response object to handle blob and headers in the component
    return response;

  } catch (error) {
    console.error("Error fetching proposal PDF:", error);
    throw error; // Re-throw the error to be caught by the calling function
  }
};