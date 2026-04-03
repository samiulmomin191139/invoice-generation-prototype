// src/components/InvoiceForm.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiPlus, FiTrash2, FiCopy, FiArrowUp, FiArrowDown, FiEdit2, FiX
} from 'react-icons/fi';
import { currencies, getCurrencyByCode } from '@/lib/currencies';
import { generateInvoiceNumber, formatCurrency, numberToWords } from '@/lib/utils';
import BusinessModal from './BusinessModal';
import ClientModal from './ClientModal';
import toast from 'react-hot-toast';

interface InvoiceItem {
  id?: string;
  name: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  unit: string;
}

interface CustomField {
  id?: string;
  label: string;
  value: string;
}

interface InvoiceFormProps {
  invoice?: any;
  isEditing?: boolean;
}

export default function InvoiceForm({ invoice, isEditing }: InvoiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);

  // Invoice state
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState('');
  const [showDueDate, setShowDueDate] = useState(false);
  const [status, setStatus] = useState('draft');
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [currencyCode, setCurrencyCode] = useState('GBP');
  const [currencySymbol, setCurrencySymbol] = useState('£');
  const [taxRate, setTaxRate] = useState<number | null>(null);
  const [showTax, setShowTax] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<string | null>(null);
  const [showDiscount, setShowDiscount] = useState(false);
  const [additionalCharges, setAdditionalCharges] = useState(0);
  const [showAdditionalCharges, setShowAdditionalCharges] = useState(false);
  const [showTotalInWords, setShowTotalInWords] = useState(true);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [amountPaid, setAmountPaid] = useState(0);

  // Items
  const [items, setItems] = useState<InvoiceItem[]>([
    { name: '', description: '', quantity: 1, rate: 0, amount: 0, unit: 'Product' },
  ]);

  // Custom fields
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [showCustomFields, setShowCustomFields] = useState(false);

  // Modals
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<any>(null);
  const [editingClient, setEditingClient] = useState<any>(null);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Populate form if editing
  useEffect(() => {
    if (invoice && isEditing) {
      setInvoiceNo(invoice.invoiceNo);
      setInvoiceDate(new Date(invoice.invoiceDate).toISOString().split('T')[0]);
      if (invoice.dueDate) {
        setDueDate(new Date(invoice.dueDate).toISOString().split('T')[0]);
        setShowDueDate(true);
      }
      setStatus(invoice.status);
      setSelectedBusinessId(invoice.businessId);
      setSelectedClientId(invoice.clientId);
      setCurrencyCode(invoice.currency);
      setCurrencySymbol(invoice.currencySymbol);
      if (invoice.taxRate) {
        setTaxRate(invoice.taxRate);
        setShowTax(true);
      }
      if (invoice.discount > 0) {
        setDiscount(invoice.discount);
        setDiscountType(invoice.discountType);
        setShowDiscount(true);
      }
      if (invoice.additionalCharges > 0) {
        setAdditionalCharges(invoice.additionalCharges);
        setShowAdditionalCharges(true);
      }
      setShowTotalInWords(invoice.showTotalInWords);
      setNotes(invoice.notes || '');
      setTerms(invoice.terms || '');
      setShowNotes(!!invoice.notes);
      setShowTerms(!!invoice.terms);
      setAmountPaid(invoice.amountPaid || 0);
      
      if (invoice.items?.length > 0) {
        setItems(
          invoice.items.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description || '',
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
            unit: item.unit || 'Product',
          }))
        );
      }

      if (invoice.customFields?.length > 0) {
        setCustomFields(invoice.customFields);
        setShowCustomFields(true);
      }
    }
  }, [invoice, isEditing]);

  const loadData = async () => {
    try {
      const [bizRes, clientRes, settingsRes] = await Promise.all([
        fetch('/api/businesses'),
        fetch('/api/clients'),
        fetch('/api/settings'),
      ]);

      const bizData = await bizRes.json();
      const clientData = await clientRes.json();
      const settingsData = await settingsRes.json();

      setBusinesses(bizData);
      setClients(clientData);
      setSettings(settingsData);

      if (!isEditing) {
        // Set defaults
        const defaultBiz = bizData.find((b: any) => b.isDefault) || bizData[0];
        if (defaultBiz) setSelectedBusinessId(defaultBiz.id);

        setCurrencyCode(settingsData.defaultCurrency || 'GBP');
        setCurrencySymbol(settingsData.defaultCurrencySymbol || '£');
        setInvoiceNo(
          generateInvoiceNumber(
            settingsData.invoicePrefix || 'A',
            settingsData.nextInvoiceNumber || 1
          )
        );

        if (settingsData.defaultTaxRate) {
          setTaxRate(settingsData.defaultTaxRate);
          setShowTax(true);
        }
        if (settingsData.defaultNotes) {
          setNotes(settingsData.defaultNotes);
          setShowNotes(true);
        }
        if (settingsData.defaultTerms) {
          setTerms(settingsData.defaultTerms);
          setShowTerms(true);
        }
      }
    } catch (error) {
      toast.error('Failed to load data');
    }
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const taxAmount = showTax && taxRate ? (subtotal * taxRate) / 100 : 0;
  const discountAmount = showDiscount
    ? discountType === 'percentage'
      ? (subtotal * discount) / 100
      : discount
    : 0;
  const total = subtotal + taxAmount - discountAmount + (showAdditionalCharges ? additionalCharges : 0);
  const balanceDue = total - amountPaid;

  // Item handlers
  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      { name: '', description: '', quantity: 1, rate: 0, amount: 0, unit: 'Product' },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) {
      toast.error('Invoice must have at least one item');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const duplicateItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index + 1, 0, { ...items[index], id: undefined });
    setItems(newItems);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === items.length - 1)
    ) return;

    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setItems(newItems);
  };

  // Currency handler
  const handleCurrencyChange = (code: string) => {
    const currency = getCurrencyByCode(code);
    setCurrencyCode(currency.code);
    setCurrencySymbol(currency.symbol);
  };

  // Save invoice
  const handleSave = async (saveStatus?: string) => {
    if (!selectedBusinessId) {
      toast.error('Please select or create a business');
      return;
    }
    if (!selectedClientId) {
      toast.error('Please select or create a client');
      return;
    }
    if (items.some((item) => !item.name)) {
      toast.error('All items must have a name');
      return;
    }

    setLoading(true);

    const payload = {
      invoiceNo,
      invoiceDate: new Date(invoiceDate).toISOString(),
      dueDate: showDueDate && dueDate ? new Date(dueDate).toISOString() : null,
      status: saveStatus || status,
      businessId: selectedBusinessId,
      clientId: selectedClientId,
      currency: currencyCode,
      currencySymbol,
      subtotal,
      taxRate: showTax ? taxRate : null,
      taxAmount,
      discount: showDiscount ? discount : 0,
      discountType: showDiscount ? discountType : null,
      additionalCharges: showAdditionalCharges ? additionalCharges : 0,
      total,
      amountPaid,
      showTotalInWords,
      notes: showNotes ? notes : null,
      terms: showTerms ? terms : null,
      items: items.map((item) => ({
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.quantity * item.rate,
        unit: item.unit,
      })),
      customFields: showCustomFields ? customFields.filter((cf) => cf.label && cf.value) : [],
    };

    try {
      const url = isEditing ? `/api/invoices/${invoice.id}` : '/api/invoices';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const saved = await res.json();
        toast.success(isEditing ? 'Invoice updated!' : 'Invoice created!');
        router.push(`/invoices/${saved.id}`);
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      toast.error('Failed to save invoice');
    } finally {
      setLoading(false);
    }
  };

  const selectedBusiness = businesses.find((b) => b.id === selectedBusinessId);
  const selectedClient = clients.find((c) => c.id === selectedClientId);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Title & Status */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Invoice ✏️
        </h1>
        <div className="mt-2 flex items-center justify-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-purple-500"
          >
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="card mb-6">
        {/* Invoice Number and Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm font-semibold text-purple-700">
                Invoice No<span className="text-red-500">*</span>
              </label>
            </div>
            <input
              type="text"
              className="input-field font-mono text-lg"
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
            />
            {settings && (
              <p className="text-xs text-gray-400 mt-1">
                Last No: {generateInvoiceNumber(
                  settings.invoicePrefix,
                  settings.nextInvoiceNumber - 1
                )}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-purple-700 mb-2 block">
              Invoice Date<span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className="input-field"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
            />
            {!showDueDate && (
              <button
                onClick={() => setShowDueDate(true)}
                className="text-sm text-purple-600 hover:text-purple-800 mt-2 flex items-center gap-1"
              >
                <FiPlus className="w-3 h-3" /> Add due date
              </button>
            )}
            {showDueDate && (
              <div className="mt-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600">Due Date</label>
                  <button
                    onClick={() => {
                      setShowDueDate(false);
                      setDueDate('');
                    }}
                    className="text-xs text-red-500"
                  >
                    Remove
                  </button>
                </div>
                <input
                  type="date"
                  className="input-field mt-1"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Custom Fields */}
        {!showCustomFields && (
          <button
            onClick={() => setShowCustomFields(true)}
            className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1 mb-6"
          >
            <FiPlus className="w-3 h-3" /> Add Custom Fields
          </button>
        )}

        {showCustomFields && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Custom Fields</h3>
              <button
                onClick={() => {
                  setShowCustomFields(false);
                  setCustomFields([]);
                }}
                className="text-xs text-red-500"
              >
                Remove All
              </button>
            </div>
            {customFields.map((field, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Label"
                  className="input-field flex-1"
                  value={field.label}
                  onChange={(e) => {
                    const newFields = [...customFields];
                    newFields[index].label = e.target.value;
                    setCustomFields(newFields);
                  }}
                />
                <input
                  type="text"
                  placeholder="Value"
                  className="input-field flex-1"
                  value={field.value}
                  onChange={(e) => {
                    const newFields = [...customFields];
                    newFields[index].value = e.target.value;
                    setCustomFields(newFields);
                  }}
                />
                <button
                  onClick={() => setCustomFields(customFields.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-700 px-2"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => setCustomFields([...customFields, { label: '', value: '' }])}
              className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1 mt-2"
            >
              <FiPlus className="w-3 h-3" /> Add Field
            </button>
          </div>
        )}

        {/* Billed By / Billed To */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Billed By */}
          <div className="border border-gray-200 rounded-xl p-4">
            <h3 className="text-lg font-bold text-purple-700 mb-1">
              Billed By <span className="text-sm font-normal text-gray-400">Your Details</span>
            </h3>

            <select
              className="input-field mb-3"
              value={selectedBusinessId}
              onChange={(e) => setSelectedBusinessId(e.target.value)}
            >
              <option value="">Select Business</option>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            {selectedBusiness && (
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">Business details</span>
                  <button
                    onClick={() => {
                      setEditingBusiness(selectedBusiness);
                      setShowBusinessModal(true);
                    }}
                    className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
                  >
                    <FiEdit2 className="w-3 h-3" /> Edit
                  </button>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex">
                    <span className="text-gray-500 w-28">Business Name</span>
                    <span className="font-medium">{selectedBusiness.name}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-28">Address</span>
                    <span>{selectedBusiness.address}</span>
                  </div>
                  {selectedBusiness.email && (
                    <div className="flex">
                      <span className="text-gray-500 w-28">Email</span>
                      <span>{selectedBusiness.email}</span>
                    </div>
                  )}
                  {selectedBusiness.phone && (
                    <div className="flex">
                      <span className="text-gray-500 w-28">Phone</span>
                      <span>{selectedBusiness.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setEditingBusiness(null);
                setShowBusinessModal(true);
              }}
              className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1 mt-3"
            >
              <FiPlus className="w-3 h-3" /> Add New Business
            </button>
          </div>

          {/* Billed To */}
          <div className="border border-gray-200 rounded-xl p-4">
            <h3 className="text-lg font-bold text-purple-700 mb-1">
              Billed To <span className="text-sm font-normal text-gray-400">Client&apos;s Details</span>
            </h3>

            <select
              className="input-field mb-3"
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
            >
              <option value="">Select Client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {selectedClient && (
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">Business details</span>
                  <button
                    onClick={() => {
                      setEditingClient(selectedClient);
                      setShowClientModal(true);
                    }}
                    className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
                  >
                    <FiEdit2 className="w-3 h-3" /> Edit
                  </button>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex">
                    <span className="text-gray-500 w-28">Business Name</span>
                    <span className="font-medium text-purple-600">{selectedClient.name}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-28">Address</span>
                    <span>{selectedClient.address}</span>
                  </div>
                  {selectedClient.email && (
                    <div className="flex">
                      <span className="text-gray-500 w-28">Email</span>
                      <span>{selectedClient.email}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setEditingClient(null);
                setShowClientModal(true);
              }}
              className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1 mt-3"
            >
              <FiPlus className="w-3 h-3" /> Add New Client
            </button>
          </div>
        </div>

        {/* Currency & Tax */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {!showTax && (
            <button
              onClick={() => {
                setShowTax(true);
                setTaxRate(0);
              }}
              className="btn-secondary text-sm flex items-center gap-1"
            >
              % Add TAX
            </button>
          )}

          <div>
            <label className="text-sm font-semibold text-red-600 block mb-1">
              Currency<span className="text-red-500">*</span>
            </label>
            <select
              className="input-field"
              value={currencyCode}
              onChange={(e) => handleCurrencyChange(e.target.value)}
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {showTax && (
          <div className="mb-6 p-3 bg-yellow-50 rounded-lg flex items-center gap-3">
            <label className="text-sm font-medium">Tax Rate (%):</label>
            <input
              type="number"
              className="input-field w-24"
              value={taxRate || ''}
              onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
              step="0.01"
            />
            <button
              onClick={() => {
                setShowTax(false);
                setTaxRate(null);
              }}
              className="text-red-500 hover:text-red-700"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Items Table */}
        <div className="mb-6">
          {/* Table Header */}
          <div className="invoice-header-gradient text-white rounded-t-xl px-4 py-3 grid grid-cols-12 gap-2 text-sm font-semibold">
            <div className="col-span-5">Item</div>
            <div className="col-span-2 text-center">Quantity</div>
            <div className="col-span-2 text-center">Rate</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-1"></div>
          </div>

          {/* Items */}
          {items.map((item, index) => (
            <div
              key={index}
              className="border-x border-b border-gray-200 px-4 py-4"
            >
              <div className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-gray-400">
                      {index + 1}.
                    </span>
                    <input
                      type="text"
                      placeholder="Item Name / SKU Id"
                      className="input-field flex-1"
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                    />
                  </div>
                  <textarea
                    placeholder="Add Description (optional)"
                    className="input-field text-sm mt-2 w-full"
                    rows={2}
                    value={item.description}
                    onChange={(e) =>
                      updateItem(index, 'description', e.target.value)
                    }
                  />
                </div>

                <div className="col-span-2">
                  <input
                    type="number"
                    className="input-field text-center"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(index, 'quantity', parseFloat(e.target.value) || 0)
                    }
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="col-span-2">
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-1">{currencySymbol}</span>
                    <input
                      type="number"
                      className="input-field text-center"
                      value={item.rate}
                      onChange={(e) =>
                        updateItem(index, 'rate', parseFloat(e.target.value) || 0)
                      }
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="col-span-2 text-right">
                  <p className="font-bold text-gray-800 py-2">
                    {formatCurrency(item.quantity * item.rate, currencySymbol)}
                  </p>
                </div>

                <div className="col-span-1 flex flex-col items-center gap-1">
                  <button
                    onClick={() => moveItem(index, 'up')}
                    className="text-gray-400 hover:text-gray-600 p-1"
                    title="Move up"
                  >
                    <FiArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => moveItem(index, 'down')}
                    className="text-gray-400 hover:text-gray-600 p-1"
                    title="Move down"
                  >
                    <FiArrowDown className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => duplicateItem(index)}
                    className="text-gray-400 hover:text-blue-600 p-1"
                    title="Duplicate"
                  >
                    <FiCopy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removeItem(index)}
                    className="text-gray-400 hover:text-red-600 p-1"
                    title="Remove"
                  >
                    <FiTrash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Unit selector */}
              <div className="mt-2 flex items-center gap-2">
                <select
                  className="text-xs border border-gray-200 rounded px-2 py-1"
                  value={item.unit}
                  onChange={(e) => updateItem(index, 'unit', e.target.value)}
                >
                  <option value="Product">Product</option>
                  <option value="Service">Service</option>
                  <option value="Hour">Hour</option>
                  <option value="Day">Day</option>
                  <option value="Month">Month</option>
                  <option value="Unit">Unit</option>
                </select>
              </div>
            </div>
          ))}

          {/* Add Item Button */}
          <div className="border-x border-b border-gray-200 rounded-b-xl p-3 flex gap-4">
            <button
              onClick={addItem}
              className="flex-1 btn-secondary text-sm flex items-center justify-center gap-1"
            >
              <FiPlus className="w-4 h-4" /> Add New Line
            </button>
          </div>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end mb-6">
          <div className="w-full max-w-md">
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <h3 className="font-bold text-gray-700">Show Total in PDF</h3>

              {/* Discount */}
              {!showDiscount && (
                <button
                  onClick={() => {
                    setShowDiscount(true);
                    setDiscountType('fixed');
                  }}
                  className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
                >
                  ◇ Add Discounts
                </button>
              )}
              {showDiscount && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Discount:</span>
                  <select
                    className="text-xs border rounded px-2 py-1"
                    value={discountType || 'fixed'}
                    onChange={(e) => setDiscountType(e.target.value)}
                  >
                    <option value="fixed">Fixed ({currencySymbol})</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                  <input
                    type="number"
                    className="input-field w-24"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                  <button
                    onClick={() => {
                      setShowDiscount(false);
                      setDiscount(0);
                    }}
                    className="text-red-500"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Additional Charges */}
              {!showAdditionalCharges && (
                <button
                  onClick={() => setShowAdditionalCharges(true)}
                  className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
                >
                  <FiPlus className="w-3 h-3" /> Add Additional Charges
                </button>
              )}
              {showAdditionalCharges && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Additional:</span>
                  <span className="text-gray-400">{currencySymbol}</span>
                  <input
                    type="number"
                    className="input-field w-24"
                    value={additionalCharges}
                    onChange={(e) =>
                      setAdditionalCharges(parseFloat(e.target.value) || 0)
                    }
                    min="0"
                    step="0.01"
                  />
                  <button
                    onClick={() => {
                      setShowAdditionalCharges(false);
                      setAdditionalCharges(0);
                    }}
                    className="text-red-500"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              )}

              <hr />

              {/* Subtotal */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatCurrency(subtotal, currencySymbol)}</span>
              </div>

              {showTax && taxRate != null && taxRate > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax ({taxRate}%)</span>
                  <span>{formatCurrency(taxAmount, currencySymbol)}</span>
                </div>
              )}

              {showDiscount && discount > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>
                    Discount{' '}
                    {discountType === 'percentage' ? `(${discount}%)` : ''}
                  </span>
                  <span>-{formatCurrency(discountAmount, currencySymbol)}</span>
                </div>
              )}

              {showAdditionalCharges && additionalCharges > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Additional Charges</span>
                  <span>{formatCurrency(additionalCharges, currencySymbol)}</span>
                </div>
              )}

              <hr />

              {/* Total */}
              <div className="flex justify-between text-lg font-bold">
                <span>Total ({currencyCode})</span>
                <span>{formatCurrency(total, currencySymbol)}</span>
              </div>

              {/* Amount Paid */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Amount Paid:</span>
                <span className="text-gray-400">{currencySymbol}</span>
                <input
                  type="number"
                  className="input-field w-32"
                  value={amountPaid}
                  onChange={(e) =>
                    setAmountPaid(parseFloat(e.target.value) || 0)
                  }
                  min="0"
                  step="0.01"
                />
              </div>

              {amountPaid > 0 && (
                <div className="flex justify-between text-sm font-semibold">
                  <span>Balance Due</span>
                  <span>{formatCurrency(balanceDue, currencySymbol)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Total in Words */}
        <div className="mb-6 bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-gray-700">Show Total In Words</h3>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showTotalInWords}
                onChange={(e) => setShowTotalInWords(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded"
              />
            </label>
          </div>
          {showTotalInWords && (
            <div className="text-sm">
              <span className="text-gray-500">Total (in words)</span>
              <p className="font-medium text-gray-700 border-b border-dashed border-gray-300 pb-1">
                {numberToWords(total)} {currencyCode === 'GBP' ? 'POUNDS' : currencyCode} ONLY
              </p>
            </div>
          )}
        </div>

        {/* Notes, Terms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {!showTerms ? (
            <button
              onClick={() => setShowTerms(true)}
              className="btn-secondary text-sm flex items-center justify-center gap-1"
            >
              <FiPlus className="w-4 h-4" /> Add Terms & Conditions
            </button>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-semibold text-gray-700">
                  Terms & Conditions
                </label>
                <button
                  onClick={() => {
                    setShowTerms(false);
                    setTerms('');
                  }}
                  className="text-xs text-red-500"
                >
                  Remove
                </button>
              </div>
              <textarea
                className="input-field"
                rows={3}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                placeholder="Enter terms and conditions..."
              />
            </div>
          )}

          {!showNotes ? (
            <button
              onClick={() => setShowNotes(true)}
              className="btn-secondary text-sm flex items-center justify-center gap-1"
            >
              📝 Add Notes
            </button>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-semibold text-gray-700">
                  Notes
                </label>
                <button
                  onClick={() => {
                    setShowNotes(false);
                    setNotes('');
                  }}
                  className="text-xs text-red-500"
                >
                  Remove
                </button>
              </div>
              <textarea
                className="input-field"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter notes..."
              />
            </div>
          )}
        </div>

        {/* Contact Details */}
        {settings && (
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-bold text-gray-700 mb-2">Your Contact Details</h3>
            <p className="text-sm text-gray-600">
              For any enquiry, reach out via email at{' '}
              <span className="font-medium">{settings.contactEmail}</span> call on{' '}
              <span className="font-medium">{settings.contactPhone}</span>
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-6 sticky bottom-0 bg-gray-50 py-4 border-t border-gray-200">
        <button
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Cancel
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => handleSave('draft')}
            disabled={loading}
            className="btn-secondary"
          >
            {loading ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            onClick={() => handleSave(status === 'draft' ? 'sent' : status)}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Saving...' : isEditing ? 'Update Invoice' : 'Create Invoice'}
          </button>
          {isEditing && (
            <button
              onClick={() => handleSave('paid')}
              disabled={loading}
              className="btn-success"
            >
              Mark as Paid
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      <BusinessModal
        isOpen={showBusinessModal}
        onClose={() => setShowBusinessModal(false)}
        onSave={(biz) => {
          loadData();
          if (biz.id) setSelectedBusinessId(biz.id);
        }}
        business={editingBusiness}
      />

      <ClientModal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        onSave={(client) => {
          loadData();
          if (client.id) setSelectedClientId(client.id);
        }}
        client={editingClient}
      />
    </div>
  );
}