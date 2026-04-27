// File: worknest/client/src/services/authService.js

import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  getMultiFactorResolver,
  linkWithCredential,
  multiFactor,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  updateProfile, // Import updateProfile
  updatePassword, // Import updatePassword
  reauthenticateWithCredential,
} from 'firebase/auth';
import { auth } from './firebase';

// Sign Up Function
export const signup = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const convertGuestToAccount = (email, password) => {
  if (!auth.currentUser?.isAnonymous) {
    return signup(email, password);
  }

  const credential = EmailAuthProvider.credential(email, password);
  return linkWithCredential(auth.currentUser, credential);
};

// Log In Function
export const login = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const getMfaResolver = (error) => {
  return getMultiFactorResolver(auth, error);
};

export const createRecaptchaVerifier = (containerId) => {
  return new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
  });
};

export const sendMfaLoginCode = ({ resolver, hint, recaptchaVerifier }) => {
  const phoneProvider = new PhoneAuthProvider(auth);
  return phoneProvider.verifyPhoneNumber({
    multiFactorHint: hint,
    session: resolver.session,
  }, recaptchaVerifier);
};

export const completeMfaLogin = ({ resolver, verificationId, code }) => {
  const credential = PhoneAuthProvider.credential(verificationId, code);
  const assertion = PhoneMultiFactorGenerator.assertion(credential);
  return resolver.resolveSignIn(assertion);
};

export const loginAsGuest = () => {
  return signInAnonymously(auth);
};

// Log Out Function
export const logout = () => {
  return signOut(auth);
};

export const resetPassword = (email) => {
  return sendPasswordResetEmail(auth, email);
};

export const sendPhoneMfaEnrollmentCode = async ({ user, phoneNumber, recaptchaVerifier }) => {
  const session = await multiFactor(user).getSession();
  const phoneProvider = new PhoneAuthProvider(auth);
  return phoneProvider.verifyPhoneNumber({ phoneNumber, session }, recaptchaVerifier);
};

export const completePhoneMfaEnrollment = async ({ user, verificationId, code, displayName = 'Phone number' }) => {
  const credential = PhoneAuthProvider.credential(verificationId, code);
  const assertion = PhoneMultiFactorGenerator.assertion(credential);
  return multiFactor(user).enroll(assertion, displayName);
};

export const getEnrolledFactors = (user) => {
  return multiFactor(user).enrolledFactors || [];
};

// NEW: Function to update user's profile (name and photo)
export const updateUserProfile = (user, profileData) => {
  return updateProfile(user, profileData);
};

// NEW: Function to update user's password
export const reauthenticateUser = (user, email, password) => {
  const credential = EmailAuthProvider.credential(email, password);
  return reauthenticateWithCredential(user, credential);
};

export const changeUserPassword = (user, newPassword) => {
  return updatePassword(user, newPassword);
};
