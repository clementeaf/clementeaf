import { useState, useEffect } from 'react';
import type { ParsedInvoice } from '../types/invoice.types';
import { invoiceParser } from '../services/invoiceParser';
import { InvoiceUploader } from '../components/InvoiceUploader';
import { InvoiceViewer } from '../components/InvoiceViewer';
import { InvoiceDataTable } from '../components/InvoiceDataTable';
import { logger } from '../utils/logger';

const INVOICES_STORAGE_KEY = 'processed_invoices';

/**
 * Página de procesamiento de facturas XML
 * @returns Componente Invoices
 */
export const Invoices = (): React.ReactElement => {
    const [invoices, setInvoices] = useState<ParsedInvoice[]>([]);
    const [selectedInvoice, setSelectedInvoice] = useState<ParsedInvoice | null>(null);
    const [error, setError] = useState<string | null>(null);

    /**
     * Carga facturas persistidas desde localStorage al montar
     */
    useEffect(() => {
        try {
            const stored = localStorage.getItem(INVOICES_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Convertir uploadDate de string a Date
                const invoicesWithDates = parsed.map((inv: ParsedInvoice) => ({
                    ...inv,
                    uploadDate: new Date(inv.uploadDate)
                }));
                setInvoices(invoicesWithDates);
                logger.debug('Facturas cargadas desde localStorage', { count: invoicesWithDates.length });
            }
        } catch (error) {
            logger.error('Error cargando facturas desde localStorage', error);
        }
    }, []);

    /**
     * Persiste facturas en localStorage cuando cambian
     */
    useEffect(() => {
        try {
            if (invoices.length > 0) {
                localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(invoices));
                logger.debug('Facturas guardadas en localStorage', { count: invoices.length });
            } else {
                localStorage.removeItem(INVOICES_STORAGE_KEY);
            }
        } catch (error) {
            logger.error('Error guardando facturas en localStorage', error);
        }
    }, [invoices]);

    const handleFileUpload = async (file: File) => {
        try {
            setError(null);

            const text = await file.text();

            // Validate XML
            if (!invoiceParser.validateXML(text)) {
                setError('El archivo no es un XML válido');
                return;
            }

            // Parse XML
            const parsedData = invoiceParser.parseXML(text);
            const extractedData = invoiceParser.extractInvoiceData(parsedData);

            const newInvoice: ParsedInvoice = {
                id: Date.now().toString(),
                fileName: file.name,
                uploadDate: new Date(),
                rawData: parsedData,
                extractedData,
            };

            setInvoices(prev => [newInvoice, ...prev]);
            setSelectedInvoice(newInvoice);
        } catch (err) {
            logger.error('Error processing file', err);
            setError(err instanceof Error ? err.message : 'Error al procesar el archivo');
        }
    };

    const handleDeleteInvoice = (id: string) => {
        setInvoices(prev => prev.filter(inv => inv.id !== id));
        if (selectedInvoice?.id === id) {
            setSelectedInvoice(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Procesador de Facturas XML</h1>
                    <p className="text-gray-600 mt-2">
                        Sube y procesa facturas electrónicas en formato XML
                    </p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                            <h3 className="font-semibold text-red-800">Error</h3>
                            <p className="text-red-700 text-sm mt-1">{error}</p>
                        </div>
                        <button
                            onClick={() => setError(null)}
                            className="text-red-400 hover:text-red-600"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Upload and List */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Upload Section */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Subir Factura</h2>
                            <InvoiceUploader onFileUpload={handleFileUpload} />
                        </div>

                        {/* Invoice List */}
                        {invoices.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                    Facturas Cargadas ({invoices.length})
                                </h2>
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {invoices.map(invoice => (
                                        <div
                                            key={invoice.id}
                                            className={`
                        p-3 rounded-lg border-2 cursor-pointer transition-all
                        ${selectedInvoice?.id === invoice.id
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                                }
                      `}
                                            onClick={() => setSelectedInvoice(invoice)}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-800 truncate">
                                                        {invoice.fileName}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {invoice.uploadDate.toLocaleString('es-CL')}
                                                    </p>
                                                    {invoice.extractedData?.invoiceNumber && (
                                                        <p className="text-xs text-blue-600 mt-1">
                                                            N° {invoice.extractedData.invoiceNumber}
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteInvoice(invoice.id);
                                                    }}
                                                    className="text-red-400 hover:text-red-600 transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Viewer */}
                    <div className="lg:col-span-2">
                        {selectedInvoice ? (
                            <div className="space-y-6">
                                <InvoiceViewer
                                    invoice={selectedInvoice}
                                    onClose={() => setSelectedInvoice(null)}
                                />

                                {/* Items Table */}
                                {selectedInvoice.extractedData?.items && selectedInvoice.extractedData.items.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Items de Factura</h3>
                                        <InvoiceDataTable
                                            items={selectedInvoice.extractedData.items}
                                            currency={selectedInvoice.extractedData.totals?.currency}
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                                <svg
                                    className="w-24 h-24 mx-auto text-gray-300 mb-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                                <h3 className="text-lg font-medium text-gray-600 mb-2">
                                    No hay factura seleccionada
                                </h3>
                                <p className="text-gray-500">
                                    Sube una factura XML o selecciona una de la lista para ver sus detalles
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
