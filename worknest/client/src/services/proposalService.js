import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { logActivity } from './activityService';

const PROPOSALS_COLLECTION = 'proposals';
const API_URL = import.meta.env.VITE_API_URL;

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

export const getProposalById = async (proposalId) => {
  const proposalRef = doc(db, PROPOSALS_COLLECTION, proposalId);
  const proposalSnap = await getDoc(proposalRef);
  if (!proposalSnap.exists()) {
    throw new Error('Proposal not found.');
  }
  return { id: proposalSnap.id, ...proposalSnap.data() };
};

export const generateProposalPDF = async (proposalId) => {
  try {
    const response = await fetch(`${API_URL}/generate-pdf/${proposalId}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }
    const data = await response.clone().json().catch(() => ({}));
    const pdfUrl = response.headers.get('X-PDF-URL') || data.url || null;
    return { response, pdfUrl };

  } catch (error) {
    console.error("Error fetching proposal PDF:", error);
    throw error;
  }
};

export const getProposalPDFBlob = async (proposalId) => {
  const { pdfUrl } = await generateProposalPDF(proposalId);

  if (!pdfUrl) {
    throw new Error('No PDF URL was returned by the server.');
  }

  const pdfResponse = await fetch(pdfUrl);
  if (!pdfResponse.ok) {
    throw new Error(`Unable to fetch generated PDF. Status: ${pdfResponse.status}`);
  }

  const buffer = await pdfResponse.arrayBuffer();
  return new Blob([buffer], { type: 'application/pdf' });
};

export const getProposalPDFUrl = async (proposalId) => {
  const { pdfUrl } = await generateProposalPDF(proposalId);

  if (!pdfUrl) {
    throw new Error('No PDF URL was returned by the server.');
  }

  return pdfUrl;
};
