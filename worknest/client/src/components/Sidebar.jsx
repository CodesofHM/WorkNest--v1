// File: worknest/client/src/components/Sidebar.jsx

import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  // This function applies different styles if the link is active
  const navLinkClasses = ({ isActive }) =>
    isActive
      ? 'block w-full text-left px-4 py-2 rounded-md bg-blue-600 text-white transition-colors duration-200'
      : 'block w-full text-left px-4 py-2 rounded-md hover:bg-gray-100 transition-colors duration-200';

  return (
    <aside className="w-64 bg-white p-4 shadow-lg flex-shrink-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 text-center">WorkNest</h1>
      </div>
      <nav className="space-y-2">
        <NavLink to="/dashboard" className={navLinkClasses}>
          Dashboard
        </NavLink>
        <NavLink to="/clients" className={navLinkClasses}>
          Clients
        </NavLink>
        <NavLink to="/proposals" className={navLinkClasses}>
            Proposals
        </NavLink>
        {/* We will add more links here later for proposals, invoices, etc. */}
      </nav>
    </aside>
  );
};

export default Sidebar;