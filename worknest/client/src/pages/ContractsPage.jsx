// File: worknest/client/src/pages/ContractsPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getClientsForUser } from '../services/clientService';
import { addContract, getContractsForUser } from '../services/contractService';
import AddContractForm from '../components/contracts/AddContractForm';
import ContractList from '../components/contracts/ContractList';
import { Button } from '../components/ui/Button';
import { PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

const ContractsPage = () => {
  const { currentUser } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const fetchData = async () => {
    if (currentUser) {
      try {
        const [userContracts, userClients] = await Promise.all([
          getContractsForUser(currentUser.uid),
          getClientsForUser(currentUser.uid)
        ]);
        setContracts(userContracts);
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

  const handleSaveContract = async (contractData) => {
    try {
      await addContract(currentUser.uid, contractData);
      setIsFormVisible(false);
      fetchData(); // Refresh the list
    } catch (error) {
      console.error("Error adding contract:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Contracts</h1>
          <p className="text-muted-foreground">Create and manage your contracts.</p>
        </div>
        <Button onClick={() => setIsFormVisible(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Contract
        </Button>
      </div>

      <Card>
        <CardContent>
          <ContractList contracts={contracts} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractsPage;