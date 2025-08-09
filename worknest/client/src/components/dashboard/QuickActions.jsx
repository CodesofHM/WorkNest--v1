// File: worknest/client/src/components/dashboard/QuickActions.jsx

import React from 'react';

const QuickActions = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
      <div className="flex flex-col space-y-3">
        <button className="w-full text-left bg-blue-500 text-black px-4 py-2 rounded-lg hover:bg-blue-600 transition">
          + Add New Client
        </button>
        <button className="w-full text-left bg-green-500 text-black px-4 py-2 rounded-lg hover:bg-green-600 transition">
          + New Proposal
        </button>
        <button className="w-full text-left bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-600 transition">
          + New Invoice
        </button>
      </div>
    </div>
  );
};

export default QuickActions;