#!/bin/bash

# Script para probar la API de WhatsApp Baileys
# Asegúrate de que el servicio esté corriendo en http://localhost:3000

BASE_URL="http://localhost:3000/api/whatsapp"

echo "🧪 Probando API de WhatsApp Baileys"
echo "===================================="
echo ""

# 1. Health Check
echo "1️⃣ Health Check:"
curl -s http://localhost:3000/health | jq '.' || echo "❌ Servicio no disponible"
echo ""
echo "---"
echo ""

# 2. Obtener estado
echo "2️⃣ Obtener estado de conexión:"
curl -s -X GET "$BASE_URL/status" | jq '.' || echo "❌ Error al obtener estado"
echo ""
echo "---"
echo ""

# 3. Conectar (esto mostrará QR en la terminal del servidor)
echo "3️⃣ Iniciar conexión (QR aparecerá en la terminal del servidor):"
curl -s -X POST "$BASE_URL/connect" | jq '.'
echo ""
echo "⏳ Espera 10 segundos para que se genere el QR..."
sleep 10
echo ""
echo "---"
echo ""

# 4. Verificar estado después de conectar
echo "4️⃣ Estado después de conectar:"
curl -s -X GET "$BASE_URL/status" | jq '.'
echo ""
echo "---"
echo ""

# 5. Enviar mensaje (solo si está conectado)
echo "5️⃣ Enviar mensaje de prueba (requiere conexión activa):"
echo "   Descomenta y ajusta el número para probar:"
echo "   curl -X POST \"$BASE_URL/send-message\" \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"to\": \"1234567890\", \"message\": \"Hola desde la API\"}'"
echo ""
echo "---"
echo ""

# 6. Desconectar
echo "6️⃣ Desconectar:"
echo "   curl -X POST \"$BASE_URL/disconnect\""
echo ""
echo "✅ Pruebas completadas"
echo ""
echo "💡 Tip: Usa 'jq' para formatear JSON mejor:"
echo "   curl -s \"$BASE_URL/status\" | jq '.'"

