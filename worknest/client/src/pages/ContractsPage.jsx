// File: worknest/client/src/pages/ContractsPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getClientsForUser } from '../services/clientService';
import { addContract, getContractsForUser } from '../services/contractService';
import AddContractForm from '../components/contracts/AddContractForm';
import ContractList from '../components/contracts/ContractList';

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
    <div className="p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Contracts</h1>
        <button
          onClick={() => setIsFormVisible(true)}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition"
        >
          + New Contract
        </button>
      </header>
      <main className="bg-white p-6 rounded-lg shadow-md">
        {isFormVisible ? (
          <AddContractForm clients={clients} onSave={handleSaveContract} onCancel={() => setIsFormVisible(false)} />
        ) : (
          <ContractList contracts={contracts} loading={loading} />
        )}
      </main>
    </div>
  );
};

export default ContractsPage;