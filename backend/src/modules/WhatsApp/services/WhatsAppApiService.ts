import axios, { AxiosInstance } from 'axios';

/**
 * Servicio para interactuar con la API del servicio de WhatsApp
 */
export class WhatsAppApiService {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.WHATSAPP_SERVICE_URL || 'http://localhost:3000';
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Obtiene el estado de la conexión de WhatsApp
   */
  async getStatus(): Promise<{
    success: boolean;
    data: {
      status: string;
      phoneNumber?: string;
      qrCode?: string;
      isAuthenticated: boolean;
    };
  }> {
    try {
      const response = await this.client.get('/api/whatsapp/status');
      return response.data;
    } catch (error) {
      console.error('Error al obtener estado de WhatsApp:', error);
      throw new Error('Error al obtener estado de WhatsApp');
    }
  }

  /**
   * Inicia la conexión con WhatsApp
   */
  async connect(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.client.post('/api/whatsapp/connect');
      return response.data;
    } catch (error) {
      console.error('Error al conectar WhatsApp:', error);
      throw new Error('Error al conectar con WhatsApp');
    }
  }

  /**
   * Desconecta la sesión de WhatsApp
   */
  async disconnect(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.client.post('/api/whatsapp/disconnect');
      return response.data;
    } catch (error) {
      console.error('Error al desconectar WhatsApp:', error);
      throw new Error('Error al desconectar WhatsApp');
    }
  }

  /**
   * Envía un mensaje de texto
   */
  async sendMessage(to: string, message: string): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      const response = await this.client.post('/api/whatsapp/send-message', {
        to,
        message
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data as { error?: string };
        throw new Error(errorData.error || 'Error al enviar mensaje');
      }
      console.error('Error al enviar mensaje:', error);
      throw new Error('Error al enviar mensaje de WhatsApp');
    }
  }

  /**
   * Envía una imagen
   */
  async sendImage(to: string, imageUrl: string, caption?: string): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      const response = await this.client.post('/api/whatsapp/send-image', {
        to,
        imageUrl,
        caption
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data as { error?: string };
        throw new Error(errorData.error || 'Error al enviar imagen');
      }
      console.error('Error al enviar imagen:', error);
      throw new Error('Error al enviar imagen por WhatsApp');
    }
  }
}

