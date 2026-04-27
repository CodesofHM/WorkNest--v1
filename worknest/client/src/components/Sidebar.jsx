import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard, Users, FileText, FileSignature, Receipt, LogOut, Settings, UserCircle, Menu, X } from 'lucide-react';
import BrandLogo from './layout/BrandLogo';
import { isGuestUser } from '../utils/guestMode';

const Sidebar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const isGuest = isGuestUser(currentUser);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

  const toggleMobileMore = () => {
    setMobileMoreOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
      isActive
        ? 'bg-slate-950 text-white shadow-sm'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  const mobileNavItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/clients', label: 'Clients', icon: Users },
    { to: '/proposals', label: 'Proposals', icon: FileText },
    { to: '/contracts', label: 'Contracts', icon: FileSignature },
    { to: '/invoices', label: 'Invoices', icon: Receipt },
  ];

  const mobileMoreItems = [
    { to: '/templates', label: 'Templates', icon: FileText },
    { to: '/account', label: 'Account', icon: UserCircle },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
    <aside className="hidden w-72 flex-shrink-0 border-r border-slate-200/80 bg-white/90 shadow-sm backdrop-blur lg:flex lg:flex-col">
      <div className="border-b border-slate-200 px-6 py-6">
        <BrandLogo imageClassName="h-11 rounded-2xl" />
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
        <div className="border-t border-slate-200 p-4">
          <NavLink to="/account" className="mb-3 flex w-full items-center rounded-2xl p-2 text-left transition hover:bg-slate-100">
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="Profile" className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <UserCircle className="h-10 w-10 text-muted-foreground" />
            )}
            <div className="ml-3">
              <p className="text-sm font-semibold text-slate-800">{isGuest ? 'Guest Account' : currentUser?.displayName || 'User'}</p>
              <p className="text-xs text-slate-500">{isGuest ? '' : 'View Profile'}</p>
            </div>
          </NavLink>
          <div className="flex gap-2">
            <NavLink to="/settings" className={({ isActive }) => `flex-1 ${navLinkClass({ isActive })}`}>
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </NavLink>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Log out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </aside>

    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 px-3 py-2 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
      <div className="grid grid-cols-5 gap-2">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `inline-flex flex-col items-center justify-center rounded-3xl px-2 py-2 text-[11px] font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-950 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span className="mt-1">{item.label}</span>
            </NavLink>
          );
        })}
        <button
          type="button"
          onClick={toggleMobileMore}
          className="inline-flex flex-col items-center justify-center rounded-3xl px-2 py-2 text-[11px] font-semibold text-slate-600 transition-all hover:bg-slate-100"
        >
          <Menu className="h-5 w-5" />
          <span className="mt-1">More</span>
        </button>
      </div>
    </div>

    {mobileMoreOpen ? (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 lg:hidden">
        <div className="w-full rounded-t-3xl bg-white px-5 pb-6 pt-5 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">More</p>
              <p className="text-xs text-slate-500">Quick access to extra actions</p>
            </div>
            <button
              type="button"
              onClick={toggleMobileMore}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700"
              aria-label="Close more menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid gap-3">
            {mobileMoreItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={toggleMobileMore}
                  className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              );
            })}
            <button
              type="button"
              onClick={() => {
                toggleMobileMore();
                handleLogout();
              }}
              className="flex items-center gap-3 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>
    ) : null}
    </>
  );
};

export default Sidebar;
