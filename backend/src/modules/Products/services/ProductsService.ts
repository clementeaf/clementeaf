import axios, { type AxiosInstance } from 'axios';

/**
 * Interfaz para un producto de la API externa
 */
export interface ExternalProduct {
  ID: number;
  nrg_art_local: number;
  cod_art_local: string;
  item_id: string;
  name: string;
  item_name: string;
  category_id?: string;
  category_name?: string;
  unit?: string;
  status?: string;
  brand?: string;
  manufacturer?: string;
  rate?: number;
  tax_percentage?: number;
  purchase_rate?: string;
  item_type?: string;
  product_type?: string;
  stock_on_hand?: number;
  available_stock?: number;
  sku?: string;
  description?: string;
  image_name?: string;
  created_time?: {
    date: string;
    timezone_type: number;
    timezone: string;
  };
  ult_modif_art_db?: {
    date: string;
    timezone_type: number;
    timezone: string;
  };
}

/**
 * Respuesta de la API externa
 */
interface ExternalApiResponse {
  success: boolean;
  data?: {
    registros: ExternalProduct[];
    pagination?: {
      current_page: number;
      total_pages: number;
      total_records: number;
      per_page: number;
    };
  };
  message?: string;
  error?: string;
}

/**
 * Servicio para gestionar productos desde la API externa
 */
export class ProductsService {
  private apiClient: AxiosInstance;
  private readonly apiUrl: string;
  private readonly token: string;
  private readonly base: string;
  private readonly tabla: string;

  constructor() {
    this.apiUrl = process.env.EXTERNAL_API_URL || 'https://sistemas.banados.cl/apiManager/api/getData.php';
    this.token = process.env.EXTERNAL_API_TOKEN || 'Banados2024!SecureToken%23987';
    this.base = process.env.EXTERNAL_API_BASE || 'Banados';
    this.tabla = process.env.PRODUCTS_TABLE || 'WMS_ZOHO_PRODUCTOS';

    this.apiClient = axios.create({
      baseURL: this.apiUrl,
      timeout: 10000, // Timeout de 10 segundos
      headers: {
        'Content-Type': 'application/json'
      },
      // Agregar configuración para mejorar rendimiento
      maxRedirects: 3,
      validateStatus: (status) => status < 500 // No lanzar error para códigos 4xx
    });
  }

  /**
   * Busca productos por código, nombre o SKU
   * @param options - Opciones de búsqueda
   * @param options.searchTerm - Término de búsqueda (código, nombre o SKU)
   * @param options.limit - Límite de resultados (default: 50)
   * @returns Lista de productos encontrados
   */
  async searchProducts(options: { searchTerm?: string; limit?: number }): Promise<ExternalProduct[]> {
    const { searchTerm = '', limit = 50 } = options;

    // Si no hay término de búsqueda válido, retornar vacío
    if (!searchTerm || searchTerm.trim().length < 2) {
      return [];
    }

    const startTime = Date.now();
    const searchTermLower = searchTerm.trim().toLowerCase();
    const searchLimit = Math.min(limit, 50); // Limitar a 50 para mejorar rendimiento

    try {
      // Optimizar: pedir solo el número de resultados necesarios + un pequeño buffer
      // Si el límite es pequeño (10), pedir solo 20-30 resultados en lugar de 250
      const requestedResults = Math.min(searchLimit + 10, 50); // Máximo 50 resultados de la API

      // Intentar usar el parámetro de búsqueda de la API si está disponible
      const params: Record<string, string> = {
        token: this.token,
        base: this.base,
        tabla: this.tabla,
        page: '1',
        per_page: String(requestedResults) // Pedir solo lo necesario
      };

      // Agregar parámetros de búsqueda si la API los soporta
      if (searchTerm) {
        params.search = searchTerm;
        params.search_fields = 'cod_art_local,name,item_name,sku,description';
      }

      console.log(`[ProductsService] Buscando productos: "${searchTerm}", límite: ${searchLimit}, pidiendo: ${requestedResults}`);

      const response = await this.apiClient.get<ExternalApiResponse>('', {
        params,
        timeout: 8000 // Timeout de 8 segundos
      });

      const requestTime = Date.now() - startTime;
      console.log(`[ProductsService] Respuesta recibida en ${requestTime}ms`);

      if (!response.data.success || !response.data.data?.registros) {
        console.warn('[ProductsService] API response indicates failure or no data');
        return [];
      }

      const totalRecords = response.data.data.registros.length;
      console.log(`[ProductsService] Recibidos ${totalRecords} registros de la API`);

      // Filtrar productos localmente
      const filteredProducts = response.data.data.registros
        .filter(product => this.matchesSearchTerm(product, searchTermLower))
        .slice(0, searchLimit);

      const totalTime = Date.now() - startTime;
      console.log(`[ProductsService] Filtrados ${filteredProducts.length} productos en ${totalTime}ms total`);

      return filteredProducts;
    } catch (error) {
      const totalTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error(`[ProductsService] Error después de ${totalTime}ms:`, errorMessage);
      
      // Si es un timeout, retornar array vacío en lugar de lanzar error
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          console.warn('[ProductsService] Request timeout - returning empty results');
          return [];
        }
        if (error.response) {
          console.error(`[ProductsService] API error response: ${error.response.status} - ${error.response.statusText}`);
        }
      }
      
      throw new Error(`Error al buscar productos en la API externa: ${errorMessage}`);
    }
  }

  /**
   * Verifica si un producto coincide con el término de búsqueda
   * @param product - Producto a verificar
   * @param searchTerm - Término de búsqueda en minúsculas
   * @returns true si el producto coincide
   */
  private matchesSearchTerm(product: ExternalProduct, searchTerm: string): boolean {
    const codigo = (product.cod_art_local || '').toLowerCase();
    const nombre = (product.name || product.item_name || '').toLowerCase();
    const sku = (product.sku || '').toLowerCase();
    const descripcion = (product.description || '').toLowerCase();

    return (
      codigo.includes(searchTerm) ||
      nombre.includes(searchTerm) ||
      sku.includes(searchTerm) ||
      descripcion.includes(searchTerm)
    );
  }

  /**
   * Obtiene un producto por su código
   * @param codigo - Código del producto
   * @returns Producto encontrado o null
   */
  async getProductByCode(codigo: string): Promise<ExternalProduct | null> {
    try {
      const products = await this.searchProducts({ searchTerm: codigo, limit: 1 });
      const product = products.find(p => 
        p.cod_art_local?.toLowerCase() === codigo.toLowerCase() ||
        p.sku?.toLowerCase() === codigo.toLowerCase()
      );
      return product || null;
    } catch (error) {
      console.error('Error getting product by code:', error);
      return null;
    }
  }
}

