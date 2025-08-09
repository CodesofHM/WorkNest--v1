// File: worknest/client/src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// 1. Export the context so other files can use it
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};