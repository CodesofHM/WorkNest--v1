// File: worknest/client/src/pages/InvoicesPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getClientsForUser } from '../services/clientService';
import { addInvoice, getInvoicesForUser } from '../services/invoiceService';
import AddInvoiceForm from '../components/invoices/AddInvoiceForm';
import InvoiceList from '../components/invoices/InvoiceList';

const InvoicesPage = () => {
  const { currentUser } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const fetchData = async () => {
    if (currentUser) {
      try {
        const [userInvoices, userClients] = await Promise.all([
          getInvoicesForUser(currentUser.uid),
          getClientsForUser(currentUser.uid)
        ]);
        setInvoices(userInvoices);
        setClients(userClients);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const handleSaveInvoice = async (invoiceData) => {
    try {
      await addInvoice(currentUser.uid, invoiceData);
      setIsFormVisible(false);
      fetchData(); // Refresh the list
    } catch (error) {
      console.error("Error adding invoice:", error);
    }
  };

  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Invoices</h1>
        <button
          onClick={() => setIsFormVisible(true)}
          className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
        >
          + New Invoice
        </button>
      </header>
      <main className="bg-white p-6 rounded-lg shadow-md">
        {isFormVisible ? (
          <AddInvoiceForm clients={clients} onSave={handleSaveInvoice} onCancel={() => setIsFormVisible(false)} />
        ) : (
          <InvoiceList invoices={invoices} loading={loading} />
        )}
      </main>
    </div>
  );
};

export default InvoicesPage;