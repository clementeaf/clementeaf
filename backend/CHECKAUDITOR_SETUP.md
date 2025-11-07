# Configuración de CheckAuditor API

## Variables de Entorno Requeridas

### CHECKAUDITOR_API_KEY
La API Key de CheckAuditor se obtiene desde el panel de credenciales:
- URL: https://certificadotributario.com/panel/credenciales
- Esta es la clave que se usa en el header `API-KEY` de cada petición

## Cómo Obtener la API Key

### Opción 1: Panel de Credenciales (Recomendado)
1. Accede a: https://certificadotributario.com/panel/credenciales
2. Inicia sesión con tu cuenta
3. Busca la sección "API" o "Credenciales" o "Integraciones"
4. Si existe, debería haber una opción para generar o ver tu API Key

### Opción 2: Contactar Soporte
Si no encuentras la opción en el panel, contacta al soporte de CheckAuditor:
- **Email**: contacto@checkauditor.com
- **Mensaje sugerido**: 
  ```
  Hola, necesito obtener mi API Key para integrar CheckAuditor con mi aplicación. 
  He revisado el panel de credenciales pero no encuentro la opción para generarla. 
  ¿Podrían ayudarme a obtenerla?
  ```

### Opción 3: Verificar en la Colección de Postman
Si tienes acceso a la colección de Postman, la API Key de ejemplo es:
- `SCL1AAwDoM4HzLZoYkDR1KDn` (solo para referencia del formato)
- Tu API Key real debería tener un formato similar

### Opción 4: Verificar en la URL de Conexión Externa
Si tienes una URL de conexión externa como:
- `https://app.checkauditor.com/conexion-externa/{codigo}`

Esta URL podría contener información sobre cómo obtener o configurar la API Key. Abre la URL en un navegador y verifica si hay:
- Información sobre la API Key
- Instrucciones para generar la API Key
- Configuración de integración

**Nota**: El código en la URL (`4cd5582cee1f8af82eda752d97a85a92`) es un token de conexión externa, no la API Key directamente.

### Tokens Probados (No Funcionan)
Los siguientes tokens/códigos han sido probados y **NO funcionan** como API Key:
- `SCL1AAwDoM4HzLZoYkDR1KDn` (ejemplo de Postman) → 401
- `4cd5582cee1f8af82eda752d97a85a92` (token conexión externa) → 401
- `1640c4ec7c7cd5253e7e` (token) → 401 (API token not found or invalid)

**Conclusión**: Necesitas obtener la API Key real desde el panel de credenciales o contactar soporte.

### CHECKAUDITOR_BASE_URL
URL base de la API (opcional, tiene valor por defecto):
- Valor por defecto: `https://app.checkauditor.com`
- No es necesario configurarlo a menos que cambie

## Diferencia entre API-KEY y company_id

**IMPORTANTE**: Hay dos valores diferentes:

1. **API-KEY**: Clave de autenticación que va en el header
   - Se obtiene desde: https://certificadotributario.com/panel/credenciales
   - Se usa en: Header `API-KEY: {tu-api-key}`

2. **company_id**: ID de la compañía que va en los query parameters
   - Ejemplo: `b4622ede1fa55463d5df`
   - Se usa en: Query parameter `?id={company_id}` o `?company_id={company_id}`

## Configuración

### Desarrollo Local
```bash
export CHECKAUDITOR_API_KEY="tu-api-key-real"
export CHECKAUDITOR_BASE_URL="https://app.checkauditor.com"
```

### Producción (AWS Lambda)
Configurar en `serverless.yml` o usar AWS Secrets Manager:
```yaml
environment:
  CHECKAUDITOR_API_KEY: ${env:CHECKAUDITOR_API_KEY, ''}
  CHECKAUDITOR_BASE_URL: ${env:CHECKAUDITOR_BASE_URL, 'https://app.checkauditor.com'}
```

## Endpoints Disponibles

### POST /checkauditor/sessions
Autentica y establece conexión con el SII
- Query parameter: `?id={company_id}`
- Requiere: API-KEY en header

### GET /checkauditor/company-data
Obtiene datos generales de una empresa
- Query parameter: `?company_id={company_id}`
- Requiere: API-KEY en header

### GET /checkauditor/notifications
Obtiene notificaciones del SII
- Query parameter: `?company_id={company_id}`
- Requiere: API-KEY en header

## Ejemplo de Uso

```bash
# Autenticación
curl -X POST "http://localhost:9500/dev/checkauditor/sessions?id=b4622ede1fa55463d5df" \
  -H "Content-Type: application/json"

# Datos de empresa
curl -X GET "http://localhost:9500/dev/checkauditor/company-data?company_id=b4622ede1fa55463d5df" \
  -H "Content-Type: application/json"
```

## Notas

- La API-KEY se configura una vez en las variables de entorno
- El company_id se pasa en cada request según el endpoint
- Todos los endpoints requieren la API-KEY en el header (configurada automáticamente)

