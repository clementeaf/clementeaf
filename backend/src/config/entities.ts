/**
 * Archivo central para importar todas las entidades
 * Esto asegura que todas las entidades estén disponibles en Lambda
 */

// Analytics
export { CtasPorCobrar } from '../modules/Analytics/entities/CtasPorCobrar.entity';

// Chat
export { Conversation } from '../modules/Chat/entities/Conversation.entity';
export { Message } from '../modules/Chat/entities/Message.entity';
export { TypingIndicator } from '../modules/Chat/entities/TypingIndicator.entity';
export { WebSocketConnection } from '../modules/Chat/entities/WebSocketConnection.entity';

// Clients
export { Branch } from '../modules/Clients/entities/Branch.entity';
export { Clients } from '../modules/Clients/entities/Clients.entity';

// Notifications
export { Notification } from '../modules/Notifications/entities/Notification.entity';

// OCR
export { OCRDocument } from '../modules/OCR/entities/OCRDocument.entity';

// Products
export { StockMovement } from '../modules/Products/entities/StockMovement.entity';
export { Warehouse } from '../modules/Products/entities/Warehouse.entity';

// Quotes
export { Quote } from '../modules/Quotes/entities/Quote.entity';

// Roles
export { Permission } from '../modules/Roles/entities/Permission.entity';
export { Role } from '../modules/Roles/entities/Role.entity';
export { RolePermission } from '../modules/Roles/entities/RolePermission.entity';

// Tickets
export { Ticket } from '../modules/Tickets/entities/Ticket.entity';

// Users
export { User } from '../modules/Users/entities/User.entity';

// Array con todas las entidades para TypeORM
import { CtasPorCobrar } from '../modules/Analytics/entities/CtasPorCobrar.entity';
import { Conversation } from '../modules/Chat/entities/Conversation.entity';
import { Message } from '../modules/Chat/entities/Message.entity';
import { TypingIndicator } from '../modules/Chat/entities/TypingIndicator.entity';
import { WebSocketConnection } from '../modules/Chat/entities/WebSocketConnection.entity';
import { Branch } from '../modules/Clients/entities/Branch.entity';
import { Clients } from '../modules/Clients/entities/Clients.entity';
import { Notification } from '../modules/Notifications/entities/Notification.entity';
import { OCRDocument } from '../modules/OCR/entities/OCRDocument.entity';
import { StockMovement } from '../modules/Products/entities/StockMovement.entity';
import { Warehouse } from '../modules/Products/entities/Warehouse.entity';
import { Quote } from '../modules/Quotes/entities/Quote.entity';
import { Permission } from '../modules/Roles/entities/Permission.entity';
import { Role } from '../modules/Roles/entities/Role.entity';
import { RolePermission } from '../modules/Roles/entities/RolePermission.entity';
import { Ticket } from '../modules/Tickets/entities/Ticket.entity';
import { User } from '../modules/Users/entities/User.entity';

export const allEntities = [
  CtasPorCobrar,
  Conversation,
  Message,
  TypingIndicator,
  WebSocketConnection,
  Branch,
  Clients,
  Notification,
  OCRDocument,
  StockMovement,
  Warehouse,
  Quote,
  Permission,
  Role,
  RolePermission,
  Ticket,
  User,
];
