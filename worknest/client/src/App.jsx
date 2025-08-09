// File: worknest/client/src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute'; // Import the component
import { useAuth } from './hooks/useAuth';

function App() {
  const { currentUser } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Auth Routes: Redirect if user is already logged in */}
        <Route path="/login" element={currentUser ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/signup" element={currentUser ? <Navigate to="/dashboard" /> : <SignupPage />} />

        {/* Protected App Route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Default route now depends on login status */}
        <Route path="*" element={<Navigate to={currentUser ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;