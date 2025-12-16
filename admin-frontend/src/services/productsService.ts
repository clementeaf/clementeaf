import { apiClient } from '../api/client';
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
  descontinuado?: boolean;
}

/**
 * Respuesta de búsqueda de productos
 */
export interface SearchProductsResponse {
  data: Product[];
  total: number;
}

/**
 * Payload para crear producto en catálogo
 */
export interface CreateCatalogProductDto {
  codigo: string;
  nombre: string;
  sku?: string | null;
  descontinuado?: boolean;
  descontinuadoReason?: string | null;
}

/**
 * Payload para actualizar producto en catálogo
 */
export type UpdateCatalogProductDto = Partial<CreateCatalogProductDto>;

/**
 * Respuesta base para mutaciones de catálogo
 */
export interface CatalogProductMutationResult {
  id: number;
  codigo: string;
  nombre: string;
  descontinuado?: boolean;
  deletedAt?: string | null;
}

/**
 * Servicio para gestionar productos
 */
export const productsService = {
  /**
   * Busca productos por código, nombre o SKU
   * @param searchTerm - Término de búsqueda
   * @param limit - Límite de resultados (default: 50)
   * @param warehouseId - ID de bodega para incluir stock (opcional)
   * @returns Lista de productos encontrados
   */
  async searchProducts(searchTerm: string, limit: number = 50, warehouseId?: number): Promise<Product[]> {
    if (!searchTerm || searchTerm.trim().length < 2) {
      return [];
    }

    try {
      const { data } = await apiClient.get<{ data: SearchProductsResponse }>(
        endpoints.products.catalogSearch,
        {
          params: {
            search: searchTerm.trim(),
            limit,
            ...(typeof warehouseId === 'number' ? { warehouseId } : {})
          }
        }
      );
      return data.data.data;
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }
  ,

  /**
   * Crea un producto en el catálogo WMS
   * @param dto - Datos del producto
   * @returns Resultado de creación
   */
  async createCatalogProduct(dto: CreateCatalogProductDto): Promise<CatalogProductMutationResult> {
    const { data } = await apiClient.post<{ data: CatalogProductMutationResult }>(
      endpoints.products.catalogCreate,
      dto
    );
    return data.data;
  },

  /**
   * Actualiza un producto del catálogo WMS
   * @param id - ID del producto
   * @param dto - Campos a actualizar
   * @returns Resultado de actualización
   */
  async updateCatalogProduct(id: number, dto: UpdateCatalogProductDto): Promise<CatalogProductMutationResult> {
    const url = endpoints.products.catalogUpdate.replace('{id}', id.toString());
    const { data } = await apiClient.put<{ data: CatalogProductMutationResult }>(url, dto);
    return data.data;
  },

  /**
   * Elimina (soft delete) un producto del catálogo WMS
   * @param id - ID del producto
   * @returns Resultado de eliminación
   */
  async deleteCatalogProduct(id: number): Promise<CatalogProductMutationResult> {
    const url = endpoints.products.catalogDelete.replace('{id}', id.toString());
    const { data } = await apiClient.delete<{ data: CatalogProductMutationResult }>(url);
    return data.data;
  }
};

