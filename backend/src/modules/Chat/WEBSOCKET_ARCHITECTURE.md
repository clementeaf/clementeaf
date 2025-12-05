# Arquitectura Limpia para WebSocket

## Resumen

Este documento describe la arquitectura limpia implementada para el sistema de WebSocket con AWS API Gateway, siguiendo los principios SOLID, DRY y YAGNI.

## Estructura de Directorios

```
backend/src/modules/Chat/
├── handlers/
│   └── websocket/
│       ├── connect.ts          # Handler para conexiones
│       ├── disconnect.ts        # Handler para desconexiones
│       └── sendMessage.ts      # Handler para mensajes
├── services/
│   ├── ChatService.ts          # Servicio de negocio para chat
│   ├── WebSocketConnectionService.ts  # Gestión de conexiones WebSocket
│   ├── WebSocketMessageService.ts      # Procesamiento de mensajes WebSocket
│   ├── WebSocketService.ts     # @deprecated - Mantenido por compatibilidad
│   └── aws/
│       └── AwsWebSocketClient.ts       # Implementación AWS de IWebSocketClient
├── repositories/
│   ├── WebSocketConnectionRepository.ts  # Acceso a datos de conexiones
│   └── ChatRepository.ts                 # Acceso a datos de conversaciones
├── dto/
│   └── websocket/
│       ├── WebSocketMessageDto.ts       # DTO para mensajes WebSocket
│       ├── ConnectWebSocketDto.ts        # DTO para conexiones
│       └── WebSocketResponseDto.ts       # DTO para respuestas
├── interfaces/
│   └── IWebSocketClient.ts              # Interfaz para abstraer AWS
└── utils/
    └── websocket/
        ├── WebSocketHandlerWrapper.ts    # Wrapper para handlers
        ├── WebSocketAuthenticator.ts     # Autenticación de conexiones
        ├── WebSocketMessageParser.ts     # Parsing y validación de mensajes
        └── WebSocketEndpointResolver.ts  # Resolución de endpoints
```

## Capas de la Arquitectura

### 1. Handlers (Capa de Presentación)
**Responsabilidad**: Recibir eventos de AWS Lambda y delegar a servicios.

- **`connect.ts`**: Maneja conexiones WebSocket
- **`disconnect.ts`**: Maneja desconexiones WebSocket
- **`sendMessage.ts`**: Procesa mensajes recibidos vía WebSocket

**Características**:
- Usan `webSocketHandlerWrapper` para manejo de errores
- Validan entrada usando `WebSocketMessageParser`
- Autentican usando `WebSocketAuthenticator`
- Delegan lógica de negocio a servicios

### 2. Services (Capa de Lógica de Negocio)
**Responsabilidad**: Implementar la lógica de negocio.

#### `WebSocketConnectionService`
- Gestiona conexiones WebSocket (guardar, eliminar, buscar)
- Envía mensajes a usuarios específicos
- Abstrae la gestión de conexiones múltiples

#### `WebSocketMessageService`
- Procesa mensajes según su acción (`send_message`, `typing_start`, etc.)
- Valida permisos de acceso a conversaciones
- Notifica a participantes vía WebSocket

#### `ChatService`
- Lógica de negocio para conversaciones y mensajes
- Gestión de indicadores de typing
- Marcado de mensajes como leídos

### 3. Repositories (Capa de Acceso a Datos)
**Responsabilidad**: Abstraer el acceso a la base de datos.

#### `WebSocketConnectionRepository`
- CRUD de conexiones WebSocket
- Búsquedas por userId
- Búsquedas por múltiples userIds

#### `ChatRepository`
- Acceso a conversaciones
- Validación de participantes
- Obtención de IDs de participantes

### 4. DTOs (Data Transfer Objects)
**Responsabilidad**: Definir estructuras de datos para transferencia.

- **`WebSocketMessageDto`**: Estructura de mensajes recibidos
- **`ConnectWebSocketDto`**: Estructura de datos de conexión
- **`WebSocketResponseDto`**: Estructura de respuestas

### 5. Interfaces
**Responsabilidad**: Abstraer implementaciones específicas.

- **`IWebSocketClient`**: Interfaz para clientes WebSocket (permite cambiar de AWS a otro proveedor)

### 6. Utils (Utilidades)
**Responsabilidad**: Funciones auxiliares reutilizables.

- **`WebSocketHandlerWrapper`**: Wrapper para manejo de errores y inicialización de DB
- **`WebSocketAuthenticator`**: Autenticación de usuarios desde tokens
- **`WebSocketMessageParser`**: Parsing y validación de mensajes
- **`WebSocketEndpointResolver`**: Resolución de endpoints de AWS

## Principios Aplicados

### SOLID

1. **Single Responsibility Principle (SRP)**
   - Cada clase tiene una responsabilidad única
   - `WebSocketConnectionService` solo gestiona conexiones
   - `WebSocketMessageService` solo procesa mensajes
   - `WebSocketConnectionRepository` solo accede a datos de conexiones

2. **Open/Closed Principle (OCP)**
   - `IWebSocketClient` permite extender funcionalidad sin modificar código existente
   - Nuevos tipos de mensajes se agregan en `WebSocketMessageService` sin modificar handlers

3. **Liskov Substitution Principle (LSP)**
   - `AwsWebSocketClient` implementa `IWebSocketClient` y puede ser reemplazado por otra implementación

4. **Interface Segregation Principle (ISP)**
   - `IWebSocketClient` solo expone métodos necesarios para envío de mensajes

5. **Dependency Inversion Principle (DIP)**
   - Servicios dependen de interfaces (`IWebSocketClient`) no de implementaciones concretas
   - Repositorios abstraen el acceso a datos

### DRY (Don't Repeat Yourself)
- Lógica de resolución de endpoints centralizada en `WebSocketEndpointResolver`
- Autenticación centralizada en `WebSocketAuthenticator`
- Parsing y validación centralizados en `WebSocketMessageParser`

### YAGNI (You Aren't Gonna Need It)
- Solo se implementa lo necesario
- No hay abstracciones innecesarias
- Código simple y directo

## Flujo de Datos

### Conexión WebSocket
```
1. Cliente se conecta → connect.ts
2. WebSocketAuthenticator valida token
3. WebSocketConnectionService guarda conexión
4. Retorna 200 OK
```

### Mensaje WebSocket
```
1. Cliente envía mensaje → sendMessage.ts
2. WebSocketMessageParser parsea y valida
3. WebSocketAuthenticator obtiene userId de conexión
4. WebSocketMessageService procesa mensaje
5. WebSocketConnectionService envía a participantes
6. Retorna respuesta
```

### Desconexión WebSocket
```
1. Cliente se desconecta → disconnect.ts
2. WebSocketConnectionService elimina conexión
3. Retorna 200 OK
```

## Migración del Código Antiguo

El `WebSocketService` original se mantiene por compatibilidad pero ahora usa la nueva arquitectura internamente:

```typescript
// Antes (código antiguo)
const webSocketService = new WebSocketService();
await webSocketService.sendToConversationParticipants(user1, user2, message);

// Ahora (internamente usa nueva arquitectura)
// El código antiguo sigue funcionando, pero internamente usa:
// - WebSocketConnectionService
// - AwsWebSocketClient
```

## Ventajas de la Nueva Arquitectura

1. **Testabilidad**: Cada capa puede ser testeada independientemente
2. **Mantenibilidad**: Cambios en una capa no afectan otras
3. **Escalabilidad**: Fácil agregar nuevas funcionalidades
4. **Flexibilidad**: Cambiar de AWS a otro proveedor es simple (implementar `IWebSocketClient`)
5. **Claridad**: Responsabilidades bien definidas

## Próximos Pasos

1. Migrar handlers HTTP (`createMessage`, `startTyping`, etc.) para usar la nueva arquitectura
2. Agregar tests unitarios para cada capa
3. Implementar rate limiting para mensajes WebSocket
4. Agregar logging estructurado
5. Implementar métricas y monitoreo

