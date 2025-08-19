import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard, Users, FileText, FileSignature, Receipt, LogOut, Settings, Bot, UserCircle } from 'lucide-react';

const Sidebar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

    return (
    <aside className="w-64 flex-shrink-0 bg-white shadow-lg flex flex-col">
      <div className="h-16 flex items-center justify-center border-b">
        <Bot size={28} className="text-primary" />
        <h1 className="text-xl font-bold ml-2 text-gray-800">WorkNest</h1>
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <nav className="p-4 space-y-2">
          <NavLink to="/dashboard" className={navLinkClass}>
            <LayoutDashboard className="mr-3 h-5 w-5" />
            Dashboard
          </NavLink>
          <NavLink to="/clients" className={navLinkClass}>
            <Users className="mr-3 h-5 w-5" />
            Clients
          </NavLink>
          <NavLink to="/proposals" className={navLinkClass}>
            <FileText className="mr-3 h-5 w-5" />
            Proposals
          </NavLink>
          <NavLink to="/contracts" className={navLinkClass}>
            <FileSignature className="mr-3 h-5 w-5" />
            Contracts
          </NavLink>
          <NavLink to="/invoices" className={navLinkClass}>
            <Receipt className="mr-3 h-5 w-5" />
            Invoices
          </NavLink>
          <NavLink to="/templates" className={navLinkClass}>
            <FileText className="mr-3 h-5 w-5" />
            Templates
          </NavLink>
        </nav>
        <div className="p-4 border-t">
          <NavLink to="/account" className="flex items-center mb-4 w-full text-left hover:bg-gray-100 p-2 rounded-lg">
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="Profile" className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <UserCircle className="h-10 w-10 text-muted-foreground" />
            )}
            <div className="ml-3">
              <p className="text-sm font-semibold text-gray-800">{currentUser?.displayName || 'User'}</p>
              <p className="text-xs text-gray-500">View Profile</p>
            </div>
          </NavLink>
          <NavLink to="/settings" className={navLinkClass}>
            <Settings className="mr-3 h-5 w-5" />
            Settings
          </NavLink>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;