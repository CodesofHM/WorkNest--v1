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
import InvoicesPage from './pages/InvoicesPage';
import PricingTemplatesPage from './pages/PricingTemplatesPage';
import ProfilePage from './pages/ProfilePage'; // Import the new profile page

function App() {
  const { currentUser } = useAuth();

  return (
    <Router>
      <Routes>
        
        {/* --- Public Authentication Routes --- */}
        <Route path="/login" element={currentUser ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/signup" element={currentUser ? <Navigate to="/dashboard" /> : <SignupPage />} />

        {/* --- Protected Application Routes --- */}
        <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
        <Route path="/clients" element={<ProtectedRoute><MainLayout><ClientsPage /></MainLayout></ProtectedRoute>} />
        <Route path="/clients/:clientId" element={<ProtectedRoute><MainLayout><ClientProfilePage /></MainLayout></ProtectedRoute>} />
        <Route path="/proposals" element={<ProtectedRoute><MainLayout><ProposalsPage /></MainLayout></ProtectedRoute>} />
        <Route path="/contracts" element={<ProtectedRoute><MainLayout><ContractsPage /></MainLayout></ProtectedRoute>} />
        <Route path="/invoices" element={<ProtectedRoute><MainLayout><InvoicesPage /></MainLayout></ProtectedRoute>} />
        <Route path="/templates" element={<ProtectedRoute><MainLayout><PricingTemplatesPage /></MainLayout></ProtectedRoute>} />
        
        {/* ADD THIS NEW ROUTE FOR THE PROFILE PAGE */}
        <Route path="/profile" element={<ProtectedRoute><MainLayout><ProfilePage /></MainLayout></ProtectedRoute>} />
        
        {/* --- Default Redirect Route --- */}
        <Route path="*" element={<Navigate to={currentUser ? "/dashboard" : "/login"} />} />

      </Routes>
    </Router>
  );
}

export default App;