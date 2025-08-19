// File: worknest/client/src/pages/ClientProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getClientById } from '../services/clientService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

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
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">{client.name}</h1>
        <p className="text-muted-foreground">{client.company}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {(client.tags || []).map(tag => (
            <span key={tag} className="px-2.5 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p><strong>Email:</strong> {client.email}</p>
            <p><strong>Phone:</strong> {client.phone}</p>
            <p><strong>Address:</strong> {client.address}</p>
            <p><strong>Preferred Contact:</strong> {client.communicationChannel}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{client.notes || 'No notes for this client.'}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientProfilePage;