# WhatsApp Baileys Service

Servicio de WhatsApp usando Baileys para enviar y recibir mensajes.

## Características

- ✅ Conexión automática con WhatsApp
- ✅ Autenticación mediante QR Code
- ✅ Envío de mensajes de texto
- ✅ Envío de imágenes con caption
- ✅ API REST para integración
- ✅ Manejo de eventos (mensajes recibidos)
- ✅ Reconexión automática
- ✅ Logging estructurado con Pino

## Instalación

```bash
npm install
```

## Configuración

1. Copia el archivo `.env.example` a `.env`:
```bash
cp .env.example .env
```

2. Configura las variables de entorno en `.env`:
- `PORT`: Puerto del servidor Express (default: 3000)
- `AUTO_CONNECT`: Auto-conectar al iniciar (default: false)
- `LOG_LEVEL`: Nivel de logging (default: info)
- `NODE_ENV`: Entorno (development/production)

## Uso

### Desarrollo

```bash
npm run dev
```

### Producción

```bash
npm run build
npm start
```

## API REST

### Obtener estado de conexión

```http
GET /api/whatsapp/status
```

Respuesta:
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

### Conectar a WhatsApp

```http
POST /api/whatsapp/connect
```

Esto iniciará la conexión y mostrará un QR Code en la terminal. Escanea el código con WhatsApp.

### Desconectar

```http
POST /api/whatsapp/disconnect
```

### Enviar mensaje de texto

```http
POST /api/whatsapp/send-message
Content-Type: application/json

{
  "to": "1234567890",
  "message": "Hola, este es un mensaje de prueba"
}
```

Respuesta:
```json
{
  "success": true,
  "messageId": "3EB0123456789ABCDEF"
}
```

### Enviar imagen

```http
POST /api/whatsapp/send-image
Content-Type: application/json

{
  "to": "1234567890",
  "imageUrl": "https://example.com/image.jpg",
  "caption": "Descripción de la imagen"
}
```

## Estructura del Proyecto

```
whatsapp-baileys/
├── config/
│   └── config.ts          # Configuración de la aplicación
├── src/
│   ├── services/
│   │   └── WhatsAppService.ts  # Servicio principal de WhatsApp
│   ├── routes/
│   │   └── whatsapp.routes.ts   # Rutas de la API REST
│   ├── types/
│   │   └── index.ts             # Tipos TypeScript
│   ├── logger.ts                # Configuración de logging
│   └── index.ts                 # Punto de entrada
├── sessions/                     # Sesiones de WhatsApp (generado)
├── logs/                        # Logs de la aplicación
└── dist/                        # Código compilado
```

## Notas Importantes

1. **Sesiones**: Las sesiones se guardan en la carpeta `sessions/`. No elimines esta carpeta a menos que quieras autenticarte de nuevo.

2. **QR Code**: Al conectar por primera vez, se mostrará un QR Code en la terminal. Escanéalo con WhatsApp desde tu teléfono.

3. **Reconexión**: El servicio intenta reconectarse automáticamente si se pierde la conexión.

4. **Seguridad**: No compartas la carpeta `sessions/` ya que contiene credenciales de autenticación.

## Desarrollo

Para agregar handlers personalizados de mensajes, extiende la clase `WhatsAppService` y sobrescribe el método `onMessageReceived`.

## Troubleshooting

- **Error de conexión**: Verifica que no haya otra instancia corriendo y que la carpeta `sessions/` no esté corrupta.
- **QR Code no aparece**: Verifica que `qrcode-terminal` esté instalado correctamente.
- **Mensajes no se envían**: Verifica que la conexión esté activa con `GET /api/whatsapp/status`.

