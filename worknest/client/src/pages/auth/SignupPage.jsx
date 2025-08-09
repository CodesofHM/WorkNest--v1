// File: worknest/client/src/pages/auth/SignupPage.jsx

import React, { useState } from 'react';
// 1. Import useNavigate for redirection
import { Link, useNavigate } from 'react-router-dom'; 
// 2. Import your signup function from the auth service
import { signup } from '../../services/authService'; 

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  // 3. Add the missing 'loading' state
  const [loading, setLoading] = useState(false); 
  // 4. Initialize the navigate function
  const navigate = useNavigate(); 

  const handleSignup = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    console.log("Signup process started...");

    signup(email, password)
      .then((userCredential) => {
        console.log("SUCCESS: User created.", userCredential);
        navigate('/dashboard'); // This will now work
      })
      .catch((error) => {
        console.error("ERROR: Signup failed.", error);
        setError(`Error: ${error.message}`);
      })
      .finally(() => {
        console.log("Signup process finished.");
        setLoading(false); // This will now work
      });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Create Your WorkNest Account
        </h2>
        <form onSubmit={handleSignup}>
          {/* Email input field */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>
          {/* Password input field */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          {/* Error message display */}
          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
          {/* Submit button */}
          <button
            type="submit"
            disabled={loading} // The button will be disabled while loading
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-blue-400"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        {/* Link to login page */}
        <p className="text-center text-gray-600 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;