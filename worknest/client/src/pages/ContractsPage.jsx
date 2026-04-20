import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { getClientsForUser } from '../services/clientService';
import { addContract, deleteContract, getContractsForUser, updateContract } from '../services/contractService';
import AddContractForm from '../components/contracts/AddContractForm';
import ContractList from '../components/contracts/ContractList';
import { Button } from '../components/ui/Button';
import { PlusCircle, FileSignature, CircleCheckBig, Clock3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import PageHero from '../components/layout/PageHero';

const ContractsPage = () => {
  const { currentUser } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingContract, setEditingContract] = useState(null);

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
      if (editingContract) {
        await updateContract(editingContract.id, contractData, currentUser.uid);
        toast.success('Contract updated successfully!');
      } else {
        await addContract(currentUser.uid, contractData);
        toast.success('Contract added successfully!');
      }
      setIsFormVisible(false);
      setEditingContract(null);
      fetchData();
    } catch (error) {
      console.error("Error saving contract:", error);
      toast.error('Failed to save contract.');
    }
  };

  const handleDeleteContract = async (contract) => {
    if (!window.confirm('Are you sure you want to delete this contract?')) return;

    try {
      await deleteContract(contract.id, currentUser.uid, contract.title);
      toast.success('Contract deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting contract:', error);
      toast.error('Failed to delete contract.');
    }
  };

  const draftContracts = contracts.filter((contract) => contract.status === 'Draft').length;
  const activeContracts = contracts.filter((contract) => contract.status === 'Active' || contract.status === 'Sent').length;
  const signedContracts = contracts.filter((contract) => contract.status === 'Signed' || contract.status === 'Completed').length;

  if (isFormVisible) {
    return (
      <AddContractForm
        clients={clients}
        initialData={editingContract}
        onSave={handleSaveContract}
        onCancel={() => { setIsFormVisible(false); setEditingContract(null); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHero
        themeClassName="bg-[linear-gradient(135deg,#111827_0%,#1f2937_45%,#0f766e_100%)]"
        badgeText="Contract Desk"
        title="Keep agreements organized from early draft to signed client commitment."
        description="Manage contract records with a cleaner workspace that helps you review client alignment, status, and readiness at a glance."
        helperLabel="Quick start"
        helperText="Create a new contract when a proposal moves forward and you want to formalize project terms."
        actionLabel="New Contract"
        actionIcon={PlusCircle}
        onAction={() => { setEditingContract(null); setIsFormVisible(true); }}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200 bg-white/95 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Drafts</p>
              <p className="mt-2 text-3xl font-semibold">{draftContracts}</p>
            </div>
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
              <Clock3 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-white/95 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Active / Sent</p>
              <p className="mt-2 text-3xl font-semibold">{activeContracts}</p>
            </div>
            <div className="rounded-2xl bg-sky-50 p-3 text-sky-700">
              <FileSignature className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-white/95 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Signed / Completed</p>
              <p className="mt-2 text-3xl font-semibold">{signedContracts}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <CircleCheckBig className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 bg-white/95 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Contract Library</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Review agreement status, update drafts, and keep client contracts easy to manage.</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200">
            Total contracts <span className="font-semibold text-slate-900">{contracts.length}</span>
          </div>
        </CardHeader>
        <CardContent>
          <ContractList
            contracts={contracts}
            loading={loading}
            onEdit={(contract) => { setEditingContract(contract); setIsFormVisible(true); }}
            onDelete={handleDeleteContract}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractsPage;
