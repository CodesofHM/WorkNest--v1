import React from 'react';

const ProfileModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="bg-white p-6 rounded shadow-lg z-10 max-w-2xl w-full">
        {children}
      </div>
    </div>
  );
};

export default ProfileModal;
