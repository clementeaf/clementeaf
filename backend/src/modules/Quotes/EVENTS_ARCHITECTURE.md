# Arquitectura de Eventos para Notas de Venta

## Resumen

Este documento describe la arquitectura de eventos implementada para el módulo de Notas de Venta (Quotes), siguiendo principios de Domain-Driven Design (DDD) y arquitectura limpia.

## Estructura de Directorios

```
backend/src/modules/Quotes/
├── handlers/
│   ├── createQuote.ts              # Handler HTTP que publica eventos
│   └── events/
│       └── quoteCreatedHandler.ts  # Handler de eventos (EventBridge)
├── events/
│   ├── QuoteCreatedEvent.ts        # Definición del evento de dominio
│   └── index.ts                    # Exportaciones
├── interfaces/
│   └── IEventPublisher.ts          # Interfaz para abstraer publicadores
└── services/
    ├── EventPublisher.ts           # Servicio de publicación de eventos
    └── aws/
        └── AwsEventBridgePublisher.ts  # Implementación AWS EventBridge
```

## Conceptos Clave

### Eventos de Dominio

Los eventos de dominio representan algo que **ya ocurrió** en el sistema. Son inmutables y contienen toda la información necesaria para que otros sistemas o módulos reaccionen.

**Ejemplo**: `quote.created` - Se dispara cuando se crea una nueva nota de venta.

### Publicación de Eventos

La publicación de eventos es **no bloqueante**. El handler HTTP no espera a que el evento se procese, permitiendo respuestas rápidas al cliente.

### Procesamiento Asíncrono

Los eventos se procesan de forma asíncrona mediante AWS EventBridge, permitiendo:
- Desacoplamiento entre módulos
- Escalabilidad independiente
- Resiliencia (retry automático, DLQ)
- Trazabilidad

## Flujo de Datos

### 1. Creación de Nota de Venta

```
1. Cliente → POST /quotes
2. Handler createQuote → Valida y crea nota de venta
3. Handler createQuote → Publica evento 'quote.created' (no bloqueante)
4. Handler createQuote → Retorna respuesta HTTP 201
```

### 2. Procesamiento de Evento

```
1. EventBridge recibe evento 'quote.created'
2. EventBridge invoca quoteCreatedHandler (Lambda)
3. Handler procesa el evento (notificaciones, analytics, etc.)
4. Handler completa exitosamente
```

## Implementación

### Definición de Evento

```typescript
// events/QuoteCreatedEvent.ts
export interface QuoteCreatedEvent {
  eventType: 'quote.created';
  version: string;
  timestamp: string;
  quoteId: number;
  numeroCotizacion: string | null;
  clienteNombre: string;
  estado: string;
  createdBy?: number;
  metadata?: { ... };
}
```

### Publicación de Evento

```typescript
// handlers/createQuote.ts
const quoteCreatedEvent = QuoteCreatedEventFactory.create(quote, createdBy);
const eventPublisher = new EventPublisher();

// Publicación no bloqueante
eventPublisher.publish('quote.created', quoteCreatedEvent)
  .then(success => { ... })
  .catch(error => { ... });
```

### Procesamiento de Evento

```typescript
// handlers/events/quoteCreatedHandler.ts
export const quoteCreatedHandler = async (
  event: EventBridgeEvent<'quote.created', QuoteCreatedEvent>
): Promise<void> => {
  const quoteData = event.detail;
  // Procesar evento...
};
```

## Configuración AWS

### Permisos IAM

```yaml
# serverless.yml
- Effect: Allow
  Action:
    - events:PutEvents
    - events:PutRule
    - events:PutTargets
    - events:DescribeRule
  Resource: '*'
```

### EventBridge Pattern

```yaml
# serverless.yml
events:
  - eventBridge:
      pattern:
        source:
          - banados.quotes
        detail-type:
          - quote.created
```

### Variables de Entorno

```bash
EVENT_BRIDGE_BUS_NAME=default  # Nombre del Event Bus (default usa el bus por defecto)
EVENT_BRIDGE_SOURCE=banados.quotes  # Source de los eventos
AWS_REGION=us-east-1  # Región de AWS
```

## Ventajas

1. **Desacoplamiento**: Los módulos no dependen directamente entre sí
2. **Escalabilidad**: Cada handler puede escalar independientemente
3. **Resiliencia**: EventBridge maneja retries y DLQ automáticamente
4. **Trazabilidad**: Todos los eventos quedan registrados en CloudWatch
5. **Extensibilidad**: Fácil agregar nuevos listeners sin modificar código existente
6. **Testabilidad**: Cada componente puede ser testeado independientemente

## Casos de Uso

Los eventos permiten implementar funcionalidades como:

- **Notificaciones**: Enviar email/SMS cuando se crea una nota de venta
- **Analytics**: Actualizar métricas y dashboards
- **Integraciones**: Sincronizar con sistemas externos (ERP, CRM)
- **Auditoría**: Registrar todas las acciones para compliance
- **Workflows**: Disparar procesos de negocio automatizados

## Próximos Pasos

1. Agregar más eventos (quote.updated, quote.deleted, quote.approved, etc.)
2. Implementar handlers para cada evento
3. Agregar tests unitarios y de integración
4. Implementar DLQ (Dead Letter Queue) para eventos fallidos
5. Agregar métricas y alertas en CloudWatch
6. Documentar todos los eventos disponibles

## Ejemplo de Uso

### Agregar un nuevo listener

```typescript
// handlers/events/quoteCreatedNotificationHandler.ts
export const quoteCreatedNotificationHandler = async (
  event: EventBridgeEvent<'quote.created', QuoteCreatedEvent>
): Promise<void> => {
  const quoteData = event.detail;
  
  // Enviar notificación
  const emailService = new EmailService();
  await emailService.send({
    to: 'asesor@example.com',
    subject: `Nueva nota de venta: ${quoteData.numeroCotizacion}`,
    body: `Se ha creado una nueva nota de venta para ${quoteData.clienteNombre}`
  });
};
```

Luego agregar en `serverless.yml`:

```yaml
quoteCreatedNotificationHandler:
  handler: dist/modules/Quotes/handlers/events/quoteCreatedNotificationHandler.handler
  events:
    - eventBridge:
        pattern:
          source:
            - banados.quotes
          detail-type:
            - quote.created
```

## Notas Importantes

- Los eventos son **idempotentes**: Pueden procesarse múltiples veces sin efectos secundarios
- Los eventos son **inmutables**: No se modifican después de ser creados
- Los eventos contienen **toda la información necesaria**: No requieren queries adicionales
- La publicación es **fire-and-forget**: No se espera confirmación

