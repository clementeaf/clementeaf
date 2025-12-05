/**
 * Tipos de notificaciones según el módulo/rol
 */
export type NotificationType = 'picking' | 'sales';

/**
 * Estados de una notificación
 */
export type NotificationStatus = 'unread' | 'read';

/**
 * Interfaz base para notificaciones
 */
export interface BaseNotification {
  id: string | number;
  type: NotificationType;
  status: NotificationStatus;
  createdAt: string;
  readAt?: string | null;
}

/**
 * Notificación para Picking: Nueva nota de venta creada
 */
export interface PickingNotification extends BaseNotification {
  type: 'picking';
  title: string;
  message: string;
  quoteId: string;
  codigoOrden: string;
  clienteNombre: string;
  vendedor: string;
}

/**
 * Notificación para Ventas: Nota de venta cambió de estado
 */
export interface SalesNotification extends BaseNotification {
  type: 'sales';
  title: string;
  message: string;
  quoteId: string;
  codigoOrden: string;
  estadoAnterior: string;
  estadoNuevo: string;
  clienteNombre: string;
}

/**
 * Unión de tipos de notificaciones
 */
export type Notification = PickingNotification | SalesNotification;

