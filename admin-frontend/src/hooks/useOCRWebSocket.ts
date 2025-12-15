import { useEffect, useCallback, useRef, useState } from 'react';
import { getCookie } from '../utils/cookies';

interface OCRDocumentUpdate {
  action: 'ocr_document_update';
  documentId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  timestamp: string;
  fileName?: string;
  documentType?: string;
  errorMessage?: string;
  extractedData?: {
    orderNumber?: string;
    companyName?: string;
    companyRut?: string;
    total?: number;
    itemsCount?: number;
  };
}

interface UseOCRWebSocketProps {
  onDocumentUpdate?: (update: OCRDocumentUpdate) => void;
  onDocumentProcessing?: (documentId: string, fileName?: string) => void;
  onDocumentCompleted?: (documentId: string, extractedData?: any) => void;
  onDocumentFailed?: (documentId: string, errorMessage?: string) => void;
}

/**
 * Hook personalizado para manejar actualizaciones de OCR vía WebSocket
 * 
 * @example
 * ```tsx
 * const { isConnected } = useOCRWebSocket({
 *   onDocumentCompleted: (docId, data) => {
 *     console.log('Documento procesado:', docId, data);
 *     // Actualizar estado local o recargar datos
 *   },
 *   onDocumentFailed: (docId, error) => {
 *     console.error('Error procesando:', docId, error);
 *   }
 * });
 * ```
 */
export const useOCRWebSocket = ({
  onDocumentUpdate,
  onDocumentProcessing,
  onDocumentCompleted,
  onDocumentFailed
}: UseOCRWebSocketProps = {}) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const WSS_ENDPOINT = import.meta.env.VITE_WS_URL || 'wss://ao9gv2kwll.execute-api.us-east-1.amazonaws.com/dev';

  // Handler central de mensajes OCR
  const handleOCRMessage = useCallback((data: OCRDocumentUpdate) => {
    console.log('📄 OCR WebSocket Update:', data);

    // Callback genérico
    onDocumentUpdate?.(data);

    // Callbacks específicos por estado
    switch (data.status) {
      case 'PROCESSING':
        onDocumentProcessing?.(data.documentId, data.fileName);
        break;
      
      case 'COMPLETED':
        onDocumentCompleted?.(data.documentId, data.extractedData);
        break;
      
      case 'FAILED':
        onDocumentFailed?.(data.documentId, data.errorMessage);
        break;
    }
  }, [onDocumentUpdate, onDocumentProcessing, onDocumentCompleted, onDocumentFailed]);

  // Conectar al WebSocket
  useEffect(() => {
    const token = getCookie('authToken');
    if (!token) {
      console.warn('⚠️ No auth token found, skipping WebSocket connection for OCR');
      return;
    }

    const wsUrl = `${WSS_ENDPOINT}?token=${encodeURIComponent(token)}`;
    console.log('🔌 Conectando a WebSocket para OCR...');

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('✅ WebSocket conectado para OCR');
      setIsConnected(true);
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.action === 'ocr_document_update') {
          handleOCRMessage(message as OCRDocumentUpdate);
        }
      } catch (error) {
        console.error('Error parsing OCR WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket error (OCR):', error);
    };

    ws.onclose = () => {
      console.log('🔌 WebSocket desconectado (OCR)');
      setIsConnected(false);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [handleOCRMessage, WSS_ENDPOINT]);

  return {
    isConnected
  };
};
