# Acceso a API Externa - sistemas.banados.cl

## Resumen

Este documento describe el acceso y uso de la API externa de sistemas.banados.cl para sincronizar datos hacia nuestra base de datos PostgreSQL.

## Información de la API

### Endpoint Base
```
https://sistemas.banados.cl/apiManager/api/getData.php
```

### Endpoint de Tablas Disponibles
```
https://sistemas.banados.cl/apiManager/api/tablas.php
```

### Credenciales
- **Token**: `Banados2024!SecureToken#987`
- **Base de Datos**: `Banados`
- **Servidor**: Microsoft SQL Server 2008 R2 (SP2)
- **Total de Tablas**: 664

### Información Técnica
- **PHP Version**: 7.3.2
- **SQL Server**: 2008 R2 (SP2) - 10.50.4000.0
- **Servidor**: B360 (192.168.9.100)
- **Base de Datos**: banados

## Parámetros de la API

### getData.php
Parámetros requeridos:
- `token`: Token de autenticación
- `base`: Nombre de la base de datos (ej: `Banados`)
- `tabla`: Nombre de la tabla a consultar
- `page`: Número de página (paginación)
- `per_page`: Registros por página (máximo 250)

### Ejemplo de URL
```
https://sistemas.banados.cl/apiManager/api/getData.php?token=Banados2024!SecureToken%23987&base=Banados&tabla=ART_DB&page=1&per_page=250
```

## Datos Implementados

### 1. Analytics_CtasPorCobrar (Cuentas por Cobrar)

**Estado**: ✅ Implementado

**Descripción**: Datos de cuentas por cobrar con información de clientes, vendedores, deudas y vencimientos.

**Flujo de Sincronización**:
1. Funciones Python Lambda (`banados-analytics-sync`) obtienen datos de la API externa
2. Los datos se almacenan en S3: `s3://banados-analytics-data/Analytics_CtasPorCobrar/combined_data.json`
3. Función Lambda `syncData` sincroniza desde S3 a PostgreSQL
4. Se ejecuta diariamente vía EventBridge

**Campos Principales**:
- Información del cliente (RUT, razón social)
- Montos (DEBE, HABER, DEUDA)
- Fechas (FECHA, VENCIMIE)
- Análisis de vencimiento (días vencidos, rangos)
- Información de vendedor (código, nombre, email, team)
- Cuenta contable
- Números de orden y HEP

**Endpoints**:
- `GET /analytics/ctas-por-cobrar` - Obtener cuentas por cobrar con filtros
- `GET /analytics/deudas-activas` - Obtener solo deudas activas
- `GET /analytics/resumen/clientes` - Resumen por cliente
- `GET /analytics/resumen/vendedores` - Resumen por vendedor
- `GET /analytics/estadisticas` - Estadísticas generales
- `POST /analytics/sync` - Sincronizar datos desde S3

**Entidad**: `CtasPorCobrar` en `backend/src/modules/Analytics/entities/CtasPorCobrar.entity.ts`

### 2. ART_DB (Productos)

**Estado**: ✅ Implementado

**Descripción**: Catálogo completo de productos con información de precios, stock, categorías y más.

**Flujo de Sincronización**:
1. Función Lambda `syncProducts` obtiene datos directamente de la API externa
2. Procesa datos en lotes de 100 productos
3. Sincroniza directamente a PostgreSQL usando upsert
4. Maneja paginación automática (250 registros por página)

**Estadísticas**:
- **Total de Registros**: 13,755 productos
- **Total de Páginas**: 56 páginas
- **Registros por Página**: 250

**Campos Principales**:
- Información básica (NREGUIST, CODIGO, NOMBRE)
- Precios (PRECVTA, COSTOREP, MARGENVTA)
- Stock (ART_DISPON, ART_CRITIC, ART_OPTIMO)
- Categorías (CLASE1, CLASE2, CLASE3, CLASE4)
- Unidades de medida (UNIDMED, UNIDPESA, UNIDVOL)
- Estados (ELIMINADO, OBSOLETO, PUBLICADO)
- Información de proveedor (PROV, PAISORI)
- Fechas (FECHACREA, FECHAMODIF, PROXLLEGA)
- Y más de 100 campos adicionales

**Endpoints**:
- `POST /products/sync` - Sincronizar productos desde la API externa
- `GET /products` - Obtener todos los productos con filtros y paginación
- `GET /products/search?q={query}` - Buscar productos por código o nombre

**Entidad**: `Product` en `backend/src/modules/Products/entities/Product.entity.ts`

**Servicio**: `ProductSyncService` en `backend/src/modules/Products/services/ProductSyncService.ts`

## Tablas Disponibles (664 en total)

### Tablas Relevantes Identificadas

#### Productos e Inventario
- `ART_DB` ✅ - Productos (implementado)
- `BCK_ART_DB_zzz` - Backup de productos
- `LOGISTICA_DETALLE_INVENTARIO_zzzzzz` - Detalle de inventario
- `LOGISTICA_TOMA_INVENTARIO` - Toma de inventario

#### Clientes
- `CLIEN_DB` - Clientes
- `DBCLIENTE_CC` - Clientes cuenta corriente
- `LOGISTICA_CLIENTES_HEP` - Clientes HEP
- `LOGISTICA_USUARIOS_CLIENTES_ASOC` - Usuarios clientes asociados
- `LOGISTICA_CONTACTOS_CLIENTES` - Contactos de clientes

#### Ventas y Facturación
- `LOGISTICA_DOCUMENTOS_NOTA_VENTA` - Notas de venta
- `LOGISTICA_FACTURAS_REPARTIR` - Facturas a repartir
- `LOGISTICA_FACTURAS_VENDEDOR` - Facturas por vendedor
- `LOGISTICA_FACTURA_IMPRESORA` - Facturas impresora
- `LOGISTICA_RESUMENES_VENTAS_VENDEDORES` - Resúmenes de ventas por vendedor
- `LOGISTICA_RESUMEN_VENTAS` - Resumen de ventas
- `LOGISTICA_RESUMEN_VENTAS_PRODUCTOS` - Resumen de ventas por producto
- `FACTURACION_MENU_zzzz` - Menú de facturación
- `FACTURACION_TEMP_DOCDE_DB_zzz` - Temporal de facturación

#### Pedidos y Compras
- `COMPRA_PEDIDOS` - Pedidos de compra
- `LOGISTICA_NOTAS_ASIGNADAS_FACTURAR` - Notas asignadas a facturar

#### Cobranza
- `COBRANZA_DOCUMENTOS_PENDIENTES_VENDEDOR` - Documentos pendientes por vendedor

#### Vendedores
- `LOGISTICA_NOMBRE_VENDEDOR` - Nombres de vendedores
- `LOGISTICA_EQUIPOS_VENTAS` - Equipos de ventas

#### Logística
- `LOGISTICA_DETALLE_WALMART` - Detalle Walmart
- `LOGISTICA_EVENTOS_SEGUIMIENTO_zzzzzz` - Eventos de seguimiento
- `LOGISTICA_RUT_FACTURACION` - RUT de facturación

#### Otros
- `CARTO_DB` - Cartones
- `APROX_DB` - Aproximaciones

## Cómo Consultar Tablas Disponibles

### Usando curl
```bash
curl "https://sistemas.banados.cl/apiManager/api/tablas.php?token=Banados2024!SecureToken%23987&base=Banados"
```

### Respuesta
```json
{
  "success": true,
  "data": {
    "base_datos": "banados",
    "total_tablas": 664,
    "tablas": [
      {
        "nombre": "ART_DB",
        "esquema": "dbo",
        "catalogo": "banados",
        "tipo": "BASE TABLE",
        "estadisticas": {
          "total_records": 13755,
          "total_columns": 150
        }
      },
      ...
    ]
  }
}
```

## Cómo Implementar una Nueva Sincronización

### Paso 1: Crear la Entidad TypeORM

Crear archivo: `backend/src/modules/[Module]/entities/[Entity].entity.ts`

```typescript
import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('nombre_tabla')
export class MiEntidad {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nombre!: string | null;

  // ... más campos

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;

  @Column({ type: 'date', nullable: true })
  sync_date!: Date | null;
}
```

### Paso 2: Crear el Servicio de Sincronización

Crear archivo: `backend/src/modules/[Module]/services/[Module]SyncService.ts`

```typescript
import { initializeDatabase } from '../../../config/database';
import { MiEntidad } from '../entities/MiEntidad.entity';
import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';

export class MiSyncService {
  private apiUrl: string;
  private token: string;
  private base: string;
  private tabla: string;
  private perPage: number;

  constructor() {
    this.apiUrl = process.env.EXTERNAL_API_URL ?? 'https://sistemas.banados.cl/apiManager/api/getData.php';
    const rawToken = process.env.EXTERNAL_API_TOKEN ?? 'Banados2024!SecureToken%23987';
    this.token = decodeURIComponent(rawToken);
    this.base = process.env.EXTERNAL_API_BASE ?? 'Banados';
    this.tabla = 'NOMBRE_TABLA';
    this.perPage = parseInt(process.env.EXTERNAL_API_PER_PAGE ?? '250', 10);
  }

  // Implementar métodos fetchPage, mapApiItemToEntity, syncData, etc.
}
```

### Paso 3: Crear el Handler Lambda

Crear archivo: `backend/src/modules/[Module]/handlers/sync[Module].ts`

```typescript
import { type APIGatewayProxyEvent } from 'aws-lambda';
import { MiSyncService } from '../services/MiSyncService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse, errorResponse } from '../../Users/utils/response';

const syncHandler = async (_event: APIGatewayProxyEvent) => {
  try {
    const syncService = new MiSyncService();
    const result = await syncService.syncData();
    return successResponse(200, result, 'Data synchronized successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(500, `Error syncing data: ${errorMessage}`);
  }
};

export const handler = handlerWrapper(syncHandler);
```

### Paso 4: Agregar al serverless.yml

```yaml
syncMiModulo:
  handler: dist/modules/[Module]/handlers/sync[Module].handler
  timeout: 600
  memorySize: 1024
  events:
    - http:
        path: [module]/sync
        method: post
        cors: true
```

### Paso 5: Variables de Entorno

Agregar a las variables de entorno de Lambda:
- `EXTERNAL_API_URL`: URL de la API externa
- `EXTERNAL_API_TOKEN`: Token de autenticación
- `EXTERNAL_API_BASE`: Base de datos
- `EXTERNAL_API_PER_PAGE`: Registros por página (opcional)

## Consideraciones Técnicas

### Paginación
- La API soporta paginación con máximo 250 registros por página
- Implementar lógica de paginación para procesar todas las páginas
- Agregar pausas entre páginas para no sobrecargar el servidor (300ms recomendado)

### Manejo de Fechas
- Las fechas vienen en formato PHP: `{ date: "YYYY-MM-DD HH:MM:SS", timezone_type: 3, timezone: "America/Santiago" }`
- Convertir a `Date` de JavaScript usando `new Date(dateObj.date)`

### Manejo de Números
- Los números pueden venir como strings desde la API
- Usar `parseFloat()` o `parseInt()` según corresponda
- Manejar valores `null` o `undefined`

### Encoding del Token
- El token contiene caracteres especiales (`#`)
- Decodificar con `decodeURIComponent()` si viene codificado desde variables de entorno
- `URLSearchParams` codifica automáticamente, no hacer doble encoding

### Timeouts
- Configurar timeout adecuado en Lambda (600 segundos para sincronizaciones grandes)
- Agregar timeouts en las requests HTTP (30 segundos recomendado)

### Batch Processing
- Procesar en lotes para evitar problemas de memoria
- Tamaño de lote recomendado: 100-500 registros
- Usar `Promise.all()` para procesamiento paralelo cuando sea posible

### Upsert Logic
- Usar `findOne()` + `save()` para upsert
- Identificar registros existentes por clave primaria
- Actualizar solo si existe, insertar si no existe

## Próximos Pasos Sugeridos

### Prioridad Alta
1. **CLIEN_DB** - Sincronizar clientes
   - Información de clientes para el sistema
   - Integración con cuentas por cobrar y ventas

2. **COMPRA_PEDIDOS** - Pedidos de compra
   - Gestión de pedidos
   - Integración con productos

### Prioridad Media
3. **LOGISTICA_DOCUMENTOS_NOTA_VENTA** - Notas de venta
   - Documentos de venta
   - Integración con productos y clientes

4. **LOGISTICA_FACTURAS_VENDEDOR** - Facturas por vendedor
   - Facturación
   - Reportes de ventas

### Prioridad Baja
5. **LOGISTICA_CLIENTES_HEP** - Clientes HEP
6. **LOGISTICA_CONTACTOS_CLIENTES** - Contactos de clientes
7. **LOGISTICA_RESUMEN_VENTAS** - Resúmenes de ventas

## Referencias

- **API Externa**: `https://sistemas.banados.cl/apiManager/api/`
- **Documentación de Tablas**: Usar endpoint `tablas.php` para listar todas las tablas disponibles
- **Código de Referencia**: Ver `ProductSyncService.ts` como ejemplo de implementación completa

## Notas Importantes

⚠️ **Límites de la API**:
- Máximo 250 registros por página
- Timeout de 30 segundos por request
- No sobrecargar el servidor con requests muy frecuentes

⚠️ **Seguridad**:
- El token contiene caracteres especiales, manejar encoding correctamente
- No exponer el token en logs o código fuente
- Usar variables de entorno para credenciales

⚠️ **Rendimiento**:
- Las sincronizaciones grandes pueden tardar varios minutos
- Configurar timeouts adecuados en Lambda
- Procesar en lotes para evitar problemas de memoria

---

**Última actualización**: 2025-11-12  
**Versión del documento**: 1.0

