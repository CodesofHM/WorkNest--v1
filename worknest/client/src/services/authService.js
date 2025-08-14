// File: worknest/client/src/services/authService.js

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile, // Import updateProfile
  updatePassword, // Import updatePassword
} from 'firebase/auth';
import { auth } from './firebase';

// Sign Up Function
export const signup = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Log In Function
export const login = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Log Out Function
export const logout = () => {
  return signOut(auth);
};

// NEW: Function to update user's profile (name and photo)
export const updateUserProfile = (user, profileData) => {
  return updateProfile(user, profileData);
};

// NEW: Function to update user's password
export const changeUserPassword = (user, newPassword) => {
  return updatePassword(user, newPassword);
};