// File: worknest/client/src/components/Sidebar.jsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard, Users, FileText, FileSignature, Receipt, Tags, LogOut } from 'lucide-react';

const Sidebar = () => {
  const { currentUser } = useAuth();

  const navLinkClasses = ({ isActive }) =>
    `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
    }`;

  const navItems = [
    { to: "/dashboard", icon: <LayoutDashboard className="h-4 w-4 mr-3" />, label: "Dashboard" },
    { to: "/clients", icon: <Users className="h-4 w-4 mr-3" />, label: "Clients" },
    { to: "/proposals", icon: <FileText className="h-4 w-4 mr-3" />, label: "Proposals" },
    { to: "/contracts", icon: <FileSignature className="h-4 w-4 mr-3" />, label: "Contracts" },
    { to: "/invoices", icon: <Receipt className="h-4 w-4 mr-3" />, label: "Invoices" },
    { to: "/templates", icon: <Tags className="h-4 w-4 mr-3" />, label: "Pricing Templates" },
  ];

  return (
    <aside className="w-64 bg-background border-r flex flex-col">
      {/* Logo Section */}
      <div className="p-4 border-b h-16 flex items-center">
        <h1 className="text-2xl font-bold text-foreground">WorkNest</h1>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={navLinkClasses}>
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User Profile Section at the Bottom */}
      <div className="p-4 border-t mt-auto">
        <div className="flex items-center">
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground truncate">{currentUser?.email}</p>
            <p className="text-xs text-muted-foreground">Freelancer Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;