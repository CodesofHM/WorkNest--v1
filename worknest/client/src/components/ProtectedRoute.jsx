// File: worknest/client/src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // If there is no user, redirect to the login page
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;