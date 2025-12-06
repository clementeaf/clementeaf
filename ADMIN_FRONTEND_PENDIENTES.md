# Admin Frontend - Trabajos Pendientes

## 📋 Resumen Ejecutivo

Basado en el análisis del código y documentación, estas son las áreas pendientes de trabajo en `admin-frontend`:

---

## 🔴 ALTA PRIORIDAD - Funcionalidades Core Pendientes

### 1. Gestión de Sucursales (Branches)
**Estado:** ⚠️ PENDIENTE  
**Archivos afectados:**
- `admin-frontend/src/pages/Clients/ClientDetails/sections/BranchesSection.tsx` (línea 17: TODO)
- `admin-frontend/src/pages/Clients/ClientDetails/ClientDetails.tsx` (línea 51: TODO)

**Trabajo requerido:**
- [ ] Crear endpoint backend para CRUD de sucursales
- [ ] Implementar servicio frontend `branchesService.ts`
- [ ] Crear modal/formulario para añadir/editar sucursales
- [ ] Integrar con sección de sucursales en ClientDetails
- [ ] Agregar validaciones y manejo de errores

**Impacto:** Alto - Funcionalidad visible pero no implementada

---

### 2. Guardar Borrador de Cotizaciones
**Estado:** ⚠️ PENDIENTE  
**Archivos afectados:**
- `admin-frontend/src/pages/Quotes/CreateQuote.tsx` (línea 294: TODO)

**Trabajo requerido:**
- [ ] Crear endpoint backend para guardar borradores
- [ ] Implementar estado de "borrador" en entidad Quote
- [ ] Agregar botón "Guardar borrador" funcional
- [ ] Implementar carga de borradores al editar
- [ ] Agregar indicador visual de borrador vs finalizado

**Impacto:** Medio - Mejora UX significativa

---

### 3. Importación desde Excel (Productos en Cotizaciones)
**Estado:** ⚠️ PENDIENTE  
**Archivos afectados:**
- `admin-frontend/src/pages/Quotes/CreateQuote/QuoteProductsForm.tsx` (línea 211: TODO)

**Trabajo requerido:**
- [ ] Integrar librería para leer Excel (ej: `xlsx` o `exceljs`)
- [ ] Crear parser para formato de productos
- [ ] Implementar validación de datos importados
- [ ] Agregar UI para seleccionar archivo y mostrar preview
- [ ] Manejar errores de formato y datos inválidos

**Impacto:** Medio - Ahorra tiempo en cotizaciones grandes

---

### 4. Verificación de RUT con API SII
**Estado:** ⚠️ PENDIENTE (actualmente simulado)  
**Archivos afectados:**
- `admin-frontend/src/pages/Clients/CreateClient/VerifyRutModal.tsx` (línea 111: TODO)

**Trabajo requerido:**
- [ ] Integrar con API del SII (Servicio de Impuestos Internos)
- [ ] Implementar servicio backend para verificación de RUT
- [ ] Reemplazar lógica simulada con llamada real
- [ ] Manejar errores de API y timeouts
- [ ] Agregar caché de verificaciones para evitar llamadas repetidas

**Impacto:** Alto - Validación crítica para clientes

---

## 🟡 MEDIA PRIORIDAD - Mejoras de UX/UI

### 5. Transferencias entre Bodegas
**Estado:** ⚠️ FALTA  
**Prioridad:** Media

**Trabajo requerido:**
- [ ] Crear modal para transferencias (origen → destino)
- [ ] Implementar validación de stock en origen
- [ ] Crear 2 movimientos automáticos (salida + entrada)
- [ ] Agregar a la UI de búsqueda de productos
- [ ] Mostrar historial de transferencias

**Archivos a crear/modificar:**
- `admin-frontend/src/pages/Products/TransferModal.tsx` (nuevo)
- `admin-frontend/src/pages/Products/SearchProducts.tsx` (modificar)
- `admin-frontend/src/services/stockMovementsService.ts` (agregar método)

---

### 6. Exportar Datos (Historial y Búsqueda)
**Estado:** ⚠️ FALTA  
**Prioridad:** Media

**Trabajo requerido:**
- [ ] Integrar librería para generar Excel/CSV (ej: `xlsx`)
- [ ] Agregar botón "Exportar" en historial de movimientos
- [ ] Agregar botón "Exportar" en búsqueda de productos
- [ ] Incluir filtros aplicados en el export
- [ ] Formatear datos para Excel (fechas, números, etc.)

**Archivos a crear/modificar:**
- `admin-frontend/src/utils/exportUtils.ts` (nuevo)
- `admin-frontend/src/pages/Products/SearchProducts.tsx` (modificar)
- `admin-frontend/src/pages/Products/HistoryColumns.tsx` (agregar botón)

---

### 7. Confirmaciones antes de Acciones Críticas
**Estado:** ⚠️ FALTA  
**Prioridad:** Media

**Trabajo requerido:**
- [ ] Crear componente `ConfirmDialog` reutilizable
- [ ] Agregar confirmación antes de crear movimiento
- [ ] Agregar confirmación antes de eliminar productos de cotización
- [ ] Mostrar vista previa del cambio (stock anterior → nuevo)
- [ ] Agregar opción "No volver a preguntar"

**Archivos a crear/modificar:**
- `admin-frontend/src/components/commons/ConfirmDialog.tsx` (nuevo)
- `admin-frontend/src/pages/Products/CreateMovementModal.tsx` (modificar)
- `admin-frontend/src/pages/Quotes/CreateQuote/QuoteProductsForm.tsx` (modificar)

---

### 8. Notificaciones Toast Mejoradas
**Estado:** ⚠️ PARCIAL (react-toastify ya está instalado)  
**Prioridad:** Media

**Trabajo requerido:**
- [ ] Revisar que todas las acciones muestren notificaciones
- [ ] Agregar notificaciones de éxito/error consistentes
- [ ] Implementar notificaciones de stock bajo
- [ ] Agregar notificaciones de movimientos importantes
- [ ] Configurar posición y duración estándar

**Archivos a modificar:**
- Revisar todos los componentes que hacen mutaciones
- `admin-frontend/src/main.tsx` (configurar ToastContainer)

---

### 9. Paginación Real en Historial
**Estado:** ⚠️ PARCIAL (backend soporta paginación, frontend no)  
**Prioridad:** Media

**Trabajo requerido:**
- [ ] Implementar paginación en `ProductHistoryTab`
- [ ] Agregar controles de página (anterior/siguiente)
- [ ] Mostrar información de página actual/total
- [ ] Implementar infinite scroll como alternativa
- [ ] Optimizar carga de datos

**Archivos a modificar:**
- `admin-frontend/src/pages/Products/SearchProducts.tsx` (ProductHistoryTab)
- `admin-frontend/src/services/stockMovementsService.ts` (usar offset/limit)

---

## 🟢 BAJA PRIORIDAD - Optimizaciones y Mejoras

### 10. Optimistic Updates
**Estado:** ⚠️ FALTA  
**Prioridad:** Baja

**Trabajo requerido:**
- [ ] Implementar optimistic updates en creación de movimientos
- [ ] Actualizar UI inmediatamente antes de respuesta del servidor
- [ ] Revertir cambios si falla la petición
- [ ] Aplicar a otras mutaciones críticas

**Archivos a modificar:**
- `admin-frontend/src/pages/Products/CreateMovementModal.tsx`
- Usar `onMutate` y `onError` de React Query

---

### 11. Búsqueda Avanzada de Productos
**Estado:** ⚠️ FALTA  
**Prioridad:** Baja

**Trabajo requerido:**
- [ ] Agregar filtros por categoría, marca, precio
- [ ] Implementar búsqueda por múltiples criterios
- [ ] Agregar guardado de búsquedas frecuentes
- [ ] Mejorar UI de filtros

**Archivos a modificar:**
- `admin-frontend/src/pages/Products/SearchProducts.tsx`
- `admin-frontend/src/components/commons/FiltersPanel.tsx`

---

### 12. Atajos de Teclado
**Estado:** ⚠️ FALTA  
**Prioridad:** Baja

**Trabajo requerido:**
- [ ] Implementar Enter para crear movimiento
- [ ] Implementar Esc para cerrar modales
- [ ] Implementar Ctrl+F para buscar
- [ ] Implementar Ctrl+N para nuevo movimiento
- [ ] Mostrar ayuda de atajos (Ctrl+?)

**Archivos a crear/modificar:**
- `admin-frontend/src/hooks/useKeyboardShortcuts.ts` (nuevo)
- Integrar en componentes relevantes

---

### 13. Vista Previa de Cambios de Stock
**Estado:** ⚠️ FALTA  
**Prioridad:** Baja

**Trabajo requerido:**
- [ ] Mostrar stock resultante antes de crear movimiento
- [ ] Comparar stock anterior vs nuevo visualmente
- [ ] Validar impacto antes de confirmar
- [ ] Mostrar advertencias si stock queda bajo

**Archivos a modificar:**
- `admin-frontend/src/pages/Products/CreateMovementModal.tsx`

---

### 14. Lazy Loading de Componentes
**Estado:** ⚠️ FALTA  
**Prioridad:** Baja

**Trabajo requerido:**
- [ ] Implementar code splitting por ruta
- [ ] Lazy load de componentes pesados (3D maps, charts)
- [ ] Reducir bundle inicial
- [ ] Optimizar carga de imágenes

**Archivos a modificar:**
- `admin-frontend/src/App.tsx` (ya tiene algunos lazy, revisar todos)
- Componentes pesados como `WarehouseMap3D.tsx`

---

## 🔵 MEJORAS TÉCNICAS

### 15. Tests Unitarios
**Estado:** ⚠️ FALTA  
**Prioridad:** Media

**Trabajo requerido:**
- [ ] Configurar Jest/Vitest para React
- [ ] Tests para hooks personalizados
- [ ] Tests para servicios
- [ ] Tests para componentes críticos
- [ ] Configurar coverage mínimo

---

### 16. Mejora de Manejo de Errores
**Estado:** ⚠️ MEJORABLE  
**Prioridad:** Media

**Trabajo requerido:**
- [ ] Crear componente `ErrorBoundary` global
- [ ] Mejorar mensajes de error para usuarios
- [ ] Agregar logging de errores (Sentry, etc.)
- [ ] Manejar errores de red de forma elegante
- [ ] Implementar retry automático para errores transitorios

**Archivos a crear/modificar:**
- `admin-frontend/src/components/ErrorBoundary.tsx` (nuevo)
- Revisar todos los `catch` blocks

---

### 17. Mejora de Accesibilidad (a11y)
**Estado:** ⚠️ MEJORABLE  
**Prioridad:** Baja

**Trabajo requerido:**
- [ ] Agregar ARIA labels a componentes
- [ ] Mejorar navegación por teclado
- [ ] Agregar focus visible en todos los elementos interactivos
- [ ] Validar contraste de colores
- [ ] Agregar soporte para lectores de pantalla

---

## 📊 Priorización Recomendada

### Sprint 1 (1-2 semanas) - Funcionalidades Críticas
1. ✅ Gestión de Sucursales
2. ✅ Verificación de RUT con API SII
3. ✅ Guardar Borrador de Cotizaciones

### Sprint 2 (1-2 semanas) - Mejoras de UX
4. ✅ Transferencias entre Bodegas
5. ✅ Exportar Datos
6. ✅ Confirmaciones antes de Acciones
7. ✅ Notificaciones Toast Mejoradas

### Sprint 3 (1 semana) - Optimizaciones
8. ✅ Paginación Real en Historial
9. ✅ Optimistic Updates
10. ✅ Búsqueda Avanzada

### Sprint 4 (1 semana) - Calidad
11. ✅ Tests Unitarios
12. ✅ Mejora de Manejo de Errores
13. ✅ Importación desde Excel

---

## 📝 Notas Adicionales

### Componentes que Necesitan Atención
- `BranchesSection.tsx` - Completamente pendiente
- `VerifyRutModal.tsx` - Lógica simulada, necesita integración real
- `CreateQuote.tsx` - Botón "Guardar borrador" no funcional
- `QuoteProductsForm.tsx` - Importación Excel no implementada

### Servicios que Faltan
- `branchesService.ts` - Para gestión de sucursales
- `draftQuotesService.ts` - Para borradores de cotizaciones
- `rutVerificationService.ts` - Para verificación de RUT

### Utilidades que Faltan
- `exportUtils.ts` - Para exportar a Excel/CSV
- `excelParser.ts` - Para importar desde Excel
- `keyboardShortcuts.ts` - Para atajos de teclado

---

## 🎯 Resumen de Estado

**Total de tareas pendientes:** 17

**Por prioridad:**
- 🔴 Alta: 4 tareas
- 🟡 Media: 6 tareas
- 🟢 Baja: 7 tareas

**Estado general:** El frontend está funcional pero tiene varias funcionalidades visibles que no están implementadas (sucursales, borradores, importación Excel). Las mejoras de UX y optimizaciones son importantes pero no críticas.

