// src/components/BusinessModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Business {
  id?: string;
  name: string;
  address: string;
  email?: string;
  phone?: string;
  website?: string;
  logoUrl?: string;
  isDefault?: boolean;
}

interface BusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (business: Business) => void;
  business?: Business | null;
}

export default function BusinessModal({ isOpen, onClose, onSave, business }: BusinessModalProps) {
  const [form, setForm] = useState<Business>({
    name: '',
    address: '',
    email: '',
    phone: '',
    website: '',
    isDefault: false,
  });

  useEffect(() => {
    if (business) {
      setForm(business);
    } else {
      setForm({
        name: '',
        address: '',
        email: '',
        phone: '',
        website: '',
        isDefault: false,
      });
    }
  }, [business, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name || !form.address) {
      toast.error('Name and address are required');
      return;
    }

    try {
      const method = form.id ? 'PUT' : 'POST';
      const res = await fetch('/api/businesses', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      
      if (res.ok) {
        const saved = await res.json();
        onSave(saved);
        toast.success(form.id ? 'Business updated!' : 'Business created!');
        onClose();
      }
    } catch (error) {
      toast.error('Failed to save business');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">
            {form.id ? 'Edit Business' : 'Add Business'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Name *
            </label>
            <input
              type="text"
              className="input-field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address *
            </label>
            <textarea
              className="input-field"
              rows={3}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="input-field"
              value={form.email || ''}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="text"
              className="input-field"
              value={form.phone || ''}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="text"
              className="input-field"
              value={form.website || ''}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              className="w-4 h-4 text-purple-600 rounded"
            />
            <label htmlFor="isDefault" className="text-sm text-gray-700">
              Set as default business
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              {form.id ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}