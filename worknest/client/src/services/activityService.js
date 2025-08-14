// File: worknest/client/src/services/activityService.js

import { collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';

const ACTIVITY_COLLECTION = 'activity';

// Function to log a new activity
export const logActivity = (userId, title, description) => {
  return addDoc(collection(db, ACTIVITY_COLLECTION), {
    userId,
    title,
    description,
    createdAt: new Date(),
  });
};

// Function to get the most recent activities for a user
export const getRecentActivities = async (userId) => {
  const activityQuery = query(
    collection(db, ACTIVITY_COLLECTION), 
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'), // Order by most recent
    limit(5) // Get the latest 5 activities
  );
  
  const querySnapshot = await getDocs(activityQuery);
  const activities = [];
  querySnapshot.forEach((doc) => {
    activities.push({ id: doc.id, ...doc.data() });
  });
  
  return activities;
};