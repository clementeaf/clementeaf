#!/bin/bash

# Script para configurar AWS Cognito User Pool y Client
# Uso: ./scripts/setup-cognito.sh [region]

set -e

REGION=${1:-us-east-1}
STACK_NAME="banados-cognito-setup"

echo "🔧 Configurando AWS Cognito..."
echo "Región: $REGION"
echo ""

# Verificar que AWS CLI esté configurado
if ! aws sts get-caller-identity &>/dev/null; then
  echo "❌ Error: AWS CLI no está configurado"
  echo "   Ejecuta: aws configure"
  exit 1
fi

echo "✅ AWS CLI configurado correctamente"
echo ""

# Crear User Pool
echo "📦 Creando User Pool..."
USER_POOL_RESPONSE=$(aws cognito-idp create-user-pool \
  --pool-name "banados-user-pool" \
  --region "$REGION" \
  --auto-verified-attributes email \
  --policies "PasswordPolicy={MinimumLength=8,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true,RequireSymbols=false}" \
  --schema \
    Name=email,AttributeDataType=String,Required=true,Mutable=true \
    Name=name,AttributeDataType=String,Required=false,Mutable=true \
  --query 'UserPool.{Id:Id,Arn:Arn}' \
  --output json)

USER_POOL_ID=$(echo "$USER_POOL_RESPONSE" | jq -r '.Id')
USER_POOL_ARN=$(echo "$USER_POOL_RESPONSE" | jq -r '.Arn')

if [ -z "$USER_POOL_ID" ] || [ "$USER_POOL_ID" == "null" ]; then
  echo "❌ Error: No se pudo crear el User Pool"
  exit 1
fi

echo "✅ User Pool creado: $USER_POOL_ID"
echo ""

# Crear User Pool Client
echo "📦 Creando User Pool Client..."
CLIENT_RESPONSE=$(aws cognito-idp create-user-pool-client \
  --user-pool-id "$USER_POOL_ID" \
  --client-name "banados-client" \
  --region "$REGION" \
  --no-generate-secret \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH \
  --query 'UserPoolClient.{ClientId:ClientId}' \
  --output json)

CLIENT_ID=$(echo "$CLIENT_RESPONSE" | jq -r '.ClientId')

if [ -z "$CLIENT_ID" ] || [ "$CLIENT_ID" == "null" ]; then
  echo "❌ Error: No se pudo crear el User Pool Client"
  exit 1
fi

echo "✅ User Pool Client creado: $CLIENT_ID"
echo ""

# Configurar auto-confirmación (opcional, para desarrollo)
echo "⚙️  Configurando auto-confirmación..."
aws cognito-idp update-user-pool \
  --user-pool-id "$USER_POOL_ID" \
  --region "$REGION" \
  --auto-verified-attributes email \
  --verification-message-template "EmailMessage={Your verification code is {####}.}" \
  --email-verification-message "Your verification code is {####}." \
  --email-verification-subject "Your verification code" \
  &>/dev/null || true

echo "✅ Auto-confirmación configurada"
echo ""

# Mostrar resumen
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Configuración de Cognito completada"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Información de configuración:"
echo ""
echo "COGNITO_USER_POOL_ID=$USER_POOL_ID"
echo "COGNITO_CLIENT_ID=$CLIENT_ID"
echo "COGNITO_REGION=$REGION"
echo "COGNITO_AUTO_CONFIRM=true"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Agrega estas variables a tu entorno:"
echo ""
echo "export COGNITO_USER_POOL_ID=\"$USER_POOL_ID\""
echo "export COGNITO_CLIENT_ID=\"$CLIENT_ID\""
echo "export COGNITO_REGION=\"$REGION\""
echo "export COGNITO_AUTO_CONFIRM=\"true\""
echo ""
echo "O agrégalas a tu archivo .env o serverless.yml"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

