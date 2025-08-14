// File: worknest/client/src/components/MainLayout.jsx

import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { logout } from '../services/authService';
import Sidebar from './Sidebar';
import { Button } from './ui/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from './ui/DropdownMenu';
import { LogOut, User } from 'lucide-react';

// Helper to get the user's initials
const getInitials = (email) => {
  if (!email) return 'U';
  return email.charAt(0).toUpperCase();
};

// Helper to get the page title from the URL
const getPageTitle = (pathname) => {
  const path = pathname.split('/')[1];
  if (!path || path === 'dashboard') return 'Dashboard';
  // Capitalize the first letter
  return path.charAt(0).toUpperCase() + path.slice(1);
};

const MainLayout = ({ children }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-secondary font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-background border-b p-4 h-16 flex justify-between items-center relative z-10">
          {/* Dynamic Page Title */}
          <h2 className="text-xl font-semibold text-foreground">
            {getPageTitle(location.pathname)}
          </h2>
          
          {/* User Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <div className="flex items-center justify-center h-9 w-9 rounded-full bg-primary text-primary-foreground font-semibold">
                  {getInitials(currentUser?.email)}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">My Account</p>
                  <p className="text-xs leading-none text-muted-foreground truncate">{currentUser?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
