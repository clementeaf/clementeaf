import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';

/**
 * Estado de conexión de WhatsApp
 */
export interface WhatsAppStatus {
  status: 'disconnected' | 'connecting' | 'connected' | 'authenticating';
  phoneNumber?: string;
  qrCode?: string;
  isAuthenticated: boolean;
}

/**
 * Respuesta al enviar un mensaje
 */
export interface SendMessageResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Servicio para interactuar con la API de WhatsApp
 */
export const whatsappService = {
  /**
   * Obtiene el estado de la conexión de WhatsApp
   */
  async getStatus(): Promise<WhatsAppStatus> {
    const response = await apiClient.get<{
      success: boolean;
      data: WhatsAppStatus;
    }>(endpoints.whatsapp.status);
    return response.data.data;
  },

  /**
   * Conecta con WhatsApp
   */
  async connect(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
    }>(endpoints.whatsapp.connect);
    return response.data;
  },

  /**
   * Desconecta WhatsApp
   */
  async disconnect(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
    }>(endpoints.whatsapp.disconnect);
    return response.data;
  },

  /**
   * Envía un mensaje de texto
   */
  async sendMessage(to: string, message: string): Promise<SendMessageResponse> {
    const response = await apiClient.post<{
      message: string;
      data: { messageId: string };
    }>(endpoints.whatsapp.sendMessage, {
      to,
      message
    });
    return {
      success: !!response.data.data?.messageId,
      messageId: response.data.data?.messageId
    };
  },

  /**
   * Envía una imagen
   */
  async sendImage(to: string, imageUrl: string, caption?: string): Promise<SendMessageResponse> {
    const response = await apiClient.post<{
      message: string;
      data: { messageId: string };
    }>(endpoints.whatsapp.sendImage, {
      to,
      imageUrl,
      caption
    });
    return {
      success: !!response.data.data?.messageId,
      messageId: response.data.data?.messageId
    };
  }
};

