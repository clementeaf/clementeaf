import { apiClient } from './api';
import { endpoints } from '../api/endpoints';

/**
 * DTO para crear una cotización
 */
export interface CreateQuoteDto {
  clienteNombre: string;
  direccionFacturacion?: string;
  telefono?: string;
  regionComunaCodigo?: string;
  asesorAsignado?: string;
  contactoNombre?: string;
  contactoTelefono?: string;
  contactoEmail?: string;
  countryCode?: string;
  countryDialCode?: string;
  contactoCountryCode?: string;
  contactoCountryDialCode?: string;
  numeroCotizacion?: string;
  fecha?: string;
  terminosPago?: string;
  numeroReferencia?: string;
  centroCosto?: string;
  listaPrecios?: string;
  sinCostoEnvio?: boolean;
  productos?: string;
  estado?: string;
}

/**
 * Respuesta de creación de cotización
 */
export interface QuoteResponse {
  id: number;
  clienteNombre: string;
  numeroCotizacion: string | null;
  estado: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Cotización completa
 */
export interface Quote {
  id: number;
  clienteNombre: string;
  direccionFacturacion: string | null;
  telefono: string | null;
  regionComunaCodigo: string | null;
  asesorAsignado: string | null;
  contactoNombre: string | null;
  contactoTelefono: string | null;
  contactoEmail: string | null;
  countryCode: string | null;
  countryDialCode: string | null;
  contactoCountryCode: string | null;
  contactoCountryDialCode: string | null;
  numeroCotizacion: string | null;
  fecha: string | null;
  terminosPago: string | null;
  numeroReferencia: string | null;
  centroCosto: string | null;
  listaPrecios: string | null;
  sinCostoEnvio: boolean;
  productos: string | null;
  estado: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Respuesta paginada de cotizaciones
 */
export interface PaginatedQuotesResponse {
  data: Quote[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Servicio para gestionar cotizaciones
 */
export const quotesService = {
  /**
   * Crea una nueva cotización
   * @param quoteData - Datos de la cotización a crear
   * @returns Cotización creada
   */
  async createQuote(quoteData: CreateQuoteDto): Promise<QuoteResponse> {
    const { data } = await apiClient.post<{ data: QuoteResponse; message: string }>(
      endpoints.quotes.create,
      quoteData
    );
    return data.data;
  },

  /**
   * Obtiene una cotización por su ID
   * @param id - ID de la cotización
   * @returns Cotización encontrada o null si no existe
   */
  async getQuoteById(id: number): Promise<Quote | null> {
    try {
      const url = endpoints.quotes.getById.replace('{id}', id.toString());
      const response = await apiClient.get<{ data: Quote }>(url);
      return response.data.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          return null;
        }
      }
      throw error;
    }
  },

  /**
   * Obtiene todas las cotizaciones con paginación
   * @param page - Número de página
   * @param limit - Límite de resultados por página
   * @returns Lista de cotizaciones paginada
   */
  async getAllQuotes(page: number = 1, limit: number = 50): Promise<PaginatedQuotesResponse> {
    const { data } = await apiClient.get<{ data: PaginatedQuotesResponse }>(
      endpoints.quotes.getAll,
      {
        params: { page, limit }
      }
    );
    return data.data;
  },

  /**
   * Actualiza una cotización
   * @param id - ID de la cotización
   * @param quoteData - Datos a actualizar
   * @returns Cotización actualizada
   */
  async updateQuote(id: number, quoteData: Partial<CreateQuoteDto>): Promise<QuoteResponse> {
    const url = endpoints.quotes.update.replace('{id}', id.toString());
    const { data } = await apiClient.put<{ data: QuoteResponse; message: string }>(
      url,
      quoteData
    );
    return data.data;
  },

  /**
   * Elimina una cotización
   * @param id - ID de la cotización
   * @returns true si se eliminó correctamente
   */
  async deleteQuote(id: number): Promise<boolean> {
    const url = endpoints.quotes.delete.replace('{id}', id.toString());
    await apiClient.delete<{ message: string }>(url);
    return true;
  }
};

