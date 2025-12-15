# Deuda Técnica - Admin Frontend

## Resumen Ejecutivo

Este documento identifica la deuda técnica encontrada en `admin-frontend` y propone soluciones para mejorar la calidad del código, mantenibilidad y rendimiento.

**Métricas:**
- **151 console.log/error/warn** en 44 archivos
- **26 archivos** con TODOs/FIXMEs
- **5 hooks WebSocket** con código duplicado (~90% similar)
- **3 funciones formatDate** duplicadas
- **6 archivos** con eslint-disable
- **7 useState** con valores constantes que nunca cambian

---

## 🔴 Prioridad Alta

### 1. Código Duplicado en Hooks WebSocket

**Problema:**
Los hooks `useQuotesWebSocket`, `useClientsWebSocket`, `useBranchesWebSocket`, `useStockMovementsWebSocket`, y `useTicketsWebSocket` tienen ~90% de código duplicado. Solo cambian:
- El tipo de mensaje WebSocket
- Las queries a invalidar
- Los callbacks opcionales

**Impacto:**
- Mantenimiento difícil: cambios en lógica de conexión deben replicarse en 5 lugares
- Bugs se propagan: si hay un error en un hook, probablemente existe en todos
- Tamaño del bundle: código duplicado aumenta el tamaño

**Solución:**
Crear un hook base `useWebSocketEvents` que acepte configuración genérica:

```typescript
// hooks/useWebSocketEvents.ts
interface WebSocketEventConfig {
  messageType: string;
  queryKeys: string[];
  onEvent?: (data: unknown) => void;
}

export const useWebSocketEvents = (config: WebSocketEventConfig) => {
  // Lógica compartida de conexión, reconexión, etc.
  // Procesar mensajes según config.messageType
  // Invalidar queries según config.queryKeys
};
```

**Archivos afectados:**
- `admin-frontend/src/hooks/useQuotesWebSocket.ts`
- `admin-frontend/src/hooks/useClientsWebSocket.ts`
- `admin-frontend/src/hooks/useBranchesWebSocket.ts`
- `admin-frontend/src/hooks/useStockMovementsWebSocket.ts`
- `admin-frontend/src/hooks/useTicketsWebSocket.ts`

**Esfuerzo:** Medio (2-3 horas)
**Beneficio:** Alto (reduce duplicación, facilita mantenimiento)

---

### 2. Callbacks Vacíos en Hooks WebSocket

**Problema:**
Los hooks WebSocket se están llamando con callbacks vacíos que solo tienen comentarios:

```typescript
useQuotesWebSocket({
  onQuoteCreated: () => {
    // La invalidación de queries se hace automáticamente en el hook
  },
  onQuoteUpdated: () => {
    // La invalidación de queries se hace automáticamente en el hook
  },
  onQuoteDeleted: () => {
    // La invalidación de queries se hace automáticamente en el hook
  }
});
```

**Impacto:**
- Código innecesario que confunde
- Si los callbacks no son necesarios, deberían ser opcionales y no requerirse

**Solución:**
1. Hacer los callbacks completamente opcionales en los hooks
2. Eliminar los callbacks vacíos de los componentes
3. O mejor aún: refactorizar para que los hooks no requieran callbacks si solo invalidan queries

**Archivos afectados:**
- `admin-frontend/src/pages/Quotes.tsx`
- `admin-frontend/src/pages/Clients.tsx`
- `admin-frontend/src/pages/Products/SearchProducts.tsx`
- `admin-frontend/src/pages/Clients/ClientDetails/sections/BranchesSection.tsx`
- `admin-frontend/src/pages/Support.tsx`

**Esfuerzo:** Bajo (30 minutos)
**Beneficio:** Medio (código más limpio)

---

### 3. Funciones formatDate Duplicadas

**Problema:**
Hay múltiples implementaciones de `formatDate` en diferentes archivos:

1. `admin-frontend/src/pages/Quotes.tsx` - Formatea a DD/MM/YYYY
2. `admin-frontend/src/pages/Products/HistoryColumns.tsx` - Formatea con hora
3. Probablemente más en otros archivos

Ya existe `admin-frontend/src/utils/dateUtils.ts` pero no tiene una función `formatDate` genérica.

**Impacto:**
- Inconsistencia en formato de fechas
- Mantenimiento difícil: cambios deben replicarse en múltiples lugares
- Posibles bugs si una implementación tiene errores que otras no

**Solución:**
1. Agregar funciones de formateo de fecha a `dateUtils.ts`:
   - `formatDate(dateString, format: 'short' | 'long' | 'datetime')`
   - `formatDateShort(dateString)` - DD/MM/YYYY
   - `formatDateLong(dateString)` - Con hora completa
2. Reemplazar todas las implementaciones locales con las funciones centralizadas

**Archivos afectados:**
- `admin-frontend/src/pages/Quotes.tsx`
- `admin-frontend/src/pages/Products/HistoryColumns.tsx`
- Cualquier otro archivo con `formatDate` local

**Esfuerzo:** Bajo (1 hora)
**Beneficio:** Medio (consistencia y mantenibilidad)

---

### 4. useState con Valores Constantes

**Problema:**
Hay varios `useState` con valores que nunca cambian:

```typescript
const [page] = useState(1);  // Nunca se actualiza
const limit = 50;  // Constante, no necesita estado
```

**Impacto:**
- Re-renders innecesarios si React detecta cambios
- Confusión: sugiere que el valor puede cambiar
- Memoria: estado innecesario

**Solución:**
1. Reemplazar `useState(1)` con constantes: `const page = 1`
2. Si realmente necesita ser estado (para futuras funcionalidades), documentar por qué

**Archivos afectados:**
- `admin-frontend/src/pages/Clients.tsx` - `const [page] = useState(1);`
- `admin-frontend/src/pages/Quotes.tsx` - `const [page] = useState(1);`
- `admin-frontend/src/pages/Picking/sections/WarehouseMapSection.tsx` - `const [zoom] = useState(1);`

**Esfuerzo:** Bajo (15 minutos)
**Beneficio:** Bajo-Medio (código más claro)

---

## 🟡 Prioridad Media

### 5. Exceso de console.log

**Problema:**
Hay **151 console.log/error/warn** en **44 archivos**. Algunos son necesarios para debugging, pero muchos deberían:
- Eliminarse en producción
- Usar un sistema de logging apropiado
- Tener niveles de log (debug, info, warn, error)

**Impacto:**
- Performance: console.log puede ser lento
- Seguridad: puede exponer información sensible
- Ruido en consola: dificulta debugging real

**Solución:**
1. Crear un sistema de logging centralizado:
   ```typescript
   // utils/logger.ts
   export const logger = {
     debug: (message: string, data?: unknown) => {
       if (import.meta.env.DEV) console.log(`[DEBUG] ${message}`, data);
     },
     info: (message: string, data?: unknown) => {
       if (import.meta.env.DEV) console.info(`[INFO] ${message}`, data);
     },
     warn: (message: string, data?: unknown) => {
       console.warn(`[WARN] ${message}`, data);
     },
     error: (message: string, error?: unknown) => {
       console.error(`[ERROR] ${message}`, error);
       // En producción, enviar a servicio de logging
     }
   };
   ```
2. Reemplazar console.log/error/warn con logger apropiado
3. Eliminar logs de debugging innecesarios

**Archivos más afectados:**
- `admin-frontend/src/hooks/usePickingOrdersWebSocket.ts` - 15 logs
- `admin-frontend/src/hooks/useHomeOrdersWebSocket.ts` - 16 logs
- `admin-frontend/src/hooks/useWebSocket.ts` - 18 logs
- `admin-frontend/src/pages/Chat.tsx` - 8 logs

**Esfuerzo:** Medio (2-3 horas)
**Beneficio:** Medio (mejor debugging, menos ruido)

---

### 6. TODOs y FIXMEs Pendientes

**Problema:**
Hay **26 archivos** con TODOs/FIXMEs que deberían revisarse y resolverse o documentarse.

**Impacto:**
- Funcionalidad incompleta
- Bugs potenciales
- Confusión sobre intención del código

**Solución:**
1. Revisar cada TODO/FIXME
2. Resolver los que son críticos
3. Documentar los que son decisiones de diseño
4. Crear issues para los que requieren más trabajo

**Archivos con TODOs:**
- `admin-frontend/src/pages/Products/SearchProducts.tsx`
- `admin-frontend/src/pages/Quotes/CreateQuote.tsx`
- `admin-frontend/src/hooks/useNotifications.ts`
- `admin-frontend/src/pages/Clients/ClientDetails/ClientDetails.tsx`
- Y 22 más...

**Esfuerzo:** Variable (depende de cada TODO)
**Beneficio:** Variable (depende de cada TODO)

---

### 7. eslint-disable Sin Justificación

**Problema:**
Hay **6 archivos** con `eslint-disable-next-line` que deberían revisarse:

1. `usePickingOrdersWebSocket.ts` - Línea 192
2. `useHomeOrdersWebSocket.ts` - Línea 203
3. `useWebSocket.ts` - Línea 192
4. `QuoteClientForm.tsx` - Línea 84
5. `QuoteConditionsForm.tsx` - Líneas 91, 165

**Impacto:**
- Puede ocultar bugs reales
- Dependencias faltantes en useEffect pueden causar problemas

**Solución:**
1. Revisar cada `eslint-disable`
2. Si es necesario, agregar las dependencias faltantes
3. Si no es posible, documentar por qué se deshabilita
4. Considerar refactorizar para evitar el disable

**Esfuerzo:** Bajo-Medio (1-2 horas)
**Beneficio:** Medio (mejor calidad de código)

---

### 8. Patrón de Mapeo de Datos Duplicado

**Problema:**
En `Quotes.tsx` y `Clients.tsx` hay patrones similares de mapeo de datos:

```typescript
// Quotes.tsx
const mappedQuotes: QuoteRow[] = quotesData?.data.map((quote) => ({
  id: quote.id.toString(),
  clienteNombre: quote.clienteNombre || '-',
  // ...
})) || [];

// Clients.tsx
const mappedClients: ClientRow[] = clientsData?.data.map((client) => ({
  id: client.id.toString(),
  fantasyName: client.nombreCliente || client.razonSocial || '',
  // ...
})) || [];
```

**Impacto:**
- Código repetitivo
- Si cambia el patrón, debe actualizarse en múltiples lugares

**Solución:**
1. Crear funciones de mapeo reutilizables si el patrón es común
2. O mantener como está si cada mapeo es específico (menos probable)

**Esfuerzo:** Bajo (30 minutos)
**Beneficio:** Bajo (código más DRY)

---

## 🟢 Prioridad Baja

### 9. Componente Invoices sin Persistencia

**Problema:**
`admin-frontend/src/pages/Invoices.tsx` usa `useState` local para almacenar facturas. Al recargar la página, se pierden todas las facturas procesadas.

**Impacto:**
- Pérdida de datos al recargar
- No hay historial de facturas procesadas

**Solución:**
1. Agregar persistencia en sessionStorage o IndexedDB
2. O integrar con backend para guardar facturas procesadas

**Esfuerzo:** Medio (2-3 horas)
**Beneficio:** Bajo-Medio (mejor UX)

---

### 10. TypeScript: React.FC en Invoices

**Problema:**
`admin-frontend/src/pages/Invoices.tsx` usa `React.FC` que está desactualizado:

```typescript
export const Invoices: React.FC = () => {
```

**Impacto:**
- Patrón desactualizado
- `React.FC` tiene problemas conocidos (no infiere children correctamente)

**Solución:**
Cambiar a:
```typescript
export const Invoices = (): React.ReactElement => {
```

**Esfuerzo:** Muy Bajo (5 minutos)
**Beneficio:** Bajo (mejores prácticas)

---

### 11. Función formatTime Duplicada

**Problema:**
En `MetricsSection.tsx` hay una función `formatTime` que podría ser reutilizable:

```typescript
const formatTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
};
```

**Solución:**
Mover a `utils/dateUtils.ts` o crear `utils/timeUtils.ts`

**Esfuerzo:** Bajo (15 minutos)
**Beneficio:** Bajo (reutilización)

---

## 📊 Resumen de Prioridades

| Prioridad | Cantidad | Esfuerzo Total | Impacto |
|-----------|----------|----------------|---------|
| 🔴 Alta | 4 items | ~4-5 horas | Alto |
| 🟡 Media | 4 items | ~5-7 horas | Medio |
| 🟢 Baja | 3 items | ~3-4 horas | Bajo |
| **Total** | **11 items** | **~12-16 horas** | - |

---

## 🎯 Plan de Acción Recomendado

### Fase 1: Refactorización Crítica (Prioridad Alta)
1. ✅ Crear hook base `useWebSocketEvents` para eliminar duplicación
2. ✅ Eliminar callbacks vacíos de hooks WebSocket
3. ✅ Centralizar funciones `formatDate` en `dateUtils.ts`
4. ✅ Reemplazar `useState` constantes con constantes simples

### Fase 2: Mejoras de Calidad (Prioridad Media)
5. ✅ Implementar sistema de logging centralizado
6. ✅ Revisar y resolver TODOs críticos
7. ✅ Revisar y justificar eslint-disable
8. ✅ Evaluar patrones de mapeo duplicados

### Fase 3: Optimizaciones (Prioridad Baja)
9. ✅ Agregar persistencia a Invoices (si es necesario)
10. ✅ Actualizar React.FC a patrón moderno
11. ✅ Mover funciones de utilidad duplicadas

---

## 🔍 Archivos con Mayor Deuda Técnica

1. **Hooks WebSocket** (5 archivos) - Código duplicado masivo
2. **Quotes.tsx** - formatDate duplicado, useState constante, callbacks vacíos
3. **Clients.tsx** - useState constante, callbacks vacíos, patrón de mapeo
4. **Invoices.tsx** - Sin persistencia, React.FC desactualizado
5. **HistoryColumns.tsx** - formatDate duplicado

---

## 📝 Notas Adicionales

- **No se encontraron usos de `any`**: ✅ Buen trabajo en tipado estricto
- **Estructura de carpetas**: ✅ Bien organizada
- **Separación de concerns**: ✅ Buena separación entre hooks, servicios, componentes
- **Documentación JSDoc**: ✅ Presente en la mayoría de funciones

---

## 🚀 Beneficios Esperados

Después de resolver esta deuda técnica:
- **Reducción de ~40% en código duplicado** (hooks WebSocket)
- **Mejor mantenibilidad** (funciones centralizadas)
- **Código más limpio** (menos console.log, menos callbacks vacíos)
- **Mejor debugging** (sistema de logging estructurado)
- **Consistencia** (formateo de fechas unificado)

