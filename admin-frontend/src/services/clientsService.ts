import { apiClient } from './api';
import { endpoints } from '../api/endpoints';

/**
 * DTO para crear un cliente
 */
export interface CreateClientDto {
  // Paso 1: Información del Cliente
  rut: string;
  razonSocial: string;
  nombreCliente: string;
  rutCompleto: string;
  giro: string;
  sitioWeb?: string;

  // Paso 2: Segmentación
  propietarioCliente?: string;
  tamanoEmpresa?: string;
  segmento?: string;
  subsegmento?: string;
  empleados?: number;
  tratos?: string;

  // Paso 3: Facturación
  documentoPorDefecto?: string;
  formaPago?: string;
  listaPrecios?: string;
  ingresosAnuales?: number;
  limiteCredito?: number;
  creditoUsado?: number;
  motivoBloqueo?: string;
  respaldoRUT?: string;
  clienteExigeOC?: boolean;
  aprobadoPorFinanzas?: boolean;

  // Paso 4: Contacto
  contactoNombre?: string;
  contactoCargo?: string;
  contactoCorreoElectronico?: string;
  contactoTelefono?: string;
  contactoCountryCode?: string;
  contactoCountryDialCode?: string;

  // Paso 5: Dirección de Facturación
  direccionFacturacion?: string;
  regionFacturacion?: string;
  comunaFacturacion?: string;
  codigoPostalFacturacion?: string;

  // Paso 5: Dirección de Despacho
  direccionDespacho?: string;
  regionDespacho?: string;
  comunaDespacho?: string;
  codigoPostalDespacho?: string;
  usarMismaDireccion?: boolean;
}

/**
 * Respuesta de creación de cliente
 */
export interface ClientResponse {
  id: number;
  rut: string;
  razonSocial: string;
  nombreCliente: string;
  rutCompleto: string;
  giro: string;
  sitioWeb: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Cliente completo
 */
export interface Client {
  id: number;
  rut: string;
  razonSocial: string;
  nombreCliente: string;
  rutCompleto: string;
  giro: string;
  sitioWeb: string | null;
  propietarioCliente: string | null;
  tamanoEmpresa: string | null;
  segmento: string | null;
  subsegmento: string | null;
  empleados: number | null;
  tratos: string | null;
  documentoPorDefecto: string | null;
  formaPago: string | null;
  listaPrecios: string | null;
  ingresosAnuales: number | null;
  limiteCredito: number | null;
  creditoUsado: number | null;
  motivoBloqueo: string | null;
  respaldoRUT: string | null;
  clienteExigeOC: boolean;
  aprobadoPorFinanzas: boolean;
  contactoNombre: string | null;
  contactoCargo: string | null;
  contactoCorreoElectronico: string | null;
  contactoTelefono: string | null;
  contactoCountryCode: string | null;
  contactoCountryDialCode: string | null;
  direccionFacturacion: string | null;
  regionFacturacion: string | null;
  comunaFacturacion: string | null;
  codigoPostalFacturacion: string | null;
  direccionDespacho: string | null;
  regionDespacho: string | null;
  comunaDespacho: string | null;
  codigoPostalDespacho: string | null;
  usarMismaDireccion: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Respuesta paginada de clientes
 */
export interface PaginatedClientsResponse {
  data: Client[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Servicio para gestionar clientes
 */
export const clientsService = {
  /**
   * Crea un nuevo cliente
   * @param clientData - Datos del cliente a crear
   * @returns Cliente creado
   */
  async createClient(clientData: CreateClientDto): Promise<ClientResponse> {
    const { data } = await apiClient.post<{ data: ClientResponse; message: string }>(
      endpoints.clients.create,
      clientData
    );
    return data.data;
  },

  /**
   * Obtiene un cliente por su ID
   * @param id - ID del cliente
   * @returns Cliente encontrado o null si no existe
   */
  async getClientById(id: number): Promise<Client | null> {
    try {
      const url = endpoints.clients.getById.replace('{id}', id.toString());
      console.log('clientsService.getClientById - URL:', url, 'ID:', id);
      const response = await apiClient.get<{ data: Client }>(url);
      console.log('clientsService.getClientById - Respuesta recibida:', response.data);
      // El backend devuelve { data: Client } directamente, no { data: { data: Client } }
      const client = response.data.data;
      console.log('clientsService.getClientById - Cliente extraído:', client ? `ID ${client.id}` : 'null');
      return client;
    } catch (error: unknown) {
      console.error('clientsService.getClientById - Error:', error);
      // Si es un error 404 (cliente no encontrado), devolver null en lugar de lanzar error
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { error?: string } } };
        if (axiosError.response?.status === 404) {
          console.log('clientsService.getClientById - Cliente no encontrado (404)');
          return null;
        }
      }
      // Para otros errores, lanzar el error normalmente
      throw error;
    }
  },

  /**
   * Obtiene todos los clientes con paginación
   * @param page - Número de página
   * @param limit - Límite de resultados por página
   * @returns Lista de clientes paginada
   */
  async getAllClients(page: number = 1, limit: number = 50): Promise<PaginatedClientsResponse> {
    const { data } = await apiClient.get<{ data: PaginatedClientsResponse }>(
      endpoints.clients.getAll,
      {
        params: { page, limit }
      }
    );
    return data.data;
  },

  /**
   * Actualiza un cliente
   * @param id - ID del cliente
   * @param clientData - Datos a actualizar
   * @returns Cliente actualizado
   */
  async updateClient(id: number, clientData: Partial<CreateClientDto>): Promise<ClientResponse> {
    const url = endpoints.clients.update.replace('{id}', id.toString());
    const { data } = await apiClient.put<{ data: ClientResponse; message: string }>(
      url,
      clientData
    );
    return data.data;
  },

  /**
   * Elimina un cliente
   * @param id - ID del cliente
   * @returns true si se eliminó correctamente
   */
  async deleteClient(id: number): Promise<boolean> {
    const url = endpoints.clients.delete.replace('{id}', id.toString());
    await apiClient.delete<{ message: string }>(url);
    return true;
  }
};

