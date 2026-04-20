import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, Settings, UserCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const pageContent = {
  '/dashboard': {
    title: 'Dashboard',
    subtitle: 'See what needs attention across clients, proposals, and payments.',
  },
  '/clients': {
    title: 'Clients',
    subtitle: 'Manage relationships, contact details, and client history in one place.',
  },
  '/proposals': {
    title: 'Proposals',
    subtitle: 'Draft, preview, and manage proposal workflows with cleaner branding.',
  },
  '/contracts': {
    title: 'Contracts',
    subtitle: 'Turn approved work into clear agreements and track completion.',
  },
  '/invoices': {
    title: 'Invoices',
    subtitle: 'Track billing, overdue balances, and payment follow-ups.',
  },
  '/templates': {
    title: 'Templates',
    subtitle: 'Reuse pricing structures and common service packages faster.',
  },
  '/account': {
    title: 'My Account',
    subtitle: 'Keep your profile and business identity up to date.',
  },
  '/settings': {
    title: 'Settings',
    subtitle: 'Control branding, PDF styles, and document defaults.',
  },
};

const Header = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const routeMatch = Object.keys(pageContent).find((route) => location.pathname.startsWith(route));
  const activePage = pageContent[routeMatch] || {
    title: `Good morning, ${currentUser?.displayName || 'there'}`,
    subtitle: 'Welcome back to WorkNest.',
  };

  return (
    <header className="border-b border-slate-200/80 bg-white/80 px-4 py-4 backdrop-blur md:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium text-sky-700">Good morning, {currentUser?.displayName || 'there'}</p>
          <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">{activePage.title}</h1>
          {location.pathname === '/dashboard' ? null : <p className="text-sm text-slate-500">{activePage.subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients, proposals, invoices..."
              className="w-56 rounded-full border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary md:w-72"
            />
          </div>
          <NavLink to="/account" className="inline-flex rounded-full border border-slate-200 bg-white p-2.5 transition hover:bg-slate-50 sm:hidden">
            <UserCircle className="h-5 w-5 text-gray-600" />
          </NavLink>
          <NavLink to="/settings" className="inline-flex rounded-full border border-slate-200 bg-white p-2.5 transition hover:bg-slate-50 sm:hidden">
            <Settings className="h-5 w-5 text-gray-600" />
          </NavLink>
          <button className="rounded-full border border-slate-200 bg-white p-2.5 transition hover:bg-slate-50">
            <Bell className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
