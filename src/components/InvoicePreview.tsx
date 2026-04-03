// src/components/InvoicePreview.tsx
'use client';

import { formatCurrency, formatDate, numberToWords } from '@/lib/utils';

interface InvoicePreviewProps {
  invoice: any;
}

export default function InvoicePreview({ invoice }: InvoicePreviewProps) {
  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
    cancelled: 'bg-yellow-100 text-yellow-800',
  };

  const sym = invoice.currencySymbol || '£';

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto" id="invoice-preview">
      {/* Header */}
      <div className="p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-purple-700">Invoice</h1>
           {/*  <span
              className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                statusColors[invoice.status] || statusColors.draft
              }`}
            >
              {invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1)}
            </span> */}
            <div className="mt-4 space-y-1 text-sm">
              <p>
                <span className="text-gray-500">Invoice No #</span>{' '}
                <span className="font-semibold">{invoice.invoiceNo}</span>
              </p>
              <p>
                <span className="text-gray-500">Invoice Date</span>{' '}
                <span className="font-semibold">
                  {formatDate(invoice.invoiceDate)}
                </span>
              </p>
              {invoice.dueDate && (
                <p>
                  <span className="text-gray-500">Due Date</span>{' '}
                  <span className="font-semibold">
                    {formatDate(invoice.dueDate)}
                  </span>
                </p>
              )}
            </div>
          </div>

          {invoice.business?.logoUrl && (
            <img
              src={invoice.business.logoUrl}
              alt={invoice.business.name}
              className="w-24 h-24 object-contain"
            />
          )}
        </div>

        {/* Custom Fields */}
        {invoice.customFields?.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-4">
            {invoice.customFields.map((cf: any) => (
              <div key={cf.id} className="text-sm">
                <span className="text-gray-500">{cf.label}:</span>{' '}
                <span className="font-medium">{cf.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Billed By / To */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-purple-50 rounded-xl p-5">
            <h3 className="text-purple-700 font-bold mb-3">Billed By</h3>
            <p className="font-semibold text-gray-800">{invoice.business?.name}</p>
            <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
              {invoice.business?.address}
            </p>
            {invoice.business?.email && (
              <p className="text-sm text-gray-600">{invoice.business.email}</p>
            )}
            {invoice.business?.phone && (
              <p className="text-sm text-gray-600">{invoice.business.phone}</p>
            )}
          </div>

          <div className="bg-purple-50 rounded-xl p-5">
            <h3 className="text-purple-700 font-bold mb-3">Billed To</h3>
            <p className="font-semibold text-gray-800">{invoice.client?.name}</p>
            <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
              {invoice.client?.address}
            </p>
            {invoice.client?.email && (
              <p className="text-sm text-gray-600">{invoice.client.email}</p>
            )}
            {invoice.client?.phone && (
              <p className="text-sm text-gray-600">{invoice.client.phone}</p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <div className="invoice-header-gradient text-white rounded-t-xl px-4 py-3 grid grid-cols-12 text-sm font-semibold">
            <div className="col-span-1">#</div>
            <div className="col-span-5">Item</div>
            <div className="col-span-2 text-center">Quantity</div>
            <div className="col-span-2 text-center">Rate</div>
            <div className="col-span-2 text-right">Amount</div>
          </div>

          {invoice.items?.map((item: any, index: number) => (
            <div
              key={item.id}
              className="border-x border-b border-gray-200 px-4 py-3 grid grid-cols-12 text-sm"
            >
              <div className="col-span-1 text-gray-400 font-semibold">
                {index + 1}.
              </div>
              <div className="col-span-5">
                <p className="font-medium">{item.name}</p>
                {item.description && (
                  <p className="text-gray-500 text-xs mt-1 whitespace-pre-line">
                    {item.description}
                  </p>
                )}
              </div>
              <div className="col-span-2 text-center">{item.quantity}</div>
              <div className="col-span-2 text-center">
                {formatCurrency(item.rate, sym)}
              </div>
              <div className="col-span-2 text-right font-semibold">
                {formatCurrency(item.amount, sym)}
              </div>
            </div>
          ))}
        </div>

        {/* Total in Words */}
        {invoice.showTotalInWords && (
          <div className="mb-4">
            <p className="text-sm text-red-600">
              Total (in words) :{' '}
              <span className="font-semibold">
                {numberToWords(invoice.total)}{' '}
                {invoice.currency === 'GBP' ? 'POUNDS' : invoice.currency} ONLY
              </span>
            </p>
          </div>
        )}

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-80">
            {invoice.taxAmount > 0 && (
              <>
                <div className="flex justify-between text-sm py-1">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatCurrency(invoice.subtotal, sym)}</span>
                </div>
                <div className="flex justify-between text-sm py-1">
                  <span className="text-gray-600">Tax ({invoice.taxRate}%)</span>
                  <span>{formatCurrency(invoice.taxAmount, sym)}</span>
                </div>
              </>
            )}

            {invoice.discount > 0 && (
              <div className="flex justify-between text-sm py-1 text-red-600">
                <span>Discount</span>
                <span>
                  -
                  {formatCurrency(
                    invoice.discountType === 'percentage'
                      ? (invoice.subtotal * invoice.discount) / 100
                      : invoice.discount,
                    sym
                  )}
                </span>
              </div>
            )}

            {invoice.additionalCharges > 0 && (
              <div className="flex justify-between text-sm py-1">
                <span className="text-gray-600">Additional Charges</span>
                <span>{formatCurrency(invoice.additionalCharges, sym)}</span>
              </div>
            )}

            <div className="flex justify-between text-lg font-bold py-2 border-t border-dashed border-gray-300 mt-2">
              <span>Total ({invoice.currency})</span>
              <span>{formatCurrency(invoice.total, sym)}</span>
            </div>

            {invoice.amountPaid > 0 && (
              <div className="flex justify-between text-sm py-1">
                <span className="text-gray-600">Amount Paid</span>
                <span>({formatCurrency(invoice.amountPaid, sym)})</span>
              </div>
            )}

            {invoice.amountPaid > 0 && invoice.amountPaid < invoice.total && (
              <div className="flex justify-between text-sm font-semibold py-1 text-red-600">
                <span>Balance Due</span>
                <span>
                  {formatCurrency(invoice.total - invoice.amountPaid, sym)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Terms & Notes */}
        {(invoice.terms || invoice.notes) && (
          <div className="grid grid-cols-2 gap-6 mb-6">
            {invoice.terms && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-1 text-sm">
                  Terms & Conditions
                </h4>
                <p className="text-xs text-gray-600 whitespace-pre-line">
                  {invoice.terms}
                </p>
              </div>
            )}
            {invoice.notes && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-1 text-sm">
                  Notes
                </h4>
                <p className="text-xs text-gray-600 whitespace-pre-line">
                  {invoice.notes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-200 pt-4 text-center">
          <p className="text-xs text-gray-500">
            This is an electronically generated document, no signature is required.
          </p>
          {invoice.business?.email && (
            <p className="text-xs text-gray-500 mt-1">
              For any enquiry, reach out via email at{' '}
              <span className="font-semibold">{invoice.business.email}</span>
              {invoice.business?.phone && (
                <>
                  , call on{' '}
                  <span className="font-semibold">{invoice.business.phone}</span>
                </>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}