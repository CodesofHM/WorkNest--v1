// File: worknest/client/src/pages/PricingTemplatesPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { addTemplate, getTemplatesForUser, deleteTemplate } from '../services/pricingTemplateService';
import AddTemplateForm from '../components/templates/AddTemplateForm';
import TemplateList from '../components/templates/TemplateList';

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

  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Pricing Templates</h1>
        <button
          onClick={() => setIsFormVisible(true)}
          className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition"
        >
          + New Template
        </button>
      </header>
      <main className="bg-white p-6 rounded-lg shadow-md">
        {isFormVisible ? (
          <AddTemplateForm onSave={handleSaveTemplate} onCancel={() => setIsFormVisible(false)} />
        ) : (
          <TemplateList templates={templates} loading={loading} onDelete={handleDeleteTemplate} />
        )}
      </main>
    </div>
  );
};

export default PricingTemplatesPage;