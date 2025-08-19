// File: worknest/client/src/pages/InvoicesPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getClientsForUser } from '../services/clientService';
import { addInvoice, getInvoicesForUser } from '../services/invoiceService';
import AddInvoiceForm from '../components/invoices/AddInvoiceForm';
import InvoiceList from '../components/invoices/InvoiceList';
import { Button } from '../components/ui/Button';
import { PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

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

  if (isFormVisible) {
    return (
      <AddInvoiceForm
        clients={clients}
        onSave={handleSaveInvoice}
        onCancel={() => setIsFormVisible(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">Create and manage your invoices.</p>
        </div>
        <Button onClick={() => setIsFormVisible(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Invoice
        </Button>
      </div>

      <Card>
        <CardContent>
          <InvoiceList invoices={invoices} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoicesPage;