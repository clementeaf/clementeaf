import axios from 'axios';
import { endpoints } from '../api/endpoints';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://zzv7qnwgz1.execute-api.us-east-1.amazonaws.com/dev';

// Cliente axios sin interceptor de autenticación para presigned URLs
const apiClientWithoutAuth = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * DTO para solicitar una presigned URL
 */
export interface GetPresignedUrlDto {
  fileName: string;
  contentType: string;
  ticketId?: number;
}

/**
 * Respuesta de presigned URL
 */
export interface PresignedUrlResponse {
  presignedUrl: string;
  key: string;
  expiresIn: number;
}

/**
 * Servicio para interactuar con S3 mediante presigned URLs
 */
export const s3Service = {
  /**
   * Obtiene una presigned URL para subir una imagen
   * @param fileName - Nombre del archivo
   * @param contentType - Tipo MIME del archivo (ej: image/jpeg)
   * @param ticketId - ID del ticket (opcional, para tickets existentes)
   * @returns Presigned URL y key del objeto
   */
  getPresignedUrl: async (
    fileName: string,
    contentType: string,
    ticketId?: number
  ): Promise<PresignedUrlResponse> => {
    try {
      // Usar cliente sin autenticación para esta petición específica
      const response = await apiClientWithoutAuth.post<{ data: PresignedUrlResponse }>(
        endpoints.tickets.getPresignedUrl,
        {
          fileName,
          contentType,
          ticketId
        }
      );
      return response.data.data;
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { error?: string; message?: string } } };
        if (axiosError.response?.status === 401) {
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
        const errorMessage = axiosError.response?.data?.error || axiosError.response?.data?.message || 'Error al obtener presigned URL';
        throw new Error(errorMessage);
      }
      throw error instanceof Error ? error : new Error('Error desconocido al obtener presigned URL');
    }
  },

  /**
   * Sube un archivo a S3 usando una presigned URL
   * @param file - Archivo a subir
   * @param presignedUrl - URL presigned obtenida del backend
   * @returns Promise que se resuelve cuando la subida es exitosa
   */
  uploadFile: async (file: File, presignedUrl: string): Promise<void> => {
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type
      }
    });

    if (!response.ok) {
      throw new Error(`Error al subir archivo: ${response.statusText}`);
    }
  },

  /**
   * Sube múltiples archivos a S3
   * @param files - Array de archivos a subir
   * @param ticketId - ID del ticket (opcional)
   * @returns Array de keys de los archivos subidos
   */
  uploadFiles: async (
    files: File[],
    ticketId?: number
  ): Promise<string[]> => {
    const uploadPromises = files.map(async (file) => {
      const { presignedUrl, key } = await s3Service.getPresignedUrl(
        file.name,
        file.type,
        ticketId
      );
      await s3Service.uploadFile(file, presignedUrl);
      return key;
    });

    return Promise.all(uploadPromises);
  }
};

