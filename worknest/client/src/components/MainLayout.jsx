import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header'; // Import the new Header
import FloatingAIChatWidget from './ai/FloatingAIChatWidget';

const MainLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.08),_transparent_26%),linear-gradient(180deg,_#f8fafc,_#eef2ff)]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="app-fade-in flex-1 overflow-x-hidden overflow-y-auto px-4 py-5 pb-28 md:px-6 md:py-6 md:pb-6">
          {children}
        </main>
      </div>
      <FloatingAIChatWidget />
    </div>
  );
};

export default MainLayout;
