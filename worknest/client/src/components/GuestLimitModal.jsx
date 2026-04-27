import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, X } from 'lucide-react';
import { Button } from './ui/Button';

const GuestLimitModal = ({ isOpen, resourceName = 'feature', onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleNavigate = (path) => {
    onClose?.();
    navigate(path, { state: { fromGuestLimit: true } });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="pr-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Guest limit reached</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950">Log in or sign up to keep going.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Guest accounts can try one {resourceName}. Create an account to unlock more clients, proposals, invoices, and full AI exports.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button type="button" onClick={() => handleNavigate('/signup')}>
            <UserPlus className="mr-2 h-4 w-4" />
            Sign Up
          </Button>
          <Button type="button" variant="outline" onClick={() => handleNavigate('/login')}>
            <LogIn className="mr-2 h-4 w-4" />
            Log In
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GuestLimitModal;
