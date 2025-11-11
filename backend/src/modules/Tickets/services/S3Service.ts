import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Servicio para generar presigned URLs de S3 para subir imágenes
 */
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      endpoint: process.env.AWS_ENDPOINT_URL || undefined
    });
    this.bucketName = process.env.S3_BUCKET_NAME ?? 'banados-analytics-data';
  }

  /**
   * Genera una presigned URL para subir una imagen
   * @param key - Clave del objeto en S3 (ruta completa)
   * @param contentType - Tipo de contenido de la imagen (ej: image/jpeg, image/png)
   * @param expiresIn - Tiempo de expiración en segundos (default: 3600 = 1 hora)
   * @returns Presigned URL para subir la imagen
   */
  async getPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn: number = 3600
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType
    });

    const presignedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
    return presignedUrl;
  }

  /**
   * Genera una clave única para una imagen de ticket
   * @param ticketId - ID del ticket
   * @param userId - ID del usuario que sube la imagen
   * @param fileName - Nombre original del archivo
   * @returns Clave única para el objeto en S3
   */
  generateTicketImageKey(ticketId: number, userId: number, fileName: string): string {
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `tickets/${ticketId}/${userId}/${timestamp}-${sanitizedFileName}`;
  }
}

