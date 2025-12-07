/**
 * DTO para enviar una imagen por WhatsApp
 */
export interface SendImageDto {
  to: string;
  imageUrl: string;
  caption?: string;
}

