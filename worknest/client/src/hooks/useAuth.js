// File: worknest/client/src/hooks/useAuth.js

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // Import the context

export const useAuth = () => {
  return useContext(AuthContext);
};