// File: worknest/client/src/pages/PricingTemplatesPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { addTemplate, getTemplatesForUser, deleteTemplate } from '../services/pricingTemplateService';
import AddTemplateForm from '../components/templates/AddTemplateForm';
import TemplateList from '../components/templates/TemplateList';
import { Button } from '../components/ui/Button';
import { PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

const PricingTemplatesPage = () => {
  const { currentUser } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);

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
      await addTemplate(currentUser.uid, templateData);
      setIsFormVisible(false);
      fetchData(); // Refresh the list
    } catch (error) {
      console.error("Error adding template:", error);
    }
  };
  
  const handleDeleteTemplate = async (templateId) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      try {
        await deleteTemplate(templateId);
        fetchData();
      } catch (error) {
        console.error("Error deleting template:", error);
      }
    }
  };

  if (isFormVisible) {
    return (
      <AddTemplateForm
        onSave={handleSaveTemplate}
        onCancel={() => setIsFormVisible(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pricing Templates</h1>
          <p className="text-muted-foreground">Create and manage your pricing templates.</p>
        </div>
        <Button onClick={() => setIsFormVisible(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>

      <Card>
        <CardContent>
          <TemplateList templates={templates} loading={loading} onDelete={handleDeleteTemplate} />
        </CardContent>
      </Card>
    </div>
  );
};

export default PricingTemplatesPage;