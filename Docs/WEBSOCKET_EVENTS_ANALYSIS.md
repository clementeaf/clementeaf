# Análisis: Eventos WebSocket Necesarios en Admin Frontend

## Estado Actual

### ✅ Módulos con WebSocket Implementado

1. **Chat** (`useWebSocket`)
   - Mensajes en tiempo real
   - Indicadores de escritura
   - Estado de conexión

2. **Picking Orders** (`usePickingOrdersWebSocket`)
   - Nueva orden de picking (`new_picking_order`)
   - Cambio de estado (`quote_status_changed`)

3. **Home Orders** (`useHomeOrdersWebSocket`)
   - Nueva orden de picking (`new_picking_order`)
   - Cambio de estado (`quote_status_changed`)

4. **Notifications** (`NotificationsProvider`)
   - Escucha eventos de picking orders para crear notificaciones

## 🔴 Módulos que Necesitan Eventos WebSocket

### Prioridad Alta

#### 1. **Quotes (Lista de Órdenes de Compra)**
**Ubicación:** `admin-frontend/src/pages/Quotes.tsx`

**Eventos necesarios:**
- `quote.created` - Cuando se crea una nueva quote
- `quote.updated` - Cuando se actualiza una quote (excepto estado, que ya está)
- `quote.deleted` - Cuando se elimina una quote

**Beneficio:** Múltiples usuarios pueden estar viendo la lista de quotes simultáneamente. Sin eventos, necesitan refrescar manualmente para ver nuevas quotes creadas por otros usuarios.

**Implementación sugerida:**
```typescript
// Hook: useQuotesWebSocket
interface QuotesWebSocketMessage {
  action: 'quote_created' | 'quote_updated' | 'quote_deleted';
  quote?: Quote;
  quoteId?: number;
}
```

---

#### 2. **Products - Movimientos de Stock**
**Ubicación:** `admin-frontend/src/pages/Products/SearchProducts.tsx` y `CreateMovementModal.tsx`

**Eventos necesarios:**
- `stock_movement.created` - Cuando se crea un movimiento de stock

**Beneficio:** 
- Múltiples usuarios pueden estar viendo el historial del mismo producto
- El stock actual se actualiza en tiempo real
- Evita conflictos cuando dos usuarios intentan hacer movimientos simultáneos

**Implementación sugerida:**
```typescript
// Hook: useStockMovementsWebSocket
interface StockMovementsWebSocketMessage {
  action: 'stock_movement_created';
  movement: StockMovement;
  productId: string;
  warehouseId: number;
  newStock: number;
}
```

---

#### 3. **Clients (Lista de Clientes)**
**Ubicación:** `admin-frontend/src/pages/Clients.tsx`

**Eventos necesarios:**
- `client.created` - Cuando se crea un nuevo cliente
- `client.updated` - Cuando se actualiza un cliente
- `client.deleted` - Cuando se elimina un cliente

**Beneficio:** Múltiples usuarios pueden estar viendo la lista de clientes. Sin eventos, necesitan refrescar para ver cambios.

**Implementación sugerida:**
```typescript
// Hook: useClientsWebSocket
interface ClientsWebSocketMessage {
  action: 'client_created' | 'client_updated' | 'client_deleted';
  client?: Client;
  clientId?: number;
}
```

---

### Prioridad Media

#### 4. **Branches (Sucursales de Clientes)**
**Ubicación:** `admin-frontend/src/pages/Clients/ClientDetails/sections/BranchesSection.tsx`

**Eventos necesarios:**
- `branch.created` - Cuando se crea una sucursal
- `branch.updated` - Cuando se actualiza una sucursal
- `branch.deleted` - Cuando se elimina una sucursal

**Beneficio:** Si múltiples usuarios están viendo los detalles del mismo cliente, verán cambios en sucursales en tiempo real.

**Implementación sugerida:**
```typescript
// Hook: useBranchesWebSocket
interface BranchesWebSocketMessage {
  action: 'branch_created' | 'branch_updated' | 'branch_deleted';
  branch?: Branch;
  branchId?: number;
  clientId: number;
}
```

---

#### 5. **Support/Tickets**
**Ubicación:** `admin-frontend/src/pages/Support.tsx`

**Eventos necesarios:**
- `ticket.created` - Cuando se crea un ticket
- `ticket.updated` - Cuando se actualiza un ticket (estado, asignación, etc.)
- `ticket.status_changed` - Cuando cambia el estado de un ticket

**Beneficio:** 
- Múltiples usuarios pueden estar viendo el Kanban de tickets
- Los tickets se mueven entre columnas en tiempo real
- Notificaciones cuando se asigna un ticket

**Implementación sugerida:**
```typescript
// Hook: useTicketsWebSocket
interface TicketsWebSocketMessage {
  action: 'ticket_created' | 'ticket_updated' | 'ticket_status_changed';
  ticket?: Ticket;
  ticketId?: number;
  estadoAnterior?: string;
  estadoNuevo?: string;
}
```

---

### Prioridad Baja

#### 6. **Roles (Gestión de Roles)**
**Ubicación:** `admin-frontend/src/pages/Roles/RolesManagement.tsx`

**Eventos necesarios:**
- `role.created` - Cuando se crea un rol
- `role.updated` - Cuando se actualiza un rol
- `role.deleted` - Cuando se elimina un rol

**Beneficio:** Si múltiples administradores están gestionando roles simultáneamente, verán cambios en tiempo real.

**Nota:** Baja prioridad porque típicamente solo un administrador gestiona roles a la vez.

---

#### 7. **Users (Gestión de Usuarios)**
**Ubicación:** `admin-frontend/src/pages/Roles/UsersManagement.tsx`

**Eventos necesarios:**
- `user.role_updated` - Cuando se actualiza el rol de un usuario

**Beneficio:** Si múltiples administradores están asignando roles, verán cambios en tiempo real.

**Nota:** Baja prioridad porque típicamente solo un administrador gestiona usuarios a la vez.

---

## 📋 Plan de Implementación Recomendado

### Fase 1: Prioridad Alta (Impacto Inmediato)
1. ✅ **Picking Orders** - Ya implementado
2. ✅ **Home Orders** - Ya implementado
3. 🔴 **Quotes (Lista)** - Implementar eventos para creación/actualización/eliminación
4. 🔴 **Products - Movimientos de Stock** - Implementar eventos para nuevos movimientos

### Fase 2: Prioridad Media (Mejora de UX)
5. 🔴 **Clients (Lista)** - Implementar eventos para CRUD
6. 🔴 **Branches** - Implementar eventos para CRUD
7. 🔴 **Support/Tickets** - Implementar eventos para CRUD y cambios de estado

### Fase 3: Prioridad Baja (Nice to Have)
8. 🔴 **Roles** - Implementar eventos para CRUD
9. 🔴 **Users** - Implementar eventos para actualización de roles

---

## 🔧 Consideraciones Técnicas

### Backend - Eventos Necesarios

Para implementar estos eventos, el backend necesitaría:

1. **Eventos de Quotes:**
   - `quote.created` - ✅ Ya existe
   - `quote.updated` - ❌ Falta (solo existe `quote.status_changed`)
   - `quote.deleted` - ❌ Falta

2. **Eventos de Stock Movements:**
   - `stock_movement.created` - ❌ Falta

3. **Eventos de Clients:**
   - `client.created` - ❌ Falta
   - `client.updated` - ❌ Falta
   - `client.deleted` - ❌ Falta

4. **Eventos de Branches:**
   - `branch.created` - ❌ Falta
   - `branch.updated` - ❌ Falta
   - `branch.deleted` - ❌ Falta

5. **Eventos de Tickets:**
   - `ticket.created` - ❌ Falta
   - `ticket.updated` - ❌ Falta
   - `ticket.status_changed` - ❌ Falta

### Patrón de Implementación

Seguir el mismo patrón usado en Quotes:

1. **Backend:**
   - Crear eventos de dominio (ej: `ClientCreatedEvent.ts`)
   - Publicar eventos en handlers (usando `EventPublisher`)
   - Crear handlers de eventos (ej: `clientCreatedHandler.ts`)
   - Configurar EventBridge en `serverless.yml`

2. **Frontend:**
   - Crear hook WebSocket (ej: `useClientsWebSocket.ts`)
   - Integrar hook en componente de lista
   - Actualizar estado local cuando se recibe evento

---

## 📊 Resumen de Impacto

| Módulo | Prioridad | Impacto | Complejidad | Usuarios Simultáneos |
|--------|-----------|---------|------------|---------------------|
| Quotes (Lista) | Alta | Alto | Media | Múltiples |
| Stock Movements | Alta | Alto | Media | Múltiples |
| Clients (Lista) | Media | Medio | Media | Múltiples |
| Branches | Media | Medio | Baja | Pocos |
| Support/Tickets | Media | Alto | Media | Múltiples |
| Roles | Baja | Bajo | Baja | Uno |
| Users | Baja | Bajo | Baja | Uno |

---

## 🎯 Recomendación Final

**Implementar primero:**
1. **Quotes (Lista)** - Mayor impacto, múltiples usuarios ven la lista
2. **Stock Movements** - Crítico para evitar conflictos de stock

**Luego:**
3. **Clients (Lista)** - Mejora UX significativa
4. **Support/Tickets** - Importante para trabajo colaborativo

**Opcional:**
5. **Branches** - Solo si hay necesidad real de múltiples usuarios editando sucursales
6. **Roles/Users** - Solo si hay múltiples administradores gestionando simultáneamente

