import React from 'react';

const Modal = ({ children, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        {children}
        <button onClick={onClose} className="absolute top-2 right-3 text-2xl leading-none text-gray-500 hover:text-gray-800">
          &times;
        </button>
      </div>
    </div>
  );
};

export default Modal;
