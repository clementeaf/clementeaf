/**
 * DTO para solicitar una presigned URL
 */
export interface GetPresignedUrlDto {
  fileName: string;
  contentType: string;
  ticketId?: number;
}

