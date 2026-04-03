// src/app/clients/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ClientModal from '@/components/ClientModal';
import { FiPlusCircle, FiEdit2, FiTrash2, FiUsers } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const res = await fetch('/api/clients');
      setClients(await res.json());
    } catch (error) {
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const deleteClient = async (id: string) => {
    if (!confirm('Are you sure? This will also affect related invoices.')) return;
    try {
      const res = await fetch(`/api/clients?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setClients(clients.filter((c) => c.id !== id));
        toast.success('Client deleted');
      }
    } catch (error) {
      toast.error('Failed to delete client');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Header title="Clients" subtitle={`${clients.length} clients`} />
        <button
          onClick={() => {
            setEditingClient(null);
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlusCircle className="w-5 h-5" /> Add Client
        </button>
      </div>

      <div className="card">
        {clients.length === 0 ? (
          <div className="text-center py-12">
            <FiUsers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No clients yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              Add your first client
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client) => (
              <div
                key={client.id}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-800">{client.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{client.address}</p>
                    {client.email && (
                      <p className="text-sm text-gray-500">{client.email}</p>
                    )}
                    {client.phone && (
                      <p className="text-sm text-gray-500">{client.phone}</p>
                    )}
                    <p className="text-xs text-purple-600 mt-2">
                      {client._count?.invoices || 0} invoices
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingClient(client);
                        setShowModal(true);
                      }}
                      className="text-gray-400 hover:text-purple-600 p-1"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteClient(client.id)}
                      className="text-gray-400 hover:text-red-600 p-1"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ClientModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={() => loadClients()}
        client={editingClient}
      />
    </div>
  );
}