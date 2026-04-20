import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { addTemplate, getTemplatesForUser, removeTemplate, updateTemplate } from '../services/pricingTemplateService';
import AddTemplateForm from '../components/templates/AddTemplateForm';
import TemplateList from '../components/templates/TemplateList';
import { Button } from '../components/ui/Button';
import { PlusCircle, Layers3, PackageOpen, BadgeCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import PageHero from '../components/layout/PageHero';

const PricingTemplatesPage = () => {
  const { currentUser } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const fetchData = async () => {
    if (currentUser) {
      try {
        const userTemplates = await getTemplatesForUser(currentUser.uid);
        setTemplates(userTemplates);
      } catch (error) {
        console.error("Error fetching templates:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const handleSaveTemplate = async (templateData) => {
    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, templateData, currentUser.uid);
        toast.success('Template updated successfully!');
      } else {
        await addTemplate(currentUser.uid, templateData);
        toast.success('Template added successfully!');
      }
      setIsFormVisible(false);
      setEditingTemplate(null);
      fetchData();
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error('Failed to save template.');
    }
  };
  
  const handleDeleteTemplate = async (template) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      try {
        await removeTemplate(template.id, currentUser.uid, template.templateName);
        toast.success('Template deleted successfully!');
        fetchData();
      } catch (error) {
        console.error("Error deleting template:", error);
        toast.error('Failed to delete template.');
      }
    }
  };

  const totalLineItems = templates.reduce((sum, template) => sum + (template.lineItems?.length || 0), 0);

  if (isFormVisible) {
    return (
      <AddTemplateForm
        initialData={editingTemplate}
        onSave={handleSaveTemplate}
        onCancel={() => { setIsFormVisible(false); setEditingTemplate(null); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHero
        themeClassName="bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_45%,#7c3aed_100%)]"
        badgeText="Template Library"
        title="Save your repeatable service packages once and reuse them across proposals."
        description="Templates help you keep pricing consistent, reduce typing, and turn common services into faster proposal creation."
        helperLabel="Best use"
        helperText="Store packages like retainers, website builds, or discovery work for one-click reuse."
        actionLabel="New Template"
        actionIcon={PlusCircle}
        onAction={() => { setEditingTemplate(null); setIsFormVisible(true); }}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200 bg-white/95 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Saved Templates</p>
              <p className="mt-2 text-3xl font-semibold">{templates.length}</p>
            </div>
            <div className="rounded-2xl bg-sky-50 p-3 text-sky-700">
              <Layers3 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-white/95 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Line Items Saved</p>
              <p className="mt-2 text-3xl font-semibold">{totalLineItems}</p>
            </div>
            <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-700">
              <PackageOpen className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-white/95 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Why It Helps</p>
              <p className="mt-2 text-sm font-medium text-slate-700">Reuse common packages inside proposals</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
              <BadgeCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 bg-white/95 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Template Library</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Refine the reusable packages you want available when building proposals.</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200">
            Reusable packages <span className="font-semibold text-slate-900">{templates.length}</span>
          </div>
        </CardHeader>
        <CardContent>
          <TemplateList
            templates={templates}
            loading={loading}
            onDelete={handleDeleteTemplate}
            onEdit={(template) => { setEditingTemplate(template); setIsFormVisible(true); }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PricingTemplatesPage;
