import React, { useState } from 'react';
import type { ParsedInvoice } from '../types/invoice.types';

interface InvoiceViewerProps {
    invoice: ParsedInvoice;
    onClose: () => void;
}

export const InvoiceViewer: React.FC<InvoiceViewerProps> = ({ invoice, onClose }) => {
    const [viewMode, setViewMode] = useState<'structured' | 'raw'>('structured');

    const exportToJSON = () => {
        const dataStr = JSON.stringify(invoice.rawData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${invoice.fileName.replace('.xml', '')}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const renderValue = (value: unknown, depth: number = 0): React.ReactNode => {
        if (value === null || value === undefined) {
            return <span className="text-gray-400 italic">null</span>;
        }

        if (typeof value === 'object') {
            if (Array.isArray(value)) {
                return (
                    <div className="ml-4">
                        {value.map((item, index) => (
                            <div key={index} className="border-l-2 border-gray-200 pl-4 my-2">
                                <span className="text-gray-500 font-mono text-sm">[{index}]</span>
                                {renderValue(item, depth + 1)}
                            </div>
                        ))}
                    </div>
                );
            }

            return (
                <div className="ml-4 space-y-1">
                    {Object.entries(value).map(([key, val]) => (
                        <div key={key} className="border-l-2 border-gray-200 pl-4 py-1">
                            <span className="font-medium text-gray-700">{key}:</span>{' '}
                            {renderValue(val, depth + 1)}
                        </div>
                    ))}
                </div>
            );
        }

        if (typeof value === 'boolean') {
            return <span className="text-purple-600 font-mono">{String(value)}</span>;
        }

        if (typeof value === 'number') {
            return <span className="text-blue-600 font-mono">{value}</span>;
        }

        return <span className="text-green-600">{String(value)}</span>;
    };

    return (
        <div className="bg-white rounded-lg shadow-lg">
            {/* Header */}
            <div className="border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{invoice.fileName}</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Subido: {invoice.uploadDate.toLocaleString('es-CL')}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="border-b border-gray-200 p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode('structured')}
                            className={`px-4 py-2 rounded-md font-medium transition-colors ${viewMode === 'structured'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            Vista Estructurada
                        </button>
                        <button
                            onClick={() => setViewMode('raw')}
                            className={`px-4 py-2 rounded-md font-medium transition-colors ${viewMode === 'raw'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            Vista Raw
                        </button>
                    </div>

                    <button
                        onClick={exportToJSON}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Exportar JSON
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[600px] overflow-y-auto">
                {viewMode === 'structured' && invoice.extractedData ? (
                    <div className="space-y-6">
                        {/* Invoice Info */}
                        {invoice.extractedData.invoiceNumber && (
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-gray-800 mb-2">Información de Factura</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {invoice.extractedData.invoiceNumber && (
                                        <div>
                                            <span className="text-sm text-gray-600">Número:</span>
                                            <p className="font-medium">{invoice.extractedData.invoiceNumber}</p>
                                        </div>
                                    )}
                                    {invoice.extractedData.issueDate && (
                                        <div>
                                            <span className="text-sm text-gray-600">Fecha Emisión:</span>
                                            <p className="font-medium">{invoice.extractedData.issueDate}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Supplier */}
                        {invoice.extractedData.supplier?.name && (
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-gray-800 mb-2">Emisor</h3>
                                <div className="space-y-2">
                                    <p className="font-medium">{invoice.extractedData.supplier.name}</p>
                                    {invoice.extractedData.supplier.taxId && (
                                        <p className="text-sm text-gray-600">RUT: {invoice.extractedData.supplier.taxId}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Customer */}
                        {invoice.extractedData.customer?.name && (
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-gray-800 mb-2">Receptor</h3>
                                <div className="space-y-2">
                                    <p className="font-medium">{invoice.extractedData.customer.name}</p>
                                    {invoice.extractedData.customer.taxId && (
                                        <p className="text-sm text-gray-600">RUT: {invoice.extractedData.customer.taxId}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Totals */}
                        {invoice.extractedData.totals && (
                            <div className="bg-yellow-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-gray-800 mb-2">Totales</h3>
                                <div className="space-y-2">
                                    {invoice.extractedData.totals.subtotal !== undefined && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Subtotal:</span>
                                            <span className="font-medium">
                                                {invoice.extractedData.totals.currency} {invoice.extractedData.totals.subtotal.toLocaleString('es-CL')}
                                            </span>
                                        </div>
                                    )}
                                    {invoice.extractedData.totals.tax !== undefined && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">IVA:</span>
                                            <span className="font-medium">
                                                {invoice.extractedData.totals.currency} {invoice.extractedData.totals.tax.toLocaleString('es-CL')}
                                            </span>
                                        </div>
                                    )}
                                    {invoice.extractedData.totals.total !== undefined && (
                                        <div className="flex justify-between border-t pt-2">
                                            <span className="font-semibold text-gray-800">Total:</span>
                                            <span className="font-bold text-lg">
                                                {invoice.extractedData.totals.currency} {invoice.extractedData.totals.total.toLocaleString('es-CL')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Raw Data Tree */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-800 mb-3">Datos Completos</h3>
                            <div className="font-mono text-sm bg-white p-4 rounded border border-gray-200 overflow-x-auto">
                                {renderValue(invoice.rawData)}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="text-sm overflow-x-auto bg-white p-4 rounded border border-gray-200">
                            {JSON.stringify(invoice.rawData, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};
