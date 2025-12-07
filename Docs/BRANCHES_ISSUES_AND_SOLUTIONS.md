# Problemas Detectados en Implementación de Branches

## 🔴 Problemas Críticos

### 1. Inconsistencia en Endpoints

**Backend actual (`serverless.yml`):**
- ✅ `GET /clients/{clientId}/branches` - Correcto
- ❌ `GET /branches/{id}` - No incluye `clientId`
- ❌ `POST /branches` - No incluye `clientId`
- ❌ `PUT /branches/{id}` - No incluye `clientId`
- ❌ `DELETE /branches/{id}` - No incluye `clientId`

**Frontend esperado (`endpoints.ts`):**
- ✅ `clients.getBranches: '{clientId}/branches'` - Correcto
- ❌ `branches.getById: '{id}'` - No coincide con backend
- ❌ `branches.create: ''` - No coincide con backend
- ❌ `branches.update: '{id}'` - No coincide con backend
- ❌ `branches.delete: '{id}'` - No coincide con backend

### 2. Problema de Seguridad

Los handlers actuales **NO validan** que la sucursal pertenezca al cliente:
- `getBranchById` permite acceder a cualquier sucursal por ID
- `updateBranch` permite modificar sucursales de otros clientes
- `deleteBranch` permite eliminar sucursales de otros clientes

**Ejemplo de vulnerabilidad:**
```typescript
// Usuario puede acceder a sucursal de otro cliente
GET /branches/123  // No valida que pertenezca al cliente del usuario
```

### 3. Servicio Frontend Incorrecto

`branchesService.ts` usa endpoints que no existen:
- `endpoints.branches.getById` → No existe en backend
- `endpoints.branches.create` → No existe en backend
- `endpoints.branches.update` → No existe en backend
- `endpoints.branches.delete` → No existe en backend

---

## ✅ Soluciones Propuestas

### Opción A: Solución RESTful Completa (RECOMENDADA)

**Ventajas:**
- ✅ Más RESTful y semánticamente correcto
- ✅ Mejor seguridad (validación automática)
- ✅ Consistente con el patrón existente
- ✅ Más fácil de mantener

**Cambios requeridos:**

1. **Backend - Actualizar `serverless.yml`:**
```yaml
getBranchById:
  path: clients/{clientId}/branches/{id}  # Cambiar
createBranch:
  path: clients/{clientId}/branches      # Cambiar
updateBranch:
  path: clients/{clientId}/branches/{id}  # Cambiar
deleteBranch:
  path: clients/{clientId}/branches/{id}  # Cambiar
```

2. **Backend - Actualizar handlers para validar `clientId`:**
```typescript
// getBranchById.ts
const clientId = parseInt(event.pathParameters?.clientId!, 10);
const branchId = parseInt(event.pathParameters?.id!, 10);
const branch = await branchService.getBranchById(branchId);

// Validar que pertenezca al cliente
if (branch.clientId !== clientId) {
  return errorResponse(403, 'Sucursal no pertenece al cliente especificado');
}
```

3. **Backend - Actualizar `BranchService`:**
```typescript
async getBranchById(clientId: number, branchId: number): Promise<Branch> {
  const branch = await this.branchRepository.findOne({
    where: { id: branchId, clientId },  // Validar ambos
    relations: ['client']
  });
  // ...
}
```

4. **Frontend - Actualizar `endpoints.ts`:**
```typescript
clients: {
  // ...
  getBranchById: '{clientId}/branches/{id}',
  createBranch: '{clientId}/branches',
  updateBranch: '{clientId}/branches/{id}',
  deleteBranch: '{clientId}/branches/{id}'
}
// Eliminar sección 'branches'
```

5. **Frontend - Actualizar `branchesService.ts`:**
```typescript
async getBranchById(clientId: number, branchId: number): Promise<Branch> {
  const url = endpoints.clients.getBranchById
    .replace('{clientId}', clientId.toString())
    .replace('{id}', branchId.toString());
  // ...
}
```

**Tiempo estimado:** 30-45 minutos

---

### Opción B: Solución Rápida (Mantener Backend Actual)

**Ventajas:**
- ✅ Cambios mínimos
- ✅ Más rápido de implementar

**Desventajas:**
- ❌ Menos RESTful
- ❌ Requiere validación manual de seguridad
- ❌ Inconsistente con patrón existente

**Cambios requeridos:**

1. **Frontend - Actualizar `endpoints.ts`:**
```typescript
// Eliminar sección 'branches', usar directamente:
branches: {
  getById: 'branches/{id}',
  create: 'branches',
  update: 'branches/{id}',
  delete: 'branches/{id}'
}
```

2. **Backend - Agregar validación de seguridad (RECOMENDADO):**
```typescript
// En cada handler, validar que el branch pertenezca al cliente del usuario
// Requiere obtener clientId del contexto del usuario autenticado
```

**Tiempo estimado:** 15-20 minutos

---

## 🎯 Recomendación Final

**Implementar Opción A** porque:
1. Mejor arquitectura REST
2. Seguridad integrada
3. Consistencia con el resto del sistema
4. Más fácil de mantener a largo plazo

---

## ⚠️ Impacto en Sistema Existente

**Ningún impacto negativo:**
- ✅ No hay código existente usando estos endpoints (son nuevos)
- ✅ No hay datos en producción (tabla `branches` aún no existe)
- ✅ Cambios son solo en estructura de rutas, no en lógica de negocio

**Acción requerida:**
- Ejecutar migración de base de datos antes de usar en producción
- Ver `BRANCHES_IMPLEMENTATION.md` para SQL de migración

