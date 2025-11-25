#!/bin/bash

# Script para verificar que Cognito está configurado en todas las funciones Lambda
# Uso: ./scripts/verify-cognito-config.sh [stage]

set -e

STAGE=${1:-dev}
REGION=${AWS_REGION:-us-east-1}

echo "🔍 Verificando configuración de Cognito en funciones Lambda..."
echo "Stage: $STAGE"
echo "Región: $REGION"
echo ""

# Funciones que necesitan Cognito
COGNITO_FUNCTIONS=(
  "backend-${STAGE}-login"
  "backend-${STAGE}-register"
  "backend-${STAGE}-me"
  "backend-${STAGE}-refreshToken"
)

ALL_OK=true

for func_name in "${COGNITO_FUNCTIONS[@]}"; do
  echo "Verificando: $func_name"
  
  COGNITO_POOL_ID=$(aws lambda get-function-configuration \
    --function-name "$func_name" \
    --region "$REGION" \
    --query 'Environment.Variables.COGNITO_USER_POOL_ID' \
    --output text 2>/dev/null || echo "")
  
  COGNITO_CLIENT_ID=$(aws lambda get-function-configuration \
    --function-name "$func_name" \
    --region "$REGION" \
    --query 'Environment.Variables.COGNITO_CLIENT_ID' \
    --output text 2>/dev/null || echo "")
  
  if [ -z "$COGNITO_POOL_ID" ] || [ "$COGNITO_POOL_ID" = "None" ] || [ "$COGNITO_POOL_ID" = "" ]; then
    echo "  ❌ COGNITO_USER_POOL_ID no configurado"
    ALL_OK=false
  else
    echo "  ✅ COGNITO_USER_POOL_ID: $COGNITO_POOL_ID"
  fi
  
  if [ -z "$COGNITO_CLIENT_ID" ] || [ "$COGNITO_CLIENT_ID" = "None" ] || [ "$COGNITO_CLIENT_ID" = "" ]; then
    echo "  ❌ COGNITO_CLIENT_ID no configurado"
    ALL_OK=false
  else
    echo "  ✅ COGNITO_CLIENT_ID: $COGNITO_CLIENT_ID"
  fi
  
  echo ""
done

if [ "$ALL_OK" = true ]; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "✅ Todas las funciones tienen Cognito configurado"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  exit 0
else
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "❌ Algunas funciones no tienen Cognito configurado"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Solución: Despliega nuevamente con las variables configuradas:"
  echo "  export COGNITO_USER_POOL_ID=\"us-east-1_fjM7EFRH1\""
  echo "  export COGNITO_CLIENT_ID=\"3b46mfqscajmhvtiddblborqt9\""
  echo "  export COGNITO_REGION=\"us-east-1\""
  echo "  export COGNITO_AUTO_CONFIRM=\"true\""
  echo "  npm run deploy"
  exit 1
fi

