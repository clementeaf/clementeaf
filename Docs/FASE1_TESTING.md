# Fase 1 - Guía de Pruebas

## 🧪 Checklist de Pruebas

### 1. Backend - Entidades y Base de Datos

#### ✅ Verificar creación de tablas
```bash
# Conectar a la base de datos y verificar
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('warehouses', 'stock_movements');
```

**Resultado esperado:** Ambas tablas deben existir

#### ✅ Verificar estructura de tabla `warehouses`
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'warehouses';
```

**Campos esperados:**
- id (integer, NOT NULL)
- codigo (varchar, NOT NULL, UNIQUE)
- nombre (varchar, NOT NULL)
- codigoCorto (varchar, nullable)
- direccion (text, nullable)
- ciudad (varchar, nullable)
- activo (boolean, default true)
- createdAt (timestamp)
- updatedAt (timestamp)

#### ✅ Verificar estructura de tabla `stock_movements`
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'stock_movements';
```

**Campos esperados:**
- id (integer, NOT NULL)
- productId (varchar, NOT NULL)
- productCode (varchar, NOT NULL)
- productName (varchar, NOT NULL)
- warehouseId (integer, NOT NULL)
- type (enum: entrada, salida, ajuste, transferencia)
- cantidad (decimal, NOT NULL)
- stockAnterior (decimal, NOT NULL)
- stockNuevo (decimal, NOT NULL)
- documento (varchar, nullable)
- numeroDocumento (varchar, nullable)
- fechaDocumento (date, nullable)
- lote (varchar, nullable)
- observaciones (varchar, nullable)
- createdBy (integer, nullable)
- createdAt (timestamp)

---

### 2. Backend - Endpoints

#### ✅ GET /products/warehouses
**Método:** GET  
**URL:** `https://[api-url]/dev/products/warehouses`  
**Headers:** `Authorization: Bearer [token]`

**Prueba sin seed:**
```bash
curl -X GET "https://[api-url]/dev/products/warehouses" \
  -H "Authorization: Bearer [token]"
```

**Resultado esperado:**
```json
{
  "success": true,
  "data": {
    "data": [],
    "total": 0
  }
}
```

**Prueba después del seed:**
```bash
# Debe retornar las 3 bodegas iniciales
```

**Resultado esperado:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "codigo": "STGO",
        "nombre": "Santiago",
        "codigoCorto": "STGO",
        "direccion": "Santiago, Chile",
        "ciudad": "Santiago"
      },
      {
        "id": 2,
        "codigo": "VALPO",
        "nombre": "Valparaíso",
        ...
      },
      {
        "id": 3,
        "codigo": "CONCE",
        "nombre": "Concepción",
        ...
      }
    ],
    "total": 3
  }
}
```

#### ✅ POST /migrations/seed-warehouses
**Método:** POST  
**URL:** `https://[api-url]/dev/migrations/seed-warehouses`  
**Headers:** `Authorization: Bearer [token]`

```bash
curl -X POST "https://[api-url]/dev/migrations/seed-warehouses" \
  -H "Authorization: Bearer [token]"
```

**Resultado esperado:**
```json
{
  "success": true,
  "data": {
    "message": "Bodegas creadas/actualizadas exitosamente",
    "results": {
      "created": 3,
      "updated": 0,
      "total": 3
    }
  }
}
```

**Prueba de idempotencia:**
- Ejecutar el seed dos veces
- La segunda vez debe mostrar `"created": 0, "updated": 3`

#### ✅ GET /products/search/query
**Método:** GET  
**URL:** `https://[api-url]/dev/products/search/query?search=PROD&limit=10`  
**Headers:** `Authorization: Bearer [token]`

```bash
curl -X GET "https://[api-url]/dev/products/search/query?search=PROD&limit=10" \
  -H "Authorization: Bearer [token]"
```

**Resultado esperado:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 123,
        "codigo": "PROD001",
        "nombre": "Producto ejemplo",
        "sku": "SKU001",
        "precio": 1000,
        "stock": 50,
        ...
      }
    ],
    "total": 1
  }
}
```

**Pruebas adicionales:**
- Búsqueda con término muy corto (< 2 caracteres): debe retornar array vacío
- Búsqueda sin resultados: debe retornar array vacío
- Búsqueda con límite inválido: debe retornar error 400

---

### 3. Frontend - Navegación y Permisos

#### ✅ Sidebar muestra "Productos"
**Pasos:**
1. Iniciar sesión en admin-frontend
2. Verificar que el Sidebar muestre el item "Productos"
3. Verificar que el icono sea correcto

**Resultado esperado:**
- Item "Productos" visible en el Sidebar
- Al hacer clic, navega a `/products/search`

#### ✅ Validación de permisos
**Prueba 1: Usuario con permiso**
- Usuario con permiso `view:products:search`
- Debe ver el item "Productos" en Sidebar
- Debe poder acceder a `/products/search`

**Prueba 2: Usuario sin permiso**
- Usuario sin permiso `view:products:search`
- NO debe ver el item "Productos" en Sidebar
- Si intenta acceder directamente a `/products/search`, debe redirigir a home

**Prueba 3: Super Admin**
- Super Admin debe ver todos los módulos
- Debe poder acceder sin restricciones

---

### 4. Frontend - Página de Búsqueda

#### ✅ Carga inicial de la página
**Pasos:**
1. Navegar a `/products/search`
2. Verificar que la página cargue sin errores

**Resultado esperado:**
- Título "Búsqueda de Productos" visible
- Barra de búsqueda visible
- Selector de bodega visible
- Toggle "Incluir lotes" visible
- Tab "Búsqueda" activo por defecto
- Tab "Historial" deshabilitado (sin producto seleccionado)

#### ✅ Carga de bodegas
**Pasos:**
1. Abrir la página
2. Observar el selector de bodega

**Escenario 1: Sin bodegas**
- Selector debe estar deshabilitado
- Mensaje: "No hay bodegas disponibles. Contacta al administrador."

**Escenario 2: Con bodegas**
- Selector debe estar habilitado
- Debe mostrar "Todas las bodegas" como primera opción
- Debe listar todas las bodegas con formato: "CÓDIGO - Nombre"

**Escenario 3: Error al cargar**
- Si falla la carga, debe mostrar mensaje de error
- Selector debe estar deshabilitado

#### ✅ Búsqueda de productos
**Pasos:**
1. Escribir en el campo de búsqueda (mínimo 2 caracteres)
2. Esperar 2 segundos (debounce)
3. Verificar resultados

**Pruebas:**
- Búsqueda con menos de 2 caracteres: no debe buscar
- Búsqueda válida: debe mostrar tabla con resultados
- Indicador de carga mientras busca
- Mensaje si no hay resultados
- Tabla con columnas: Código, Nombre, SKU, Stock, Precio, Categoría, Marca

**Resultado esperado:**
- Tabla se llena con productos encontrados
- Stock en verde si > 0, rojo si = 0
- Precios formateados con $ y separadores
- Click en fila selecciona el producto

#### ✅ Selección de producto
**Pasos:**
1. Buscar un producto
2. Hacer clic en una fila de la tabla

**Resultado esperado:**
- Aparece tarjeta azul con información del producto
- Muestra: código, nombre, SKU (si existe), stock, precio
- Tab "Historial" se habilita
- Si hay bodega seleccionada, muestra el nombre de la bodega

#### ✅ Filtro por bodega
**Pasos:**
1. Seleccionar una bodega del selector
2. Verificar que se actualice la información

**Resultado esperado:**
- Selector muestra la bodega seleccionada
- Si hay producto seleccionado, muestra el nombre de la bodega en la tarjeta
- Contador de resultados se actualiza (aunque el filtrado real es en Fase 2)

#### ✅ Toggle "Incluir lotes"
**Pasos:**
1. Activar/desactivar el toggle
2. Verificar que cambie de estado

**Resultado esperado:**
- Toggle cambia visualmente (azul cuando activo)
- Estado se mantiene durante la sesión
- (Funcionalidad real en Fase 2)

#### ✅ Tab Historial
**Pasos:**
1. Seleccionar un producto
2. Hacer clic en tab "Historial"

**Resultado esperado:**
- Tab se activa
- Muestra placeholder: "Esta funcionalidad se implementará en la Fase 2"
- Muestra información del producto y bodega seleccionada

**Sin producto seleccionado:**
- Tab debe estar deshabilitado
- Si se intenta activar, muestra mensaje: "Selecciona un producto para ver su historial"

---

### 5. Rendimiento y Optimizaciones

#### ✅ Carga inicial rápida
**Pasos:**
1. Limpiar caché del navegador
2. Abrir admin-frontend
3. Medir tiempo hasta que aparezca el Sidebar

**Resultado esperado:**
- Sidebar aparece inmediatamente (datos optimistas)
- No debe haber delay visible
- Permisos se cargan en background

#### ✅ Caché de bodegas
**Pasos:**
1. Cargar página de productos
2. Navegar a otra página
3. Volver a página de productos

**Resultado esperado:**
- Bodegas se cargan desde caché (no nueva petición HTTP)
- Caché válido por 10 minutos

#### ✅ Caché de búsqueda de productos
**Pasos:**
1. Buscar "PROD"
2. Navegar a otra página
3. Volver y buscar "PROD" nuevamente

**Resultado esperado:**
- Resultados se cargan desde caché
- Caché válido por 2 minutos

---

### 6. Manejo de Errores

#### ✅ Error al cargar bodegas
**Simulación:**
- Desconectar backend o endpoint incorrecto

**Resultado esperado:**
- Mensaje de error visible
- Selector deshabilitado
- No rompe la página

#### ✅ Error al buscar productos
**Simulación:**
- Desconectar backend o endpoint incorrecto

**Resultado esperado:**
- Mensaje de error en la tabla
- No rompe la página
- Usuario puede intentar nuevamente

#### ✅ Token expirado
**Simulación:**
- Usar token inválido

**Resultado esperado:**
- Redirige a auth-frontend
- Limpia tokens de cookies

---

### 7. Responsive y UX

#### ✅ Diseño responsive
**Pasos:**
1. Abrir en diferentes tamaños de pantalla
2. Verificar que se adapte correctamente

**Resultado esperado:**
- Layout se adapta a pantallas pequeñas
- Tabla es scrolleable horizontalmente si es necesario
- Filtros se apilan verticalmente en móvil

#### ✅ Estados visuales
**Verificar:**
- Hover en filas de tabla: cambio de color
- Hover en botones: cambio de color
- Estados disabled: opacidad reducida
- Estados loading: spinners visibles

---

## 📊 Matriz de Pruebas

| Funcionalidad | Backend | Frontend | Integración | Estado |
|--------------|---------|----------|-------------|--------|
| Entidades BD | ✅ | - | ✅ | Pendiente |
| Endpoint bodegas | ✅ | - | ✅ | Pendiente |
| Endpoint búsqueda | ✅ | - | ✅ | Pendiente |
| Seed de bodegas | ✅ | - | ✅ | Pendiente |
| Navegación | - | ✅ | ✅ | Pendiente |
| Validación permisos | - | ✅ | ✅ | Pendiente |
| Búsqueda productos | - | ✅ | ✅ | Pendiente |
| Filtro bodega | - | ✅ | ⚠️ | Pendiente |
| Selección producto | - | ✅ | ✅ | Pendiente |
| Carga optimista | - | ✅ | ✅ | Pendiente |
| Manejo errores | ✅ | ✅ | ✅ | Pendiente |

---

## 🚀 Orden Recomendado de Pruebas

1. **Backend primero:**
   - Compilar: `cd backend && npm run build`
   - Verificar tablas en BD
   - Probar endpoint GET /products/warehouses
   - Ejecutar seed: `npm run seed:warehouses`
   - Verificar que se crearon las bodegas

2. **Frontend básico:**
   - Iniciar: `cd admin-frontend && npm run dev`
   - Verificar que el Sidebar muestre "Productos"
   - Navegar a `/products/search`
   - Verificar que carguen las bodegas

3. **Funcionalidades:**
   - Buscar un producto
   - Seleccionar un producto
   - Probar filtro de bodega
   - Probar toggle "Incluir lotes"

4. **Permisos:**
   - Sincronizar permisos
   - Asignar permiso a un rol
   - Probar con usuario sin permiso
   - Probar con super admin

5. **Rendimiento:**
   - Medir tiempo de carga inicial
   - Verificar caché
   - Probar en diferentes conexiones

---

## ✅ Criterios de Aceptación

La Fase 1 se considera **completa** cuando:

- [ ] Todas las tablas se crean correctamente
- [ ] Endpoint de bodegas retorna datos correctos
- [ ] Seed de bodegas funciona (crea/actualiza)
- [ ] Búsqueda de productos funciona
- [ ] Sidebar muestra "Productos" según permisos
- [ ] Página de búsqueda carga sin errores
- [ ] Bodegas se cargan y muestran correctamente
- [ ] Búsqueda funciona con debounce
- [ ] Selección de producto funciona
- [ ] Filtro de bodega funciona (UI)
- [ ] Toggle "Incluir lotes" funciona (UI)
- [ ] Tab Historial muestra placeholder correcto
- [ ] Carga inicial es rápida (< 1 segundo para Sidebar)
- [ ] Manejo de errores funciona correctamente
- [ ] Diseño es responsive

---

## 🐛 Problemas Conocidos (Esperados)

1. **Filtro por bodega no filtra productos:** ✅ Esperado - Se implementará en Fase 2
2. **Toggle "Incluir lotes" sin efecto:** ✅ Esperado - Se implementará en Fase 2
3. **Historial muestra placeholder:** ✅ Esperado - Se implementará en Fase 2

---

## 📝 Notas de Prueba

- Usar datos reales de productos de la API externa
- Verificar que los permisos se sincronicen correctamente
- Probar con diferentes roles y usuarios
- Verificar logs en consola del navegador
- Verificar logs en CloudWatch (si está en producción)

