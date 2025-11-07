import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type { CheckAuditorConfig } from '../types';

/**
 * Servicio para interactuar con la API de CheckAuditor
 */
export class CheckAuditorService {
  private client: AxiosInstance;
  private config: CheckAuditorConfig;

  constructor(config?: Partial<CheckAuditorConfig>) {
    this.config = {
      apiKey: config?.apiKey ?? process.env.CHECKAUDITOR_API_KEY ?? '',
      baseUrl: config?.baseUrl ?? process.env.CHECKAUDITOR_BASE_URL ?? 'https://app.checkauditor.com',
      timeout: config?.timeout ?? 30000
    };

    if (!this.config.apiKey || this.config.apiKey.trim() === '') {
      throw new Error('CheckAuditor API Key is required. Please set CHECKAUDITOR_API_KEY environment variable.');
    }

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'API-KEY': this.config.apiKey
      }
    });

    this.setupInterceptors();
  }

  /**
   * Configura interceptores para manejo de errores
   */
  private setupInterceptors(): void {
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          const status = error.response.status;
          const data = error.response.data as { message?: string; error?: string };
          
          if (status === 401) {
            throw new Error('Invalid CheckAuditor API credentials');
          }
          if (status === 403) {
            throw new Error('CheckAuditor API access forbidden');
          }
          if (status === 404) {
            throw new Error('CheckAuditor API endpoint not found');
          }
          if (status >= 500) {
            throw new Error('CheckAuditor API server error');
          }
          
          throw new Error(data.message ?? data.error ?? 'CheckAuditor API request failed');
        }
        
        if (error.request) {
          throw new Error('CheckAuditor API connection timeout');
        }
        
        throw new Error('CheckAuditor API request error');
      }
    );
  }

  /**
   * Autentica y establece conexión con el SII
   * @param companyId - ID de la compañía
   * @returns Respuesta de autenticación
   */
  async authenticateSession(companyId: string): Promise<unknown> {
    try {
      const response = await this.client.post(
        `/api/v1/sii/sessions?id=${companyId}`
      );
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error in authentication request');
    }
  }

  /**
   * Obtiene datos generales de una empresa
   * @param companyId - ID de la compañía
   * @returns Datos generales de la empresa
   */
  async getCompanyData(companyId: string): Promise<unknown> {
    try {
      const response = await this.client.get(
        `/api/v1/sii/sessions?company_id=${companyId}`
      );
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error in get company data request');
    }
  }

  /**
   * Obtiene notificaciones del SII
   * @param companyId - ID de la compañía
   * @returns Notificaciones del SII
   */
  async getNotifications(companyId: string): Promise<unknown> {
    try {
      const response = await this.client.get(
        `/api/v1/sii/notifications?company_id=${companyId}`
      );
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error in get notifications request');
    }
  }

  /**
   * Obtiene cartas del SII
   * @param companyId - ID de la compañía
   * @returns Cartas del SII
   */
  async getLetters(companyId: string): Promise<unknown> {
    try {
      const response = await this.client.get(
        `/api/v1/sii/letters?company_id=${companyId}`
      );
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error in get letters request');
    }
  }

  /**
   * Obtiene propiedades de una empresa
   * @param companyId - ID de la compañía
   * @returns Propiedades de la empresa
   */
  async getProperties(companyId: string): Promise<unknown> {
    try {
      const response = await this.client.get(
        `/api/v1/sii/properties?company_id=${companyId}`
      );
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error in get properties request');
    }
  }

  /**
   * Obtiene anotaciones vigentes
   * @returns Anotaciones vigentes
   */
  async getCurrentNotes(): Promise<unknown> {
    try {
      const response = await this.client.get('/api/v1/sii/notes/current');
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error in get current notes request');
    }
  }

  /**
   * Obtiene formulario 22 completo
   * @param companyId - ID de la compañía
   * @returns Formulario 22 completo
   */
  async getForm22Complete(companyId: string): Promise<unknown> {
    try {
      const response = await this.client.get(
        `/api/v1/sii/forms/22/complete?company_id=${companyId}`
      );
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error in get form 22 complete request');
    }
  }

  /**
   * Obtiene formulario 29
   * @param companyId - ID de la compañía
   * @param month - Mes (ej: "Enero", "Febrero", etc.)
   * @param year - Año (ej: 2024)
   * @returns Formulario 29
   */
  async getForm29(companyId: string, month: string, year: number): Promise<unknown> {
    try {
      const response = await this.client.get(
        `/api/v1/sii/forms-29?company_id=${companyId}&month=${month}&year=${year}`
      );
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error in get form 29 request');
    }
  }
}

