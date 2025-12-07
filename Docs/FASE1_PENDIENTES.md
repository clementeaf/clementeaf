# Fase 1 - Pendientes y Mejoras

## ✅ Completado
- Entidades de BD (Warehouse, StockMovement)
- Endpoint GET /products/warehouses
- Página SearchProducts con UI mejorada
- Filtro por bodega en UI
- Toggle "Incluir lotes" en UI
- Tabs (Búsqueda e Historial)
- Optimizaciones de rendimiento
- Rutas y navegación configuradas

## ⚠️ Pendientes para completar Fase 1

### 1. **Permiso `view:products:search`**
**Estado:** La ruta está protegida pero el permiso necesita ser descubierto/sincronizado

**Solución:**
- El sistema tiene descubrimiento automático de permisos desde `serverless.yml` y `routes`
- Ejecutar sync de permisos: `POST /permissions/sync`
- O agregar manualmente el permiso si no se descubre automáticamente

**Código del permiso esperado:** `view:products:search`

### 2. **Validación de permisos en Sidebar para "Productos"**
**Estado:** El Sidebar muestra "Productos" cuando está cargando, pero no valida el permiso cuando ya cargó

**Ubicación:** `admin-frontend/src/components/Sidebar.tsx` línea 86

**Solución:** Agregar validación específica para el módulo "Productos":
```typescript
if (item.name === 'Productos') {
  return hasPermission('view:products:search');
}
```

### 3. **Filtro por bodega no funcional**
**Estado:** El filtro está en la UI pero no filtra realmente los productos

**Ubicación:** `admin-frontend/src/pages/Products/SearchProducts.tsx` línea 53-58

**Nota:** Esto es intencional según el diseño - el filtro real se aplicará en el historial (Fase 2). 
Pero podría mejorarse mostrando un mensaje informativo o deshabilitando el filtro hasta que haya datos.

### 4. **Toggle "Incluir lotes" sin funcionalidad**
**Estado:** Está en la UI pero no tiene efecto

**Nota:** Esto es esperado para Fase 2 cuando se implemente el historial con lotes.

### 5. **Datos de prueba/seed para bodegas**
**Estado:** Las entidades están creadas pero no hay datos iniciales

**Solución:** Crear script de seed o migración con bodegas iniciales:
- Santiago (STGO)
- Otras bodegas según necesidad

**Ubicación sugerida:** `backend/src/migrations/` o `backend/scripts/seed-warehouses.ts`

### 6. **Compilación del backend**
**Estado:** Las entidades necesitan compilarse para que TypeORM las reconozca

**Solución:**
```bash
cd backend
npm run build
```

### 7. **Mensaje cuando no hay bodegas**
**Estado:** Si no hay bodegas en la BD, el selector estará vacío

**Mejora sugerida:** Mostrar mensaje informativo cuando no hay bodegas disponibles

## 🔧 Mejoras Sugeridas (Opcionales)

### 1. **Mensaje informativo en filtro de bodega**
Cuando no hay bodega seleccionada, mostrar: "Selecciona una bodega para filtrar el historial"

### 2. **Estado de carga mejorado**
Mostrar skeleton o loading state mientras cargan las bodegas

### 3. **Manejo de errores**
Mejorar manejo de errores cuando falla la carga de bodegas

### 4. **Validación de permisos en tiempo real**
El Sidebar podría ocultar "Productos" si el usuario no tiene el permiso (después de cargar)

## 📋 Checklist de Completitud

- [ ] Sincronizar permisos (`view:products:search`)
- [ ] Agregar validación de permisos en Sidebar para "Productos"
- [ ] Compilar backend (`npm run build`)
- [ ] Crear script de seed para bodegas iniciales
- [ ] Probar que el endpoint `/products/warehouses` funcione
- [ ] Verificar que la página `/products/search` sea accesible
- [ ] Probar búsqueda de productos
- [ ] Verificar que el filtro de bodega muestre opciones

## 🚀 Para Probar la Fase 1

1. **Compilar backend:**
   ```bash
   cd backend
   npm run build
   ```

2. **Sincronizar permisos:**
   - Ir a `/roles/permissions`
   - Hacer clic en "Sincronizar Permisos"
   - Verificar que aparezca `view:products:search`

3. **Asignar permiso a un rol:**
   - Ir a `/roles/roles`
   - Editar un rol
   - Asignar permiso `view:products:search`

4. **Crear bodegas iniciales:**
   - Ejecutar script de seed o crear manualmente desde BD
   - O usar endpoint POST (si se crea) para crear bodegas

5. **Probar la interfaz:**
   - Navegar a `/products/search`
   - Buscar un producto
   - Seleccionar una bodega
   - Verificar que todo funcione correctamente

