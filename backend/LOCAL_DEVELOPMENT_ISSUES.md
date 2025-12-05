# Problemas Identificados para Desarrollo Local y AWS

## 🔴 Problemas Críticos

### 1. WebSocket Endpoint en Desarrollo Local
**Problema**: `serverless-offline` no soporta WebSocket completamente. El endpoint hardcodeado no funcionará en local.

**Solución**: 
- Crear un modo de desarrollo que use un mock de WebSocket o skip el broadcast en local
- Agregar variable de entorno `IS_LOCAL` para detectar desarrollo local
- Usar un servicio mock para WebSocket en local

### 2. EventBridge en Desarrollo Local
**Problema**: EventBridge no funciona con `serverless-offline`. Los eventos no se dispararán en local.

**Solución**:
- Crear un `LocalEventPublisher` que ejecute los handlers directamente
- Detectar modo local y usar el publisher local en lugar de EventBridge
- Alternativamente, usar un servicio como LocalStack para simular EventBridge

### 3. Inicialización de Base de Datos en WebSocket Connect
**Problema**: La inicialización de BD es asíncrona y no bloqueante en `$connect`, lo que puede causar que la conexión se guarde antes de que la BD esté lista.

**Solución**:
- Asegurar que `ensureDatabaseInitialized` se llame antes de guardar la conexión
- Ya implementado, pero verificar que funcione correctamente

## ⚠️ Problemas Menores

### 4. Variables de Entorno Vacías
**Problema**: `WEBSOCKET_API_ENDPOINT` y `WSS_ENDPOINT` están vacías por defecto, lo que puede causar fallos.

**Solución**:
- Mejorar la resolución de endpoints con mejor fallback
- Documentar las variables de entorno necesarias

### 5. Endpoint Hardcodeado
**Problema**: El endpoint hardcodeado `https://us3x8rdme1.execute-api.us-east-1.amazonaws.com/dev` puede no ser el correcto en producción.

**Solución**:
- Obtener el endpoint dinámicamente desde el contexto de API Gateway
- Usar variables de entorno en producción

### 6. Manejo de Errores en EventBridge
**Problema**: Si EventBridge falla, no hay retry o DLQ configurado explícitamente.

**Solución**:
- Configurar Dead Letter Queue (DLQ) para los handlers de eventos
- Agregar retry policies

## ✅ Verificaciones Necesarias

1. **Permisos IAM**: Verificar que los handlers de eventos tengan permisos para EventBridge
2. **CORS**: Verificar que CORS esté configurado correctamente para WebSocket
3. **Timeouts**: Verificar que los timeouts sean suficientes para operaciones de BD
4. **Memory**: Verificar que el memory size sea suficiente para las operaciones

