# Configuración de WhatsApp Baileys

## Resumen

Este documento describe cómo configurar y usar el servicio de WhatsApp integrado con Baileys.

## Arquitectura

El sistema de WhatsApp está compuesto por dos partes:

1. **Servicio de WhatsApp** (`whatsapp-baileys/`): Servicio independiente que maneja la conexión con WhatsApp usando Baileys
2. **Módulo Backend** (`backend/src/modules/WhatsApp/`): Handlers serverless que exponen endpoints seguros con autenticación RBAC

## Configuración

### 1. Variables de Entorno

#### Backend (serverless.yml)
```yaml
WHATSAPP_SERVICE_URL: ${env:WHATSAPP_SERVICE_URL, 'http://localhost:3000'}
```

#### Servicio de WhatsApp (whatsapp-baileys/.env)
```env
PORT=3000
AUTO_CONNECT=false
LOG_LEVEL=info
NODE_ENV=development
```

### 2. Iniciar el Servicio de WhatsApp

```bash
cd whatsapp-baileys
npm install
npm run dev
```

El servicio estará disponible en `http://localhost:3000`

### 3. Configurar URL en Backend

Para desarrollo local:
```bash
export WHATSAPP_SERVICE_URL=http://localhost:3000
```

Para producción, configurar en AWS Lambda environment variables:
```
WHATSAPP_SERVICE_URL=https://tu-servicio-whatsapp.com
```

## Uso

### Endpoints del Backend

Todos los endpoints requieren autenticación JWT y permisos RBAC:

#### GET /whatsapp/status
Obtiene el estado de la conexión de WhatsApp.

**Permiso requerido:** `view:whatsapp:status`

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "status": "connected",
    "phoneNumber": "1234567890",
    "isAuthenticated": true
  }
}
```

#### POST /whatsapp/connect
Inicia la conexión con WhatsApp. Muestra un QR Code en la terminal del servidor.

**Permiso requerido:** `manage:whatsapp:connection`

#### POST /whatsapp/disconnect
Desconecta la sesión de WhatsApp.

**Permiso requerido:** `manage:whatsapp:connection`

#### POST /whatsapp/send-message
Envía un mensaje de texto.

**Permiso requerido:** `send:whatsapp:messages`

**Body:**
```json
{
  "to": "1234567890",
  "message": "Hola, este es un mensaje de prueba"
}
```

#### POST /whatsapp/send-image
Envía una imagen con caption opcional.

**Permiso requerido:** `send:whatsapp:messages`

**Body:**
```json
{
  "to": "1234567890",
  "imageUrl": "https://example.com/image.jpg",
  "caption": "Descripción de la imagen"
}
```

## Permisos RBAC

Los siguientes permisos deben ser asignados a los roles apropiados:

1. **view:whatsapp:status** - Ver estado de conexión
2. **manage:whatsapp:connection** - Conectar/desconectar WhatsApp
3. **send:whatsapp:messages** - Enviar mensajes e imágenes

### Sincronizar Permisos

1. Ir a `/roles/permissions` en el admin-frontend
2. Hacer clic en "Sincronizar Permisos"
3. Los nuevos permisos de WhatsApp aparecerán en la lista
4. Asignar permisos a los roles apropiados en `/roles/roles`

## Flujo de Autenticación

1. **Primera vez:**
   - Llamar a `POST /whatsapp/connect`
   - Se generará un QR Code en la terminal del servidor
   - Escanear el QR Code con WhatsApp desde el teléfono
   - La sesión se guardará en `whatsapp-baileys/sessions/`

2. **Sesiones siguientes:**
   - Si la sesión existe, se conectará automáticamente
   - No será necesario escanear el QR Code nuevamente

3. **Reconexión:**
   - El servicio intenta reconectarse automáticamente si se pierde la conexión
   - Máximo 5 intentos con intervalo de 5 segundos

## Notas Importantes

1. **Sesiones:** Las sesiones se guardan en `whatsapp-baileys/sessions/`. No eliminar esta carpeta a menos que quieras autenticarte de nuevo.

2. **Seguridad:** La carpeta `sessions/` contiene credenciales de autenticación. No compartir ni versionar en git.

3. **Producción:** En producción, el servicio de WhatsApp debe estar accesible desde las Lambdas de AWS. Considerar:
   - Desplegar el servicio en un contenedor ECS
   - Usar un ALB o API Gateway
   - Configurar VPC si es necesario

4. **QR Code:** El QR Code se muestra en la terminal del servidor donde corre el servicio de WhatsApp, no en el frontend.

## Troubleshooting

### Error: "WhatsApp no está conectado"
- Verificar que el servicio de WhatsApp esté corriendo
- Verificar que `WHATSAPP_SERVICE_URL` esté configurado correctamente
- Llamar a `POST /whatsapp/connect` para iniciar la conexión

### Error: "Error al obtener estado de WhatsApp"
- Verificar que el servicio de WhatsApp esté accesible desde el backend
- Verificar logs del servicio de WhatsApp
- Verificar conectividad de red

### QR Code no aparece
- Verificar que `qrcode-terminal` esté instalado
- Verificar logs del servicio de WhatsApp
- Intentar desconectar y conectar nuevamente

