import { useEffect, useRef, useCallback } from 'react';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: unknown;
  onClick?: () => void;
}

/**
 * Hook para gestionar notificaciones del navegador
 * @returns Funciones para solicitar permisos y mostrar notificaciones
 */
export const useBrowserNotifications = () => {
  const permissionRef = useRef<NotificationPermission>('default');
  const notificationRef = useRef<Notification | null>(null);

  /**
   * Solicita permisos para mostrar notificaciones
   * @returns Promise que resuelve con el estado del permiso
   */
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      console.warn('Este navegador no soporta notificaciones del navegador');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      permissionRef.current = 'granted';
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      permissionRef.current = permission;
      return permission;
    }

    permissionRef.current = 'denied';
    return 'denied';
  }, []);

  /**
   * Verifica si la pestaña está activa
   * @returns true si la pestaña está visible
   */
  const isTabActive = useCallback((): boolean => {
    return !document.hidden;
  }, []);

  /**
   * Muestra una notificación del navegador
   * @param options - Opciones de la notificación
   * @returns true si se mostró la notificación
   */
  const showNotification = useCallback((options: NotificationOptions): boolean => {
    if (!('Notification' in window)) {
      return false;
    }

    if (permissionRef.current !== 'granted') {
      return false;
    }

    // Cerrar notificación anterior si existe
    if (notificationRef.current) {
      notificationRef.current.close();
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        tag: options.tag,
        data: options.data,
        requireInteraction: false,
        silent: false
      });

      notificationRef.current = notification;

      // Manejar click en la notificación
      if (options.onClick) {
        notification.onclick = (event) => {
          event.preventDefault();
          window.focus();
          options.onClick?.();
          notification.close();
        };
      }

      // Cerrar automáticamente después de 5 segundos
      setTimeout(() => {
        notification.close();
        if (notificationRef.current === notification) {
          notificationRef.current = null;
        }
      }, 5000);

      return true;
    } catch (error) {
      console.error('Error mostrando notificación:', error);
      return false;
    }
  }, []);

  /**
   * Cierra la notificación actual
   */
  const closeNotification = useCallback(() => {
    if (notificationRef.current) {
      notificationRef.current.close();
      notificationRef.current = null;
    }
  }, []);

  // Inicializar permisos al montar el componente
  useEffect(() => {
    if ('Notification' in window) {
      permissionRef.current = Notification.permission;
      
      // Solicitar permisos automáticamente si aún no se han solicitado
      if (Notification.permission === 'default') {
        requestPermission().catch(console.error);
      }
    }
  }, [requestPermission]);

  // Limpiar notificación al desmontar
  useEffect(() => {
    return () => {
      if (notificationRef.current) {
        notificationRef.current.close();
      }
    };
  }, []);

  return {
    requestPermission,
    showNotification,
    closeNotification,
    isTabActive,
    hasPermission: permissionRef.current === 'granted',
    permission: permissionRef.current
  };
};

