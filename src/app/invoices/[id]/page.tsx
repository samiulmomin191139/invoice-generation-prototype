// src/app/invoices/[id]/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import InvoicePreview from '@/components/InvoicePreview';
import Header from '@/components/Header';
import { FiEdit2, FiDownload, FiPrinter, FiArrowLeft, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ViewInvoicePage() {
  const { id } = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const loadInvoice = async () => {
    try {
      const res = await fetch(`/api/invoices/${id}`);
      if (res.ok) {
        setInvoice(await res.json());
      } else {
        toast.error('Invoice not found');
        router.push('/invoices');
      }
    } catch (error) {
      toast.error('Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    // Dynamic import to avoid SSR issues
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).default;

    const element = document.getElementById('invoice-preview');
    if (!element) return;

    try {
      toast.loading('Generating PDF...');
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice-${invoice.invoiceNo}.pdf`);
      toast.dismiss();
      toast.success('PDF downloaded!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to generate PDF');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Invoice deleted');
        router.push('/invoices');
      }
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const updateStatus = async (status: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...invoice,
          status,
          amountPaid: status === 'paid' ? invoice.total : invoice.amountPaid,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setInvoice(updated);
        toast.success(`Invoice marked as ${status}`);
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <div>
      {/* Action Bar */}
      <div className="no-print flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <Header title={`Invoice ${invoice.invoiceNo}`} />
        </div>

        <div className="flex items-center gap-3">
          {invoice.status !== 'paid' && (
            <button
              onClick={() => updateStatus('paid')}
              className="btn-success text-sm"
            >
              Mark as Paid
            </button>
          )}
          {invoice.status === 'draft' && (
            <button
              onClick={() => updateStatus('sent')}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm"
            >
              Mark as Sent
            </button>
          )}
          <Link href={`/invoices/${id}/edit`} className="btn-secondary text-sm flex items-center gap-1">
            <FiEdit2 className="w-4 h-4" /> Edit
          </Link>
          <button onClick={handlePrint} className="btn-secondary text-sm flex items-center gap-1">
            <FiPrinter className="w-4 h-4" /> Print
          </button>
          <button
            onClick={handleDownloadPDF}
            className="btn-primary text-sm flex items-center gap-1"
          >
            <FiDownload className="w-4 h-4" /> Download PDF
          </button>
          <button
            onClick={handleDelete}
            className="btn-danger text-sm flex items-center gap-1"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Invoice Preview */}
      <div ref={printRef}>
        <InvoicePreview invoice={invoice} />
      </div>
    </div>
  );
}