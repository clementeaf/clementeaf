# Probar la API de WhatsApp Baileys

## Iniciar el Servicio

```bash
cd whatsapp-baileys
npm run dev
```

El servicio estará disponible en `http://localhost:3000`

## Endpoints Disponibles

### 1. Health Check
```bash
curl http://localhost:3000/health
```

### 2. Obtener Estado
```bash
curl http://localhost:3000/api/whatsapp/status
```

Respuesta:
```json
{
  "success": true,
  "data": {
    "status": "disconnected",
    "isAuthenticated": false
  }
}
```

### 3. Conectar
```bash
curl -X POST http://localhost:3000/api/whatsapp/connect
```

**Nota:** El QR Code aparecerá en la terminal donde corre el servicio, no en la respuesta HTTP.

### 4. Verificar Estado (después de conectar)
```bash
curl http://localhost:3000/api/whatsapp/status
```

Si está autenticando, verás:
```json
{
  "success": true,
  "data": {
    "status": "authenticating",
    "qrCode": "data:image/png;base64,...",
    "isAuthenticated": false
  }
}
```

Si está conectado:
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

### 5. Enviar Mensaje de Texto
```bash
curl -X POST http://localhost:3000/api/whatsapp/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "to": "1234567890",
    "message": "Hola, este es un mensaje de prueba"
  }'
```

**Formato del número:** Incluir código de país sin el signo `+`. Ejemplo: `56912345678` para Chile.

### 6. Enviar Imagen
```bash
curl -X POST http://localhost:3000/api/whatsapp/send-image \
  -H "Content-Type: application/json" \
  -d '{
    "to": "1234567890",
    "imageUrl": "https://example.com/image.jpg",
    "caption": "Descripción de la imagen"
  }'
```

### 7. Desconectar
```bash
curl -X POST http://localhost:3000/api/whatsapp/disconnect
```

## Script de Prueba Automatizado

Ejecuta el script incluido:

```bash
./test-api.sh
```

## Usando Postman o Insomnia

1. **Base URL:** `http://localhost:3000/api/whatsapp`
2. **Health Check:** `GET http://localhost:3000/health`
3. **Status:** `GET http://localhost:3000/api/whatsapp/status`
4. **Connect:** `POST http://localhost:3000/api/whatsapp/connect`
5. **Send Message:** `POST http://localhost:3000/api/whatsapp/send-message`
   - Body (JSON):
     ```json
     {
       "to": "1234567890",
       "message": "Tu mensaje aquí"
     }
     ```
6. **Send Image:** `POST http://localhost:3000/api/whatsapp/send-image`
   - Body (JSON):
     ```json
     {
       "to": "1234567890",
       "imageUrl": "https://example.com/image.jpg",
       "caption": "Opcional"
     }
     ```
7. **Disconnect:** `POST http://localhost:3000/api/whatsapp/disconnect`

## Flujo de Prueba Recomendado

1. ✅ Iniciar el servicio: `npm run dev`
2. ✅ Verificar health: `curl http://localhost:3000/health`
3. ✅ Ver estado inicial: `curl http://localhost:3000/api/whatsapp/status`
4. ✅ Conectar: `curl -X POST http://localhost:3000/api/whatsapp/connect`
5. ⏳ Esperar y escanear QR (aparece en la terminal del servidor)
6. ✅ Verificar estado conectado: `curl http://localhost:3000/api/whatsapp/status`
7. ✅ Enviar mensaje de prueba
8. ✅ Desconectar: `curl -X POST http://localhost:3000/api/whatsapp/disconnect`

## Notas Importantes

- El QR Code **NO** aparece en la respuesta HTTP, solo en la terminal del servidor
- El número debe incluir código de país sin el signo `+`
- La sesión se guarda en `sessions/`, no necesitarás escanear el QR cada vez
- Si el servicio está desconectado, los endpoints de envío devolverán error 503

