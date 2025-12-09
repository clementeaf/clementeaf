#!/bin/bash

# Script para enviar mensaje cuando WhatsApp esté conectado
# Uso: ./send-message-when-ready.sh

PHONE="56959263366"
MESSAGE="Hola, este es un mensaje de prueba desde la API de WhatsApp Baileys"
MAX_ATTEMPTS=60
ATTEMPT=0

echo "⏳ Esperando que WhatsApp se conecte..."
echo "📱 Número destino: $PHONE"
echo "💬 Mensaje: $MESSAGE"
echo ""

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  STATUS=$(curl -s http://localhost:3000/api/whatsapp/status | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('status', 'unknown'))" 2>/dev/null || echo "unknown")
  
  if [ "$STATUS" = "connected" ]; then
    echo "✅ WhatsApp conectado! Enviando mensaje..."
    RESPONSE=$(curl -s -X POST http://localhost:3000/api/whatsapp/send-message \
      -H "Content-Type: application/json" \
      -d "{\"to\": \"$PHONE\", \"message\": \"$MESSAGE\"}")
    
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
    
    SUCCESS=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('success', False))" 2>/dev/null || echo "false")
    
    if [ "$SUCCESS" = "True" ]; then
      echo ""
      echo "✅ Mensaje enviado exitosamente!"
      exit 0
    else
      echo ""
      echo "❌ Error al enviar mensaje"
      exit 1
    fi
  elif [ "$STATUS" = "authenticating" ]; then
    echo "⏳ Estado: authenticating (intento $((ATTEMPT + 1))/$MAX_ATTEMPTS) - Esperando que escanees el QR Code..."
  elif [ "$STATUS" = "connecting" ]; then
    echo "⏳ Estado: connecting (intento $((ATTEMPT + 1))/$MAX_ATTEMPTS)..."
  else
    echo "⏳ Estado: $STATUS (intento $((ATTEMPT + 1))/$MAX_ATTEMPTS)..."
  fi
  
  sleep 2
  ATTEMPT=$((ATTEMPT + 1))
done

echo ""
echo "⏱️  Tiempo de espera agotado. WhatsApp no se conectó."
echo "💡 Asegúrate de escanear el QR Code primero."
exit 1

