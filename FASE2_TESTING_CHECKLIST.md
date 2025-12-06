# Fase 2 - Checklist de Pruebas

## ⚠️ Puntos Críticos a Verificar ANTES de Continuar

### 1. 🔴 CRÍTICO: Identificador del Producto

**Problema Potencial:**
- El endpoint espera `productId` como string
- Los productos de la API externa pueden tener `id` numérico o `codigo` string
- Necesitamos verificar qué identificador usar

**Verificar:**
```typescript
// En SearchProducts.tsx línea 36
productId: product.id || product.codigo
```

**Acción:**
- [ ] Verificar qué campo tiene el producto: `id` o `codigo`
- [ ] Asegurar que el backend acepte ambos formatos
- [ ] Probar con productos reales de la API

### 2. 🔴 CRÍTICO: Relación ProductId vs ProductCode

**Problema:**
- Los movimientos se guardan con `productId` (string)
- Los productos de la API externa pueden tener diferentes formatos de ID
- Necesitamos consistencia entre búsqueda y historial

**Verificar:**
- [ ] ¿El `productId` en movimientos debe ser el mismo que se usa en búsqueda?
- [ ] ¿Debemos usar `codigo` (código local) o `itemId` (ID de API externa)?
- [ ] Probar crear un movimiento y luego buscarlo en historial

### 3. 🟡 IMPORTANTE: Stock Acumulativo

**Verificar:**
- [ ] El cálculo de stock acumulativo es correcto
- [ ] Los movimientos se ordenan correctamente (más recientes primero)
- [ ] El stock actual coincide con el último movimiento

**Prueba:**
1. Crear movimiento de entrada: 100 unidades
2. Crear movimiento de salida: 30 unidades
3. Verificar que stock acumulativo sea 70
4. Verificar que stock actual sea 70

### 4. 🟡 IMPORTANTE: Filtros

**Verificar:**
- [ ] Filtro por tipo de movimiento funciona
- [ ] Filtro por fecha funciona (desde/hasta)
- [ ] Filtro por bodega funciona
- [ ] Filtros combinados funcionan

**Pruebas:**
- [ ] Filtrar solo "Entradas"
- [ ] Filtrar por rango de fechas
- [ ] Filtrar por bodega específica
- [ ] Combinar todos los filtros

### 5. 🟡 IMPORTANTE: Endpoint de Crear Movimiento

**Verificar:**
- [ ] El endpoint POST `/products/movements` funciona
- [ ] Calcula stock anterior correctamente
- [ ] Calcula stock nuevo correctamente
- [ ] Valida datos de entrada
- [ ] Maneja errores correctamente

**Pruebas:**
- [ ] Crear entrada (debe sumar al stock)
- [ ] Crear salida (debe restar del stock, no permitir negativo)
- [ ] Crear ajuste (debe sumar al stock)
- [ ] Intentar crear con datos inválidos (debe fallar)

### 6. 🟢 NICE TO HAVE: UI/UX

**Verificar:**
- [ ] La tabla se carga correctamente
- [ ] Los colores de tipo de movimiento se ven bien
- [ ] Las fechas se formatean correctamente
- [ ] Los números se formatean con separadores
- [ ] El stock actual se muestra correctamente
- [ ] Los filtros se aplican correctamente

## 📋 Checklist Completo de Pruebas

### Backend

#### Compilación
- [ ] `npm run build` sin errores
- [ ] Todos los handlers compilados
- [ ] Todas las entidades compiladas

#### Endpoints
- [ ] GET `/products/{productId}/history` responde
- [ ] GET `/products/{productId}/history?warehouseId=1` filtra por bodega
- [ ] GET `/products/{productId}/history?type=entrada` filtra por tipo
- [ ] GET `/products/{productId}/history?startDate=2024-01-01` filtra por fecha
- [ ] POST `/products/movements` crea movimiento
- [ ] POST `/products/movements` calcula stock correctamente
- [ ] POST `/products/movements` valida datos

#### Base de Datos
- [ ] Tabla `stock_movements` existe
- [ ] Índices creados correctamente
- [ ] Relación con `warehouses` funciona

### Frontend

#### Componentes
- [ ] `ProductHistoryTab` se renderiza
- [ ] `HistoryColumns` muestra todas las columnas
- [ ] Tabla se llena con datos
- [ ] Filtros funcionan
- [ ] Stock actual se muestra

#### Integración
- [ ] Al seleccionar producto, carga historial
- [ ] Al cambiar filtros, actualiza historial
- [ ] Manejo de errores funciona
- [ ] Estados de carga funcionan

#### Servicios
- [ ] `stockMovementsService.getProductHistory()` funciona
- [ ] `stockMovementsService.createMovement()` funciona
- [ ] Tipos TypeScript correctos

## 🚨 Problemas Conocidos a Resolver

### 1. Identificador de Producto
**Estado:** ⚠️ PENDIENTE
**Prioridad:** ALTA
**Acción:** Verificar qué ID usar (id numérico vs codigo string)

### 2. UI para Crear Movimientos
**Estado:** ⚠️ PENDIENTE
**Prioridad:** MEDIA
**Acción:** Crear formularios para entrada/salida/ajuste

### 3. Validación de Stock Negativo
**Estado:** ✅ IMPLEMENTADO
**Verificar:** Que realmente funcione en producción

## 🧪 Pruebas Recomendadas ANTES de Fase 3

1. **Prueba End-to-End:**
   - Buscar producto
   - Seleccionar producto
   - Ver historial (debe estar vacío inicialmente)
   - Crear movimiento de entrada (desde Postman/curl)
   - Ver historial (debe mostrar el movimiento)
   - Verificar stock actual

2. **Prueba de Filtros:**
   - Crear varios movimientos de diferentes tipos
   - Probar cada filtro individualmente
   - Probar filtros combinados

3. **Prueba de Cálculo:**
   - Crear secuencia de movimientos
   - Verificar que stock acumulativo sea correcto
   - Verificar que stock actual sea correcto

## ✅ Criterios de Aceptación para Continuar

Antes de pasar a Fase 3, se debe verificar:

- [ ] Backend compila sin errores
- [ ] Endpoints responden correctamente
- [ ] Historial se muestra en frontend
- [ ] Filtros funcionan
- [ ] Stock acumulativo se calcula correctamente
- [ ] Se puede crear movimiento (al menos desde Postman)
- [ ] Identificador de producto está resuelto

## 🎯 Recomendación

**ANTES de continuar con Fase 3, se recomienda:**

1. ✅ Probar endpoints con Postman/curl
2. ✅ Verificar identificador de producto
3. ✅ Crear al menos 2-3 movimientos de prueba
4. ✅ Verificar que el historial se muestre correctamente
5. ⚠️ Considerar crear UI básica para crear movimientos (opcional)

**Si todo funciona, se puede continuar con Fase 3.**

