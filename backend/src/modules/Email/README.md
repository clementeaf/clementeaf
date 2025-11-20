# Módulo de Email

Módulo para enviar correos electrónicos usando AWS SES (Simple Email Service).

## Configuración

### Variables de Entorno

- `SES_FROM_EMAIL`: Dirección de correo desde la cual se enviarán los correos (default: `noreply@banados.com`)
- `AWS_REGION`: Región de AWS donde está configurado SES (default: `us-east-1`)
- `AWS_ENDPOINT_URL`: URL de endpoint para desarrollo local con LocalStack (opcional)

### Permisos IAM

El módulo requiere los siguientes permisos en AWS:
- `ses:SendEmail`
- `ses:SendRawEmail`

Estos permisos están configurados en `serverless.yml`.

## Uso

### Desde un Handler

```typescript
import { EmailService } from '../modules/Email/services/EmailService';

const emailService = new EmailService();

// Enviar correo de texto plano
await emailService.sendTextEmail(
  'destinatario@example.com',
  'Asunto del correo',
  'Cuerpo del correo en texto plano'
);

// Enviar correo HTML
await emailService.sendHtmlEmail(
  'destinatario@example.com',
  'Asunto del correo',
  '<h1>Correo HTML</h1><p>Contenido del correo</p>'
);

// Enviar correo con opciones avanzadas
await emailService.sendEmail({
  to: ['destinatario1@example.com', 'destinatario2@example.com'],
  subject: 'Asunto del correo',
  body: 'Cuerpo del correo',
  htmlBody: '<h1>Correo HTML</h1>',
  cc: 'copia@example.com',
  bcc: 'copia-oculta@example.com',
  replyTo: 'respuesta@example.com',
  from: 'remitente@example.com'
});
```

### Endpoint HTTP

**POST** `/email/send`

**Body:**
```json
{
  "to": "destinatario@example.com",
  "subject": "Asunto del correo",
  "body": "Cuerpo del correo en texto plano",
  "htmlBody": "<h1>Correo HTML</h1>",
  "cc": "copia@example.com",
  "bcc": "copia-oculta@example.com",
  "replyTo": "respuesta@example.com"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Correo enviado exitosamente",
  "messageId": "0100018a-1234-5678-9abc-def012345678-000000"
}
```

**Respuesta de error:**
```json
{
  "success": false,
  "message": "Error al enviar correo",
  "error": "Mensaje de error específico"
}
```

## Características

- ✅ Soporte para correos de texto plano y HTML
- ✅ Múltiples destinatarios (to, cc, bcc)
- ✅ Validación de direcciones de correo
- ✅ Configuración de remitente personalizado
- ✅ Soporte para reply-to
- ✅ Manejo de errores robusto
- ✅ Compatible con LocalStack para desarrollo local

## Notas Importantes

1. **Verificación de dominio/email en SES**: Antes de usar el servicio en producción, asegúrate de verificar el dominio o la dirección de correo en AWS SES.

2. **Sandbox Mode**: Si tu cuenta de AWS SES está en modo sandbox, solo podrás enviar correos a direcciones verificadas.

3. **Límites de SES**: Revisa los límites de tu cuenta de SES (número de correos por día, tasa de envío, etc.).

4. **Desarrollo local**: Para desarrollo local con LocalStack, configura `AWS_ENDPOINT_URL=http://localhost:4566`.

