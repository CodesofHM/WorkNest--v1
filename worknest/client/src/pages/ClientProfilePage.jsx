// File: worknest/client/src/pages/ClientProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getClientById } from '../services/clientService';

const ClientProfilePage = () => {
  const { clientId } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const docSnap = await getClientById(clientId);
        if (docSnap.exists()) {
          setClient({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("No such client!");
        }
      } catch (error) {
        console.error("Error fetching client:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [clientId]);

  if (loading) return <div className="p-8">Loading client profile...</div>;
  if (!client) return <div className="p-8">Client not found.</div>;

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{client.name}</h1>
        <p className="text-gray-600">{client.company}</p>
        {/* NEW: Display tags in the header */}
        <div className="flex flex-wrap gap-2 mt-4">
          {(client.tags || []).map(tag => (
            <span key={tag} className="px-2.5 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Client Details */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Contact Info</h3>
          <div className="space-y-3 text-gray-700">
            <p><strong>Email:</strong> {client.email}</p>
            <p><strong>Phone:</strong> {client.phone}</p>
            <p><strong>Address:</strong> {client.address}</p>
            <p><strong>Preferred Contact:</strong> {client.communicationChannel}</p>
          </div>
        </div>
        
        {/* Notes */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Notes</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{client.notes || 'No notes for this client.'}</p>
        </div>
      </div>
    </div>
  );
};

export default ClientProfilePage;