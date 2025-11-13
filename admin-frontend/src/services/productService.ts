import { apiClient } from './api';
import { endpoints } from '../api/endpoints';

export interface Product {
  nregist: number;
  codigo: string;
  nombre: string;
  nombre2?: string | null;
  clase1?: string | null;
  unidmed?: string | null;
  monevta?: string | null;
  precvta?: number | null;
  art_dispon?: number | null;
  costorep?: number | null;
  eliminado?: string | null;
  obsoleto?: string | null;
  publicado?: number | null;
  producto_web?: number | null;
}

export interface ProductFilters {
  codigo?: string;
  nombre?: string;
  clase1?: string;
  eliminado?: string;
  obsoleto?: string;
  publicado?: number;
  producto_web?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const productService = {
  /**
   * Obtiene todos los productos con filtros y paginación
   */
  async getAllProducts(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
    const { data } = await apiClient.get<{ data: PaginatedResponse<Product> }>(endpoints.products.getAll, {
      params: filters
    });
    return data.data;
  },

  /**
   * Busca productos por nombre o código
   */
  async searchProducts(searchTerm: string, limit?: number): Promise<Product[]> {
    const { data } = await apiClient.get<{ data: { data: Product[]; total: number } }>(endpoints.products.search, {
      params: { q: searchTerm, limit: limit ?? 20 }
    });
    return data.data.data || [];
  },

  /**
   * Sincroniza productos desde la API externa
   */
  async syncProducts(): Promise<{ imported: number; updated: number; errors: number; totalPages: number; totalRecords: number }> {
    const { data } = await apiClient.post<{ data: { imported: number; updated: number; errors: number; totalPages: number; totalRecords: number } }>(endpoints.products.sync);
    return data.data;
  }
};

