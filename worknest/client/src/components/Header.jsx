import React from 'react';
import { Search, Bell } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Header = () => {
  const { currentUser } = useAuth();

  return (
    <header className="flex justify-between items-center p-4 bg-white border-b">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">
          Good morning, {currentUser?.displayName || 'there'}
        </h1>
        <p className="text-sm text-gray-500">Welcome to your WorkNest Dashboard</p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-64 pl-10 pr-4 py-2 border rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Bell className="h-6 w-6 text-gray-600" />
        </button>
      </div>
    </header>
  );
};

export default Header;