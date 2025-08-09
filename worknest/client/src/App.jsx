// File: worknest/client/src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Hooks & Context
import { useAuth } from './hooks/useAuth';

// Import Layouts & Route Protectors
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Import Page Components
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import Dashboard from './pages/Dashboard';
import ClientsPage from './pages/ClientsPage';
import ClientProfilePage from './pages/ClientProfilePage';
import ProposalsPage from './pages/ProposalsPage';
import ContractsPage from './pages/ContractsPage';

function App() {
  const { currentUser } = useAuth();

  return (
    <Router>
      <Routes>
        
        {/* --- Public Authentication Routes --- */}
        {/* These routes are for users who are NOT logged in. */}
        {/* If a logged-in user tries to access them, they are redirected to the dashboard. */}
        <Route 
          path="/login" 
          element={currentUser ? <Navigate to="/dashboard" /> : <LoginPage />} 
        />
        <Route 
          path="/signup" 
          element={currentUser ? <Navigate to="/dashboard" /> : <SignupPage />} 
        />

        {/* --- Protected Application Routes --- */}
        {/* These routes are wrapped in a layout and can only be accessed by logged-in users. */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ClientsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients/:clientId" // Dynamic route for individual client profiles
          element={
            <ProtectedRoute>
              <MainLayout>
                <ClientProfilePage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/proposals"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ProposalsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/contracts"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ContractsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        {/* --- Default Redirect Route --- */}
        {/* This catches any other URL and redirects the user appropriately. */}
        <Route 
          path="*" 
          element={<Navigate to={currentUser ? "/dashboard" : "/login"} />} 
        />

      </Routes>
    </Router>
  );
}

export default App;
