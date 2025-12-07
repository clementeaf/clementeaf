import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { whatsappService, type WhatsAppStatus, type SendMessageResponse } from '../services/whatsappService';
import { toast } from 'react-toastify';

/**
 * Hook para obtener el estado de WhatsApp
 */
export const useWhatsAppStatus = () => {
  return useQuery({
    queryKey: ['whatsapp', 'status'],
    queryFn: () => whatsappService.getStatus(),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Refrescar cada 5 segundos si está conectando o autenticando
      if (status === 'connecting' || status === 'authenticating') {
        return 5000;
      }
      // Refrescar cada 30 segundos si está conectado
      if (status === 'connected') {
        return 30000;
      }
      // No refrescar si está desconectado
      return false;
    },
    staleTime: 0
  });
};

/**
 * Hook para conectar WhatsApp
 */
export const useConnectWhatsApp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => whatsappService.connect(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'status'] });
      toast.success('Conexión iniciada. Escanea el QR Code que aparece en la terminal del servidor.');
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Error al conectar WhatsApp';
      toast.error(message);
    }
  });
};

/**
 * Hook para desconectar WhatsApp
 */
export const useDisconnectWhatsApp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => whatsappService.disconnect(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'status'] });
      toast.success('WhatsApp desconectado exitosamente');
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Error al desconectar WhatsApp';
      toast.error(message);
    }
  });
};

/**
 * Hook para enviar un mensaje de texto
 */
export const useSendWhatsAppMessage = () => {
  return useMutation({
    mutationFn: ({ to, message }: { to: string; message: string }) =>
      whatsappService.sendMessage(to, message),
    onSuccess: (data: SendMessageResponse) => {
      if (data.success) {
        toast.success('Mensaje enviado exitosamente');
      } else {
        toast.error(data.error || 'Error al enviar mensaje');
      }
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Error al enviar mensaje';
      toast.error(message);
    }
  });
};

/**
 * Hook para enviar una imagen
 */
export const useSendWhatsAppImage = () => {
  return useMutation({
    mutationFn: ({ to, imageUrl, caption }: { to: string; imageUrl: string; caption?: string }) =>
      whatsappService.sendImage(to, imageUrl, caption),
    onSuccess: (data: SendMessageResponse) => {
      if (data.success) {
        toast.success('Imagen enviada exitosamente');
      } else {
        toast.error(data.error || 'Error al enviar imagen');
      }
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Error al enviar imagen';
      toast.error(message);
    }
  });
};

