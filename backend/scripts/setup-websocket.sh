#!/bin/bash

# Script para crear WebSocket API Gateway
# Nota: Serverless Framework v3 no crea automáticamente WebSocket APIs
# Este script las crea manualmente

set -e

STAGE=${1:-dev}
REGION=${2:-us-east-1}
SERVICE_NAME="backend"

echo "🔧 Configurando WebSocket API Gateway para Chat..."
echo "Stage: $STAGE"
echo "Región: $REGION"
echo ""

# Obtener IDs de las Lambda functions
echo "📋 Obteniendo IDs de Lambda functions..."

CONNECT_LAMBDA=$(aws lambda get-function-configuration \
  --function-name "${SERVICE_NAME}-${STAGE}-websocketConnect" \
  --region "$REGION" \
  --query 'FunctionArn' \
  --output text 2>/dev/null || echo "")

DISCONNECT_LAMBDA=$(aws lambda get-function-configuration \
  --function-name "${SERVICE_NAME}-${STAGE}-websocketDisconnect" \
  --region "$REGION" \
  --query 'FunctionArn' \
  --output text 2>/dev/null || echo "")

DEFAULT_LAMBDA=$(aws lambda get-function-configuration \
  --function-name "${SERVICE_NAME}-${STAGE}-websocketSendMessage" \
  --region "$REGION" \
  --query 'FunctionArn' \
  --output text 2>/dev/null || echo "")

if [ -z "$CONNECT_LAMBDA" ] || [ -z "$DISCONNECT_LAMBDA" ] || [ -z "$DEFAULT_LAMBDA" ]; then
  echo "❌ Error: No se encontraron las Lambda functions"
  echo "   Asegúrate de que están deployadas: websocketConnect, websocketDisconnect, websocketSendMessage"
  exit 1
fi

echo "✅ Lambda functions encontradas"
echo ""

# Crear WebSocket API
echo "🔌 Creando WebSocket API..."

API_RESPONSE=$(aws apigatewayv2 create-api \
  --name "${SERVICE_NAME}-${STAGE}-websocket" \
  --protocol-type WEBSOCKET \
  --route-selection-expression "\$request.body.action" \
  --region "$REGION" \
  --output json)

API_ID=$(echo "$API_RESPONSE" | jq -r '.ApiId')

if [ -z "$API_ID" ] || [ "$API_ID" = "null" ]; then
  echo "❌ Error al crear WebSocket API"
  exit 1
fi

echo "✅ WebSocket API creada: $API_ID"
echo ""

# Crear Stage
echo "📊 Creando stage..."

aws apigatewayv2 create-stage \
  --api-id "$API_ID" \
  --stage-name "$STAGE" \
  --auto-deploy \
  --region "$REGION" \
  --output json > /dev/null

echo "✅ Stage creado"
echo ""

# Crear integrations y routes
echo "🔗 Configurando integrations y routes..."

# $connect
CONNECT_INTEGRATION=$(aws apigatewayv2 create-integration \
  --api-id "$API_ID" \
  --integration-type AWS_PROXY \
  --integration-uri "$CONNECT_LAMBDA" \
  --region "$REGION" \
  --query 'IntegrationId' \
  --output text)

aws apigatewayv2 create-route \
  --api-id "$API_ID" \
  --route-key "\$connect" \
  --target "integrations/$CONNECT_INTEGRATION" \
  --region "$REGION" > /dev/null

echo "✅ Route \$connect configurada"

# $disconnect
DISCONNECT_INTEGRATION=$(aws apigatewayv2 create-integration \
  --api-id "$API_ID" \
  --integration-type AWS_PROXY \
  --integration-uri "$DISCONNECT_LAMBDA" \
  --region "$REGION" \
  --query 'IntegrationId' \
  --output text)

aws apigatewayv2 create-route \
  --api-id "$API_ID" \
  --route-key "\$disconnect" \
  --target "integrations/$DISCONNECT_INTEGRATION" \
  --region "$REGION" > /dev/null

echo "✅ Route \$disconnect configurada"

# $default
DEFAULT_INTEGRATION=$(aws apigatewayv2 create-integration \
  --api-id "$API_ID" \
  --integration-type AWS_PROXY \
  --integration-uri "$DEFAULT_LAMBDA" \
  --region "$REGION" \
  --query 'IntegrationId' \
  --output text)

aws apigatewayv2 create-route \
  --api-id "$API_ID" \
  --route-key "\$default" \
  --target "integrations/$DEFAULT_INTEGRATION" \
  --region "$REGION" > /dev/null

echo "✅ Route \$default configurada"
echo ""

# Crear permisos en Lambda
echo "🔐 Configurando permisos en Lambda..."

for FUNCTION_NAME in "${SERVICE_NAME}-${STAGE}-websocketConnect" "${SERVICE_NAME}-${STAGE}-websocketDisconnect" "${SERVICE_NAME}-${STAGE}-websocketSendMessage"; do
  aws lambda add-permission \
    --function-name "$FUNCTION_NAME" \
    --statement-id "apigateway-invoke" \
    --action "lambda:InvokeFunction" \
    --principal "apigateway.amazonaws.com" \
    --region "$REGION" 2>/dev/null || echo "   (Permisos ya existen para $FUNCTION_NAME)"
done

echo "✅ Permisos configurados"
echo ""

# Obtener endpoint
ENDPOINT="wss://${API_ID}.execute-api.${REGION}.amazonaws.com/${STAGE}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ WebSocket API Gateway creada exitosamente"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Información del WebSocket API:"
echo "   API ID: $API_ID"
echo "   Stage: $STAGE"
echo "   Región: $REGION"
echo ""
echo "🌐 WebSocket Endpoint:"
echo "   $ENDPOINT"
echo ""
echo "📝 Actualiza el frontend con este endpoint en:"
echo "   admin-frontend/src/hooks/useWebSocket.ts"
echo "   VITE_WS_URL=$ENDPOINT"
echo ""
echo "✨ El WebSocket está listo para usar"
