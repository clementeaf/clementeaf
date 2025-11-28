import React, { useState } from 'react';
import { sort, sum } from 'radashi';
import type { InvoiceItem } from '../types/invoice.types';

interface InvoiceDataTableProps {
    items: InvoiceItem[];
    currency?: string;
}

export const InvoiceDataTable: React.FC<InvoiceDataTableProps> = ({
    items,
    currency = 'CLP'
}) => {
    const [sortField, setSortField] = useState<keyof InvoiceItem | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const handleSort = (field: keyof InvoiceItem) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const sortedItems = sortField
        ? sort(items, item => item[sortField] ?? 0, sortDirection === 'desc')
        : items;

    const totals = {
        quantity: sum(items, item => item.quantity || 0),
        subtotal: sum(items, item => (item.quantity || 0) * (item.unitPrice || 0)),
        tax: sum(items, item => item.taxAmount || 0),
        total: sum(items, item => item.total || 0),
    };

    const SortIcon: React.FC<{ field: keyof InvoiceItem }> = ({ field }) => {
        if (sortField !== field) {
            return (
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
            );
        }

        return sortDirection === 'asc' ? (
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
        ) : (
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        );
    };

    if (items.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <p className="text-gray-500">No hay items para mostrar</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left">
                                <button
                                    onClick={() => handleSort('description')}
                                    className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                                >
                                    Descripción
                                    <SortIcon field="description" />
                                </button>
                            </th>
                            <th className="px-6 py-3 text-right">
                                <button
                                    onClick={() => handleSort('quantity')}
                                    className="flex items-center justify-end gap-2 font-semibold text-gray-700 hover:text-gray-900 ml-auto"
                                >
                                    Cantidad
                                    <SortIcon field="quantity" />
                                </button>
                            </th>
                            <th className="px-6 py-3 text-right">
                                <button
                                    onClick={() => handleSort('unitPrice')}
                                    className="flex items-center justify-end gap-2 font-semibold text-gray-700 hover:text-gray-900 ml-auto"
                                >
                                    Precio Unitario
                                    <SortIcon field="unitPrice" />
                                </button>
                            </th>
                            <th className="px-6 py-3 text-right">
                                <button
                                    onClick={() => handleSort('taxAmount')}
                                    className="flex items-center justify-end gap-2 font-semibold text-gray-700 hover:text-gray-900 ml-auto"
                                >
                                    IVA
                                    <SortIcon field="taxAmount" />
                                </button>
                            </th>
                            <th className="px-6 py-3 text-right">
                                <button
                                    onClick={() => handleSort('total')}
                                    className="flex items-center justify-end gap-2 font-semibold text-gray-700 hover:text-gray-900 ml-auto"
                                >
                                    Total
                                    <SortIcon field="total" />
                                </button>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {sortedItems.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-gray-800">
                                    {item.description || '-'}
                                </td>
                                <td className="px-6 py-4 text-right text-gray-800">
                                    {item.quantity !== undefined ? item.quantity.toLocaleString('es-CL') : '-'}
                                </td>
                                <td className="px-6 py-4 text-right text-gray-800">
                                    {item.unitPrice !== undefined
                                        ? `${currency} ${item.unitPrice.toLocaleString('es-CL')}`
                                        : '-'}
                                </td>
                                <td className="px-6 py-4 text-right text-gray-800">
                                    {item.taxAmount !== undefined
                                        ? `${currency} ${item.taxAmount.toLocaleString('es-CL')}`
                                        : '-'}
                                </td>
                                <td className="px-6 py-4 text-right font-medium text-gray-900">
                                    {item.total !== undefined
                                        ? `${currency} ${item.total.toLocaleString('es-CL')}`
                                        : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                        <tr className="font-semibold">
                            <td className="px-6 py-4 text-gray-800">TOTALES</td>
                            <td className="px-6 py-4 text-right text-gray-800">
                                {totals.quantity.toLocaleString('es-CL')}
                            </td>
                            <td className="px-6 py-4 text-right text-gray-800">
                                {currency} {totals.subtotal.toLocaleString('es-CL')}
                            </td>
                            <td className="px-6 py-4 text-right text-gray-800">
                                {currency} {totals.tax.toLocaleString('es-CL')}
                            </td>
                            <td className="px-6 py-4 text-right text-gray-900 text-lg">
                                {currency} {totals.total.toLocaleString('es-CL')}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};
