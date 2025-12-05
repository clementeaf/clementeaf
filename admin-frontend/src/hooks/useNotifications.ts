import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Notification, PickingNotification, SalesNotification } from '../types/notifications';
import { usePermissions } from './usePermissions';
import { notificationsService } from '../services/notificationsService';
import type { PickingOrder } from '../pages/Picking/types';

/**
 * Hook para gestionar notificaciones según el rol del usuario
 * @returns Estado y funciones para manejar notificaciones
 */
export const useNotifications = () => {
  const { hasPermission, isSuperAdmin } = usePermissions();
  const queryClient = useQueryClient();
  const [localNotifications, setLocalNotifications] = useState<Notification[]>([]);

  /**
   * Carga notificaciones desde la API
   */
  const { data: apiNotifications, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await notificationsService.getNotifications(50, 0);
      return response;
    },
    staleTime: 1000 * 30, // 30 segundos
    refetchInterval: 1000 * 60, // Refrescar cada minuto
    enabled: true
  });

  /**
   * Combina notificaciones de la API con notificaciones locales (nuevas)
   */
  const notifications = useMemo(() => {
    const api = apiNotifications?.notifications || [];
    const local = localNotifications;
    
    // Combinar y eliminar duplicados (priorizar locales si hay conflicto)
    const all = [...local, ...api];
    const unique = Array.from(
      new Map(all.map(notif => [notif.id, notif])).values()
    );
    
    // Ordenar por fecha (más recientes primero)
    return unique.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [apiNotifications, localNotifications]);

  /**
   * Verifica si el usuario tiene acceso a notificaciones de Picking
   */
  const hasPickingAccess = useMemo(() => {
    if (isSuperAdmin) return true;
    return hasPermission('module:picking') || hasPermission('view:picking:order');
  }, [hasPermission, isSuperAdmin]);

  /**
   * Verifica si el usuario tiene acceso a notificaciones de Ventas
   */
  const hasSalesAccess = useMemo(() => {
    if (isSuperAdmin) return true;
    return hasPermission('module:ventas') || hasPermission('view:ventas:nota-de-venta');
  }, [hasPermission, isSuperAdmin]);

  /**
   * Crea una notificación de Picking cuando se genera una nueva nota de venta
   */
  const createPickingNotification = useCallback((pickingOrder: PickingOrder, quoteInfo?: { clienteNombre?: string }): void => {
    if (!hasPickingAccess) return;

    const notification: PickingNotification = {
      id: `picking-${pickingOrder.id}-${Date.now()}`,
      type: 'picking',
      status: 'unread',
      title: 'Nueva nota de venta',
      message: `Se ha generado una nueva nota de venta ${pickingOrder.codigoOrden} para ${quoteInfo?.clienteNombre || 'cliente'}`,
      quoteId: pickingOrder.id,
      codigoOrden: pickingOrder.codigoOrden,
      clienteNombre: quoteInfo?.clienteNombre || 'Sin cliente',
      vendedor: pickingOrder.vendedor,
      createdAt: new Date().toISOString()
    };

    // Agregar a notificaciones locales (se sincronizará con la API en el próximo refresh)
    setLocalNotifications(prev => [notification, ...prev]);
  }, [hasPickingAccess]);

  /**
   * Crea una notificación de Ventas cuando una nota de venta cambia de estado
   */
  const createSalesNotification = useCallback((
    quoteId: string,
    codigoOrden: string,
    estadoAnterior: string,
    estadoNuevo: string,
    clienteNombre: string
  ): void => {
    if (!hasSalesAccess) return;

    const notification: SalesNotification = {
      id: `sales-${quoteId}-${Date.now()}`,
      type: 'sales',
      status: 'unread',
      title: 'Nota de venta actualizada',
      message: `La nota de venta ${codigoOrden} ha cambiado de "${estadoAnterior}" a "${estadoNuevo}"`,
      quoteId,
      codigoOrden,
      estadoAnterior,
      estadoNuevo,
      clienteNombre,
      createdAt: new Date().toISOString()
    };

    // Agregar a notificaciones locales (se sincronizará con la API en el próximo refresh)
    setLocalNotifications(prev => [notification, ...prev]);
  }, [hasSalesAccess]);

  /**
   * Marca una notificación como leída
   */
  const markAsRead = useCallback(async (notificationId: string): Promise<void> => {
    // Actualizar localmente primero para feedback inmediato
    setLocalNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId
          ? { ...notif, status: 'read' as const, readAt: new Date().toISOString() }
          : notif
      )
    );

    // Intentar sincronizar con el backend
    try {
      // Si el ID es numérico, usarlo directamente; si es string, intentar extraer el número
      let id: number;
      if (typeof notificationId === 'number') {
        id = notificationId;
      } else {
        // Intentar parsear si es un string numérico
        const parsed = parseInt(notificationId, 10);
        if (!isNaN(parsed)) {
          id = parsed;
        } else {
          // Si es un ID temporal (picking-xxx o sales-xxx), no sincronizar
          return;
        }
      }
      await notificationsService.markAsRead(id);
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
    }

    // Refrescar desde la API
    await refetch();
  }, [refetch]);

  /**
   * Marca todas las notificaciones como leídas
   */
  const markAllAsRead = useCallback(async (): Promise<void> => {
    // Actualizar localmente primero
    setLocalNotifications(prev =>
      prev.map(notif => ({
        ...notif,
        status: 'read' as const,
        readAt: notif.readAt || new Date().toISOString()
      }))
    );

    // Sincronizar con el backend
    try {
      await notificationsService.markAllAsRead();
    } catch (error) {
      console.error('Error marcando todas las notificaciones como leídas:', error);
    }

    // Refrescar desde la API
    await refetch();
  }, [refetch]);

  /**
   * Elimina una notificación
   */
  const removeNotification = useCallback((notificationId: string): void => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  }, []);

  /**
   * Obtiene el conteo de notificaciones no leídas
   */
  const unreadCount = useMemo(() => {
    // Usar el conteo de la API si está disponible, sino calcular localmente
    if (apiNotifications?.unreadCount !== undefined) {
      return apiNotifications.unreadCount;
    }
    return notifications.filter(notif => notif.status === 'unread').length;
  }, [apiNotifications, notifications]);

  /**
   * Sincroniza notificaciones locales con la API periódicamente
   */
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 60000); // Cada minuto

    return () => clearInterval(interval);
  }, [refetch]);


  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    createPickingNotification,
    createSalesNotification,
    hasPickingAccess,
    hasSalesAccess
  };
};

