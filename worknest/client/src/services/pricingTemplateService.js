// File: worknest/client/src/services/pricingTemplateService.js

import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { logActivity } from './activityService';

const TEMPLATES_COLLECTION = 'pricingTemplates';

// Function to add a new pricing template
export const addTemplate = (userId, templateData) => {
  return addDoc(collection(db, TEMPLATES_COLLECTION), {
    userId,
    ...templateData,
    createdAt: new Date(),
  });
};

// Function to get all templates for a specific user
export const getTemplatesForUser = async (userId) => {
  const templatesQuery = query(collection(db, TEMPLATES_COLLECTION), where('userId', '==', userId));
  const querySnapshot = await getDocs(templatesQuery);
  
  const templates = [];
  querySnapshot.forEach((doc) => {
    templates.push({ id: doc.id, ...doc.data() });
  });
  
  return templates;
};

export const deleteTemplate = (templateId) => {
  const templateDocRef = doc(db, TEMPLATES_COLLECTION, templateId);
  return deleteDoc(templateDocRef);
};

export const updateTemplate = async (templateId, templateData, userId) => {
  const templateDocRef = doc(db, TEMPLATES_COLLECTION, templateId);
  await updateDoc(templateDocRef, templateData);
  if (userId) {
    await logActivity(userId, 'Template Updated', `Template "${templateData.templateName || 'Untitled'}" was updated.`);
  }
};

export const removeTemplate = async (templateId, userId, templateName = 'Untitled') => {
  const templateDocRef = doc(db, TEMPLATES_COLLECTION, templateId);
  await deleteDoc(templateDocRef);
  if (userId) {
    await logActivity(userId, 'Template Deleted', `Template "${templateName}" was deleted.`);
  }
};
