import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Check, FilePlus2, PlusCircle, ReceiptText, Settings2, Users, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { getUserProfileMeta, saveUserSettings } from '../../services/userService';

const AVAILABLE_ACTIONS = [
  {
    id: 'add-client',
    label: 'Add Client',
    description: 'Create a new client record',
    icon: <Users className="h-5 w-5 text-sky-600" />,
    path: '/clients',
  },
  {
    id: 'new-proposal',
    label: 'New Proposal',
    description: 'Draft pricing or scope quickly',
    icon: <FilePlus2 className="h-5 w-5 text-indigo-600" />,
    path: '/proposals',
  },
  {
    id: 'new-invoice',
    label: 'New Invoice',
    description: 'Start a bill or payment request',
    icon: <ReceiptText className="h-5 w-5 text-emerald-600" />,
    path: '/invoices',
  },
  {
    id: 'open-clients',
    label: 'Open Clients',
    description: 'Review your client pipeline',
    icon: <PlusCircle className="h-5 w-5 text-slate-700" />,
    path: '/clients',
  },
  {
    id: 'open-proposals',
    label: 'Open Proposals',
    description: 'Check draft and pending quotes',
    icon: <FilePlus2 className="h-5 w-5 text-fuchsia-600" />,
    path: '/proposals',
  },
  {
    id: 'open-invoices',
    label: 'Open Invoices',
    description: 'Review sent and overdue invoices',
    icon: <ReceiptText className="h-5 w-5 text-amber-600" />,
    path: '/invoices',
  },
];

const DEFAULT_ACTION_IDS = ['add-client', 'new-proposal', 'new-invoice', 'open-clients'];

const QuickActions = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [selectedActionIds, setSelectedActionIds] = useState(DEFAULT_ACTION_IDS);
  const [draftActionIds, setDraftActionIds] = useState(DEFAULT_ACTION_IDS);
  const [customizing, setCustomizing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadQuickActions = async () => {
      if (!currentUser) return;

      try {
        const profileMeta = await getUserProfileMeta(currentUser.uid);
        const savedIds = profileMeta.settings?.dashboardQuickActions;
        if (Array.isArray(savedIds) && savedIds.length > 0) {
          const filteredIds = savedIds.filter((id) => AVAILABLE_ACTIONS.some((action) => action.id === id)).slice(0, 4);
          if (filteredIds.length > 0) {
            setSelectedActionIds(filteredIds);
            setDraftActionIds(filteredIds);
          }
        }
      } catch (error) {
        console.error('Error loading dashboard quick actions:', error);
      }
    };

    loadQuickActions();
  }, [currentUser]);

  const selectedActions = useMemo(() => {
    return selectedActionIds
      .map((id) => AVAILABLE_ACTIONS.find((action) => action.id === id))
      .filter(Boolean);
  }, [selectedActionIds]);

  const toggleDraftAction = (actionId) => {
    setDraftActionIds((current) => {
      if (current.includes(actionId)) {
        return current.filter((id) => id !== actionId);
      }
      if (current.length >= 4) {
        toast.error('You can keep up to 4 quick actions.');
        return current;
      }
      return [...current, actionId];
    });
  };

  const handleSaveCustomActions = async () => {
    if (!currentUser) return;
    if (draftActionIds.length === 0) {
      toast.error('Select at least one quick action.');
      return;
    }

    try {
      setSaving(true);
      await saveUserSettings(currentUser.uid, { dashboardQuickActions: draftActionIds });
      setSelectedActionIds(draftActionIds);
      setCustomizing(false);
      toast.success('Quick actions updated.');
    } catch (error) {
      console.error('Error saving quick actions:', error);
      toast.error(error.message || 'Failed to save quick actions.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-slate-200 bg-white/95 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Quick Actions</CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setDraftActionIds(selectedActionIds);
            setCustomizing((current) => !current);
          }}
        >
          <Settings2 className="mr-2 h-4 w-4" />
          {customizing ? 'Close' : 'Customize'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {customizing ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-900">Choose up to 4 actions</p>
              <span className="text-xs text-slate-500">{draftActionIds.length}/4 selected</span>
            </div>
            <div className="grid gap-2">
              {AVAILABLE_ACTIONS.map((action) => {
                const selected = draftActionIds.includes(action.id);
                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => toggleDraftAction(action.id)}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                      selected
                        ? 'border-sky-200 bg-sky-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-white p-2 shadow-sm">{action.icon}</div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{action.label}</p>
                        <p className="text-xs text-slate-500">{action.description}</p>
                      </div>
                    </div>
                    <div className={`rounded-full p-1 ${selected ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {selected ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex justify-end">
              <Button type="button" size="sm" onClick={handleSaveCustomActions} disabled={saving}>
                {saving ? 'Saving...' : 'Save Actions'}
              </Button>
            </div>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
        {selectedActions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => navigate(action.path)}
            className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-sky-200 hover:bg-white hover:shadow-sm"
          >
            <div className="mt-0.5 rounded-xl bg-white p-2 shadow-sm">{action.icon}</div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{action.label}</p>
              <p className="mt-1 text-xs text-slate-500">{action.description}</p>
            </div>
          </button>
        ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
