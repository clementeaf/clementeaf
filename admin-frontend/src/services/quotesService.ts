import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';

/**
 * DTO para crear una orden de compra
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
  estadoPicking?: string | null;
}

/**
 * Respuesta de creación de orden de compra
 */
export interface QuoteResponse {
  id: number;
  clienteNombre: string;
  numeroCotizacion: string | null;
  estado: string;
  estadoPicking?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Orden de compra completa
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
  estadoPicking?: string | null;
  invoice?: {
    id: number;
    invoiceNumber: string;
    issueDate: string | null;
    currency: string;
    netAmount: number;
    taxAmount: number;
    totalAmount: number;
    status: string;
    xml?: string | null;
  } | null;
  invoiceItems?: Array<{
    id: number;
    productCode: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Respuesta paginada de órdenes de compra
 */
export interface PaginatedQuotesResponse {
  data: Quote[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type PickingStatus = 'iniciado' | 'recolectado' | 'confirmado' | 'en_ruta';

export interface UpdatePickingStatusResponse {
  id: number;
  numeroCotizacion: string | null;
  estado: string;
  estadoPicking: PickingStatus;
  clienteNombre: string;
  updatedAt: string;
}

export interface ConfirmPickingResponse {
  id: number;
  numeroCotizacion: string | null;
  estado: string;
  estadoPicking: PickingStatus;
  invoice: { id: number; invoiceNumber: string; totalAmount: number } | null;
  totalSalidas: number;
  updatedAt: string;
}

/**
 * Servicio para gestionar órdenes de compra
 */
export const quotesService = {
  /**
   * Crea una nueva orden de compra
   * @param quoteData - Datos de la orden de compra a crear
   * @returns Orden de compra creada
   */
  async createQuote(quoteData: CreateQuoteDto): Promise<QuoteResponse> {
    const { data } = await apiClient.post<{ data: QuoteResponse; message: string }>(
      endpoints.quotes.create,
      quoteData
    );
    return data.data;
  },

  /**
   * Obtiene una orden de compra por su ID
   * @param id - ID de la orden de compra
   * @returns Orden de compra encontrada o null si no existe
   */
  async getQuoteById(
    id: number,
    options?: { includeInvoice?: boolean; includeInvoiceXml?: boolean }
  ): Promise<Quote | null> {
    try {
      const url = endpoints.quotes.getById.replace('{id}', id.toString());
      const response = await apiClient.get<{ data: Quote }>(url, {
        params: {
          includeInvoice: options?.includeInvoice ?? true,
          includeInvoiceXml: options?.includeInvoiceXml ?? false
        }
      });
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
   * Obtiene todas las órdenes de compra con paginación
   * @param page - Número de página
   * @param limit - Límite de resultados por página
   * @returns Lista de órdenes de compra paginada
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
   * Actualiza una orden de compra
   * @param id - ID de la orden de compra
   * @param quoteData - Datos a actualizar
   * @returns Orden de compra actualizada
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
   * Actualiza el estado de picking de una nota de venta aprobada
   * @param id - ID de la nota de venta
   * @param estadoPicking - Nuevo estado de picking
   * @returns Respuesta con la nota actualizada
   */
  async updatePickingStatus(id: number, estadoPicking: PickingStatus): Promise<UpdatePickingStatusResponse> {
    const url = endpoints.quotes.updatePickingStatus.replace('{id}', id.toString());
    const { data } = await apiClient.put<{ data: UpdatePickingStatusResponse }>(url, { estadoPicking });
    return data.data;
  },

  /**
   * Confirma picking: convierte RESERVA → SALIDA y emite factura
   * @param id - ID de la nota de venta
   * @returns Respuesta con resumen del despacho y factura
   */
  async confirmPicking(id: number): Promise<ConfirmPickingResponse> {
    const url = endpoints.quotes.confirmPicking.replace('{id}', id.toString());
    const { data } = await apiClient.post<{ data: ConfirmPickingResponse }>(url);
    return data.data;
  },

  /**
   * Elimina una orden de compra
   * @param id - ID de la orden de compra
   * @returns true si se eliminó correctamente
   */
  async deleteQuote(id: number): Promise<boolean> {
    const url = endpoints.quotes.delete.replace('{id}', id.toString());
    await apiClient.delete<{ message: string }>(url);
    return true;
  },

  /**
   * Obtiene el siguiente número correlativo de orden de compra
   * @returns Siguiente número de orden de compra
   */
  async getNextQuoteNumber(): Promise<string> {
    const { data } = await apiClient.get<{ data: { nextQuoteNumber: string } }>(
      endpoints.quotes.getNextNumber
    );
    return data.data.nextQuoteNumber;
  }
};

