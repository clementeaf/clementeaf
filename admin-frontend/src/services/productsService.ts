import { apiClient } from './api';
import { endpoints } from '../api/endpoints';

/**
 * Producto desde la API
 */
export interface Product {
  id: number;
  codigo: string;
  nombre: string;
  sku?: string;
  precio?: number;
  stock?: number;
  categoria?: string;
  marca?: string;
  fabricante?: string;
  unidad?: string;
  descripcion?: string;
  estado?: string;
  itemId?: string;
  categoryId?: string;
  purchaseRate?: string;
  taxPercentage?: number;
}

/**
 * Respuesta de búsqueda de productos
 */
export interface SearchProductsResponse {
  data: Product[];
  total: number;
}

/**
 * Servicio para gestionar productos
 */
export const productsService = {
  /**
   * Busca productos por código, nombre o SKU
   * @param searchTerm - Término de búsqueda
   * @param limit - Límite de resultados (default: 50)
   * @returns Lista de productos encontrados
   */
  async searchProducts(searchTerm: string, limit: number = 50): Promise<Product[]> {
    if (!searchTerm || searchTerm.trim().length < 2) {
      return [];
    }

    try {
      const { data } = await apiClient.get<{ data: SearchProductsResponse }>(
        endpoints.products.search,
        {
          params: {
            search: searchTerm.trim(),
            limit
          }
        }
      );
      return data.data.data;
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }
};

