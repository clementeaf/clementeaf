# Fase 4 - Próximos Pasos Requeridos

## ✅ Cambios Implementados

1. **Bug corregido**: `removeNotification` ahora usa `setLocalNotifications` correctamente
2. **Permisos manuales agregados**: Los permisos `view:products:history` y `create:products:movements` ahora se descubren automáticamente al sincronizar

## 📋 Pasos Requeridos para Completar la Configuración

### Paso 1: Sincronizar Permisos (REQUERIDO)

Los nuevos permisos han sido agregados al sistema de descubrimiento automático. Para sincronizarlos:

1. **Ir a la interfaz de administración**:
   - Navegar a `/roles/permissions` en el admin-frontend
   - O usar el endpoint directamente: `POST /permissions/sync`

2. **Sincronizar permisos**:
   - Hacer clic en el botón "Sincronizar Permisos"
   - Esto creará/actualizará los siguientes permisos:
     - `view:products:history` - Ver Historial de Productos
     - `create:products:movements` - Crear Movimientos de Stock

3. **Verificar**:
   - Los permisos deberían aparecer en la lista de permisos disponibles
   - Categoría: "Productos"

### Paso 2: Asignar Permisos a Roles (REQUERIDO)

Una vez sincronizados, asignar los permisos a los roles apropiados:

1. **Ir a la gestión de roles**:
   - Navegar a `/roles/roles` en el admin-frontend

2. **Editar rol apropiado**:
   - Seleccionar el rol que debe tener acceso (ej: "Administrador", "Bodeguero", etc.)
   - Hacer clic en "Editar"

3. **Asignar permisos**:
   - Buscar y seleccionar:
     - `view:products:history` - Para ver historial de movimientos
     - `create:products:movements` - Para crear movimientos de stock
   - Guardar cambios

### Paso 3: Probar Seguridad (RECOMENDADO)

Verificar que la seguridad funciona correctamente:

1. **Probar sin permisos**:
   - Crear un usuario de prueba sin los permisos asignados
   - Intentar crear un movimiento → Debe retornar **403 Forbidden**
   - Intentar ver historial → Debe retornar **403 Forbidden**

2. **Probar validación de stock**:
   - Intentar crear una salida con cantidad mayor al stock disponible
   - Debe retornar **400 Bad Request** con mensaje "Stock insuficiente"

3. **Probar auditoría**:
   - Crear un movimiento con un usuario autenticado
   - Verificar que el campo `createdBy` se asigna correctamente al ID del usuario autenticado (no al que viene del frontend)

4. **Probar con permisos**:
   - Usar un usuario con los permisos asignados
   - Verificar que puede crear movimientos y ver historial sin problemas

## 🔍 Verificación de Permisos

### Verificar que los permisos existen en la base de datos:

```sql
SELECT code, name, category 
FROM permissions 
WHERE code IN ('view:products:history', 'create:products:movements');
```

### Verificar que están asignados a roles:

```sql
SELECT r.name as role_name, p.code as permission_code, p.name as permission_name
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE p.code IN ('view:products:history', 'create:products:movements');
```

## 📝 Notas Importantes

1. **Super Admins**: Los super admins (`carriagada@banados.com`, `clementefalcone@banados.com`) tienen acceso automático a todos los permisos, no necesitan asignación manual.

2. **Descubrimiento Automático**: Los permisos ahora se descubren automáticamente al sincronizar, gracias a la función `getManualCapabilities()` en `CapabilitiesDiscoveryService`.

3. **Validación de Stock**: La validación de stock es atómica y se realiza en el backend, previniendo salidas con stock insuficiente.

4. **Auditoría**: El campo `createdBy` se asigna automáticamente desde el token JWT del usuario autenticado, no desde el frontend, previniendo manipulación.

## 🚀 Despliegue

Después de completar los pasos anteriores:

1. Compilar backend: `cd backend && npm run build`
2. Desplegar: `serverless deploy` (si es necesario)
3. Verificar que los endpoints funcionan correctamente

## ✅ Checklist Final

- [ ] Permisos sincronizados en `/roles/permissions`
- [ ] Permisos asignados a roles apropiados en `/roles/roles`
- [ ] Probado acceso sin permisos → 403
- [ ] Probado validación de stock → 400
- [ ] Probado auditoría → `createdBy` correcto
- [ ] Probado acceso con permisos → Funciona correctamente

