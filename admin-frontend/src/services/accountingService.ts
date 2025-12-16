import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';

export interface AccountingOverviewRow {
  quote: {
    id: number;
    numeroCotizacion: string | null;
    clienteNombre: string;
    estado: string;
    estadoPicking: string | null;
    createdAt: string | null;
  };
  invoice: {
    id: number;
    invoiceNumber: string;
    issueDate: string | null;
    status: string;
    netAmount: number;
    taxAmount: number;
    totalAmount: number;
    warehouseId: number;
  } | null;
  warehouse: {
    warehouseId: number;
    inventoryValue: number;
  } | null;
}

export interface AccountingOverviewResponse {
  data: AccountingOverviewRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const accountingService = {
  async getOverview(params?: {
    page?: number;
    limit?: number;
    estado?: string;
    estadoPicking?: string;
  }): Promise<AccountingOverviewResponse> {
    const { data } = await apiClient.get<{ data: AccountingOverviewResponse }>(endpoints.accounting.overview, {
      params
    });
    return data.data;
  }
};


