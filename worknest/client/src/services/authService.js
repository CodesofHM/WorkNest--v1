// File: worknest/client/src/services/authService.js

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from './firebase'; // Imports the 'auth' object from your firebase.js

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