# 🔥 Prueba de Fuego - Control de Acceso Basado en Roles (RBAC)

## Objetivo
Verificar que el sistema de control de acceso funcione correctamente:
- Los usuarios solo ven los módulos a los que tienen acceso
- El sidebar se filtra automáticamente según los permisos del rol
- Las rutas están protegidas y redirigen si no hay acceso

## Pasos para la Prueba

### 1. Crear Roles de Prueba

#### Rol 1: "Vendedor" (Solo módulo de Ventas)
1. Ir a **Roles > Roles > Crear Nuevo Rol**
2. Nombre: `Vendedor`
3. Descripción: `Usuario que solo puede acceder a Ventas`
4. Seleccionar permisos:
   - ✅ Módulo: `Ventas` (o submódulos específicos)
   - ✅ Submódulos de Ventas:
     - ✅ Clientes
     - ✅ Nota de venta
     - ✅ Cuentas por cobrar
5. Guardar

#### Rol 2: "Bodeguero" (Solo módulo de Picking)
1. Ir a **Roles > Roles > Crear Nuevo Rol**
2. Nombre: `Bodeguero`
3. Descripción: `Usuario que solo puede acceder a Picking`
4. Seleccionar permisos:
   - ✅ Módulo: `Picking` (o submódulos específicos)
   - ✅ Submódulos de Picking:
     - ✅ Orden de picking
     - ✅ Métricas
     - ✅ Mapa de Bodega
5. Guardar

#### Rol 3: "Administrador" (Acceso completo)
1. Ir a **Roles > Roles > Crear Nuevo Rol**
2. Nombre: `Administrador`
3. Descripción: `Usuario con acceso completo al sistema`
4. Seleccionar permisos:
   - ✅ Todos los módulos
   - ✅ Todos los submódulos
   - ✅ Todos los servicios
5. Guardar

#### Rol 4: "Sin Acceso" (Sin permisos)
1. Ir a **Roles > Roles > Crear Nuevo Rol**
2. Nombre: `Sin Acceso`
3. Descripción: `Usuario sin permisos`
4. **NO seleccionar ningún permiso**
5. Guardar

### 2. Crear Usuarios de Prueba

Para cada rol creado, crear un usuario:

1. Ir a **Roles > Usuarios > Crear Nuevo Usuario**
2. Crear usuarios:
   - **vendedor@test.com** → Asignar rol "Vendedor"
   - **bodeguero@test.com** → Asignar rol "Bodeguero"
   - **admin@test.com** → Asignar rol "Administrador"
   - **sinacceso@test.com** → Asignar rol "Sin Acceso"
3. Contraseña para todos: `Test123!` (o la que prefieras)

### 3. Probar Acceso con Cada Usuario

#### Prueba con "Vendedor" (vendedor@test.com)
1. Cerrar sesión del usuario actual
2. Iniciar sesión con `vendedor@test.com`
3. **Verificar en el Sidebar:**
   - ✅ Debe ver: Inicio, Ventas (con Clientes, Nota de venta, Cuentas por cobrar), Chat, Soporte
   - ❌ NO debe ver: Picking, Roles
4. **Verificar acceso a rutas:**
   - ✅ Puede acceder a `/sells/clients`, `/sells/quotes`, `/sells/collections`
   - ❌ Si intenta acceder a `/picking` o `/roles/roles`, debe ser redirigido a Home

#### Prueba con "Bodeguero" (bodeguero@test.com)
1. Cerrar sesión
2. Iniciar sesión con `bodeguero@test.com`
3. **Verificar en el Sidebar:**
   - ✅ Debe ver: Inicio, Picking (con Orden de picking, Métricas, Mapa de Bodega), Chat, Soporte
   - ❌ NO debe ver: Ventas, Roles
4. **Verificar acceso a rutas:**
   - ✅ Puede acceder a `/picking/order`, `/picking/metrics`, `/picking/warehouse`
   - ❌ Si intenta acceder a `/sells/clients` o `/roles/roles`, debe ser redirigido a Home

#### Prueba con "Administrador" (admin@test.com)
1. Cerrar sesión
2. Iniciar sesión con `admin@test.com`
3. **Verificar en el Sidebar:**
   - ✅ Debe ver: TODOS los módulos (Inicio, Ventas, Chat, Picking, Soporte, Roles)
   - ✅ Todos los submódulos deben estar visibles
4. **Verificar acceso a rutas:**
   - ✅ Puede acceder a cualquier ruta del sistema

#### Prueba con "Sin Acceso" (sinacceso@test.com)
1. Cerrar sesión
2. Iniciar sesión con `sinacceso@test.com`
3. **Verificar en el Sidebar:**
   - ✅ Debe ver SOLO: Inicio, Chat, Soporte
   - ❌ NO debe ver: Ventas, Picking, Roles
4. **Verificar acceso a rutas:**
   - ✅ Puede acceder a `/`, `/chat`, `/support`
   - ❌ Si intenta acceder a cualquier otra ruta, debe ser redirigido a Home

## Checklist de Verificación

- [ ] Los roles se crean correctamente con sus permisos
- [ ] Los usuarios se crean y se les asigna el rol correctamente
- [ ] El sidebar muestra solo los módulos permitidos para cada usuario
- [ ] Los submódulos se filtran correctamente según permisos
- [ ] Las rutas protegidas redirigen a Home si no hay acceso
- [ ] El endpoint `/auth/me` devuelve correctamente los permisos del usuario
- [ ] Los módulos sin submódulos visibles no se muestran en el sidebar

## Notas Importantes

1. **Permisos de módulo vs submódulo:**
   - Si un usuario tiene el permiso del módulo completo (`module:sells`), verá todo el módulo
   - Si solo tiene permisos de submódulos (`view:sells:clients`), verá solo esos submódulos
   - Si no tiene ningún permiso del módulo, el módulo no aparecerá

2. **Rutas públicas:**
   - Home (`/`), Chat (`/chat`), Soporte (`/support`) son siempre accesibles

3. **Debug:**
   - Abrir la consola del navegador (F12)
   - Verificar que el endpoint `/auth/me` devuelve los permisos correctos
   - Verificar que no hay errores en la consola

## Códigos de Permisos Esperados

### Módulos
- `module:sells` - Acceso completo a Ventas
- `module:picking` - Acceso completo a Picking
- `module:roles` - Acceso completo a Roles

### Submódulos de Ventas
- `view:sells:clients` - Acceso a Clientes
- `view:sells:quotes` - Acceso a Nota de venta
- `view:sells:collections` - Acceso a Cuentas por cobrar

### Submódulos de Picking
- `view:picking:order` - Acceso a Orden de picking
- `view:picking:metrics` - Acceso a Métricas
- `view:picking:warehouse` - Acceso a Mapa de Bodega

### Submódulos de Roles
- `view:roles:roles` - Acceso a Roles
- `view:roles:users` - Acceso a Usuarios

