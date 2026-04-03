// src/app/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BusinessModal from '@/components/BusinessModal';
import { currencies } from '@/lib/currencies';
import { FiPlusCircle, FiEdit2, FiTrash2, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [settingsRes, bizRes] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/businesses'),
      ]);
      setSettings(await settingsRes.json());
      setBusinesses(await bizRes.json());
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        toast.success('Settings saved!');
      }
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <Header title="Settings" subtitle="Configure your invoice defaults" />

      {/* Invoice Settings */}
      <div className="card mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Invoice Settings</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Invoice Prefix
            </label>
            <input
              type="text"
              className="input-field"
              value={settings.invoicePrefix}
              onChange={(e) =>
                setSettings({ ...settings, invoicePrefix: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Next Invoice Number
            </label>
            <input
              type="number"
              className="input-field"
              value={settings.nextInvoiceNumber}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  nextInvoiceNumber: parseInt(e.target.value) || 1,
                })
              }
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Currency
            </label>
            <select
              className="input-field"
              value={settings.defaultCurrency}
              onChange={(e) => {
                const currency = currencies.find(
                  (c) => c.code === e.target.value
                );
                setSettings({
                  ...settings,
                  defaultCurrency: e.target.value,
                  defaultCurrencySymbol: currency?.symbol || '£',
                });
              }}
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Tax Rate (%)
            </label>
            <input
              type="number"
              className="input-field"
              value={settings.defaultTaxRate || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  defaultTaxRate: parseFloat(e.target.value) || null,
                })
              }
              step="0.01"
              placeholder="Leave empty for no tax"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Default Notes
          </label>
          <textarea
            className="input-field"
            rows={3}
            value={settings.defaultNotes || ''}
            onChange={(e) =>
              setSettings({ ...settings, defaultNotes: e.target.value })
            }
            placeholder="Default notes to appear on invoices..."
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Default Terms & Conditions
          </label>
          <textarea
            className="input-field"
            rows={3}
            value={settings.defaultTerms || ''}
            onChange={(e) =>
              setSettings({ ...settings, defaultTerms: e.target.value })
            }
            placeholder="Default terms and conditions..."
          />
        </div>
      </div>

      {/* Contact Settings */}
      <div className="card mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Contact Details</h2>
        <p className="text-sm text-gray-500 mb-4">
          This will appear at the bottom of your invoices
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Email
            </label>
            <input
              type="email"
              className="input-field"
              value={settings.contactEmail || ''}
              onChange={(e) =>
                setSettings({ ...settings, contactEmail: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Phone
            </label>
            <input
              type="text"
              className="input-field"
              value={settings.contactPhone || ''}
              onChange={(e) =>
                setSettings({ ...settings, contactPhone: e.target.value })
              }
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Message
          </label>
          <input
            type="text"
            className="input-field"
            value={settings.contactMessage}
            onChange={(e) =>
              setSettings({ ...settings, contactMessage: e.target.value })
            }
          />
        </div>
      </div>

      <button onClick={saveSettings} className="btn-primary flex items-center gap-2">
        <FiSave className="w-5 h-5" /> Save Settings
      </button>

      {/* Business Profiles */}
      <div className="card mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Business Profiles</h2>
          <button
            onClick={() => {
              setEditingBusiness(null);
              setShowBusinessModal(true);
            }}
            className="btn-primary text-sm flex items-center gap-2"
          >
            <FiPlusCircle className="w-4 h-4" /> Add Business
          </button>
        </div>

        {businesses.length === 0 ? (
          <p className="text-gray-500 text-center py-6">
            No business profiles yet. Add one to get started.
          </p>
        ) : (
          <div className="space-y-3">
            {businesses.map((biz) => (
              <div
                key={biz.id}
                className="border border-gray-200 rounded-xl p-4 flex items-start justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-800">{biz.name}</h3>
                    {biz.isDefault && (
                      <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{biz.address}</p>
                  {biz.email && (
                    <p className="text-sm text-gray-500">{biz.email}</p>
                  )}
                  {biz.phone && (
                    <p className="text-sm text-gray-500">{biz.phone}</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setEditingBusiness(biz);
                    setShowBusinessModal(true);
                  }}
                  className="text-gray-400 hover:text-purple-600"
                >
                  <FiEdit2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <BusinessModal
        isOpen={showBusinessModal}
        onClose={() => setShowBusinessModal(false)}
        onSave={() => loadData()}
        business={editingBusiness}
      />
    </div>
  );
}