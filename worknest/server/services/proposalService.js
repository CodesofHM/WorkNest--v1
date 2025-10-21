const { db } = require("../config/firebase");
const { generateProposalPDF } = require("./pdfService"); // Import the updated PDF service

/**
 * Fetches all proposals for a given user.
 * @param {string} userId - The ID of the user whose proposals to fetch.
 * @returns {Promise<Array>} A promise that resolves to an array of proposal objects.
 */
const getProposals = async (userId) => {
  const snapshot = await db.collection("proposals").where("userId", "==", userId).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Fetches a single proposal by its ID.
 * @param {string} proposalId - The ID of the proposal to fetch.
 * @returns {Promise<Object|null>} A promise that resolves to the proposal object or null if not found.
 */
const getProposalById = async (proposalId) => {
  const doc = await db.collection("proposals").doc(proposalId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

/**
 * Creates a new proposal, generates its PDF, uploads it to Cloudinary, and saves it to Firestore.
 * @param {Object} proposalData - The data for the new proposal.
 * @returns {Promise<Object>} A promise that resolves to the newly created proposal object.
 */
const createProposal = async (proposalData) => {
  try {
    const proposalRef = db.collection("proposals").doc();
    const proposalId = proposalRef.id;

    console.log(`[Proposal Service] Creating proposal with ID: ${proposalId}`);

    // First, save the initial proposal data to get the ID for the PDF service.
    // We'll update it with the PDF URL later.
    const initialProposal = {
      ...proposalData,
      id: proposalId,
      status: "generating_pdf", // Set a temporary status
      createdAt: new Date(),
      pdfUrl: "", // Initialize pdfUrl as empty
    };
    await proposalRef.set(initialProposal);

    // Now, call the PDF service to generate the PDF and upload it to Cloudinary.
    // This function will now return the secure Cloudinary URL.
    console.log(`[Proposal Service] Generating PDF for proposal: ${proposalId}`);
    const cloudinaryUrl = await generateProposalPDF(proposalId);
    console.log(`[Proposal Service] Received Cloudinary URL: ${cloudinaryUrl}`);

    // Finally, update the proposal document with the Cloudinary URL and set status to draft.
    const finalProposal = {
      ...initialProposal,
      pdfUrl: cloudinaryUrl,
      status: "draft",
    };
    await proposalRef.update({
      pdfUrl: cloudinaryUrl,
      status: "draft",
    });

    console.log(`[Proposal Service] Successfully created and saved proposal ${proposalId}`);
    return finalProposal;

  } catch (error) {
    console.error("[Proposal Service] ❌ ERROR creating proposal:", error);
    // Rethrow the error to be handled by the route handler
    throw error;
  }
};

/**
 * Updates an existing proposal in Firestore.
 * @param {string} proposalId - The ID of the proposal to update.
 * @param {Object} updateData - An object containing the fields to update.
 * @returns {Promise<Object>} A promise that resolves to the updated proposal data.
 */
const updateProposal = async (proposalId, updateData) => {
  const proposalRef = db.collection("proposals").   doc(proposalId);
  await proposalRef.update(updateData);
  const updatedDoc = await proposalRef.get();
  return { id: updatedDoc.id, ...updatedDoc.data() };
};

/**
 * Deletes a proposal from Firestore.
 * @param {string} proposalId - The ID of the proposal to delete.
 * @returns {Promise<void>} A promise that resolves when the deletion is complete.
 */
const deleteProposal = async (proposalId) => {
  await db.collection("proposals").doc(proposalId).delete();
};

module.exports = {
  getProposals,
  getProposalById,
  createProposal,
  updateProposal,
  deleteProposal,
};