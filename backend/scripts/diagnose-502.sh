#!/bin/bash

# Script de diagnóstico para error 502 Bad Gateway
# Uso: ./scripts/diagnose-502.sh [function-name] [stage]

set -e

FUNCTION_NAME=${1:-login}
STAGE=${2:-dev}
REGION=${AWS_REGION:-us-east-1}
FULL_FUNCTION_NAME="backend-${STAGE}-${FUNCTION_NAME}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Diagnóstico de Error 502 Bad Gateway"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Función: $FULL_FUNCTION_NAME"
echo "Stage: $STAGE"
echo "Región: $REGION"
echo ""

# 1. Verificar que el código está compilado
echo "1️⃣ Verificando compilación del código..."
if [ ! -f "dist/modules/Users/handlers/${FUNCTION_NAME}.js" ]; then
  echo "  ❌ Código no compilado: dist/modules/Users/handlers/${FUNCTION_NAME}.js no existe"
  echo "  💡 Solución: Ejecuta 'npm run build' o 'tsc'"
  COMPILED=false
else
  echo "  ✅ Código compilado encontrado"
  COMPILED=true
fi
echo ""

# 2. Verificar que la función Lambda existe
echo "2️⃣ Verificando existencia de la función Lambda..."
if aws lambda get-function --function-name "$FULL_FUNCTION_NAME" --region "$REGION" > /dev/null 2>&1; then
  echo "  ✅ Función Lambda existe"
  LAMBDA_EXISTS=true
else
  echo "  ❌ Función Lambda no existe: $FULL_FUNCTION_NAME"
  echo "  💡 Solución: Despliega el backend con 'npm run deploy'"
  LAMBDA_EXISTS=false
fi
echo ""

# 3. Verificar variables de entorno de Cognito
if [ "$LAMBDA_EXISTS" = true ]; then
  echo "3️⃣ Verificando variables de entorno de Cognito..."
  
  COGNITO_POOL_ID=$(aws lambda get-function-configuration \
    --function-name "$FULL_FUNCTION_NAME" \
    --region "$REGION" \
    --query 'Environment.Variables.COGNITO_USER_POOL_ID' \
    --output text 2>/dev/null || echo "")
  
  COGNITO_CLIENT_ID=$(aws lambda get-function-configuration \
    --function-name "$FULL_FUNCTION_NAME" \
    --region "$REGION" \
    --query 'Environment.Variables.COGNITO_CLIENT_ID' \
    --output text 2>/dev/null || echo "")
  
  if [ -z "$COGNITO_POOL_ID" ] || [ "$COGNITO_POOL_ID" = "None" ] || [ "$COGNITO_POOL_ID" = "" ]; then
    echo "  ❌ COGNITO_USER_POOL_ID no configurado"
    COGNITO_OK=false
  else
    echo "  ✅ COGNITO_USER_POOL_ID: $COGNITO_POOL_ID"
    COGNITO_OK=true
  fi
  
  if [ -z "$COGNITO_CLIENT_ID" ] || [ "$COGNITO_CLIENT_ID" = "None" ] || [ "$COGNITO_CLIENT_ID" = "" ]; then
    echo "  ❌ COGNITO_CLIENT_ID no configurado"
    COGNITO_OK=false
  else
    echo "  ✅ COGNITO_CLIENT_ID: $COGNITO_CLIENT_ID"
    COGNITO_OK=true
  fi
  echo ""
  
  # 4. Verificar configuración de la función
  echo "4️⃣ Verificando configuración de la función..."
  TIMEOUT=$(aws lambda get-function-configuration \
    --function-name "$FULL_FUNCTION_NAME" \
    --region "$REGION" \
    --query 'Timeout' \
    --output text 2>/dev/null || echo "unknown")
  
  MEMORY=$(aws lambda get-function-configuration \
    --function-name "$FULL_FUNCTION_NAME" \
    --region "$REGION" \
    --query 'MemorySize' \
    --output text 2>/dev/null || echo "unknown")
  
  RUNTIME=$(aws lambda get-function-configuration \
    --function-name "$FULL_FUNCTION_NAME" \
    --region "$REGION" \
    --query 'Runtime' \
    --output text 2>/dev/null || echo "unknown")
  
  echo "  Timeout: ${TIMEOUT}s"
  echo "  Memory: ${MEMORY}MB"
  echo "  Runtime: $RUNTIME"
  echo ""
  
  # 5. Obtener últimos logs de CloudWatch
  echo "5️⃣ Últimos logs de CloudWatch (últimas 20 líneas)..."
  LOG_GROUP="/aws/lambda/$FULL_FUNCTION_NAME"
  
  if aws logs describe-log-groups --log-group-name-prefix "$LOG_GROUP" --region "$REGION" | grep -q "$LOG_GROUP"; then
    echo "  📋 Logs recientes:"
    aws logs tail "$LOG_GROUP" --region "$REGION" --since 1h --format short 2>/dev/null | tail -20 || echo "  ⚠️  No se pudieron obtener logs"
  else
    echo "  ⚠️  Grupo de logs no encontrado: $LOG_GROUP"
    echo "  💡 Esto puede indicar que la función nunca se ha ejecutado"
  fi
  echo ""
  
  # 6. Verificar VPC (puede causar problemas de conectividad)
  echo "6️⃣ Verificando configuración de VPC..."
  VPC_CONFIG=$(aws lambda get-function-configuration \
    --function-name "$FULL_FUNCTION_NAME" \
    --region "$REGION" \
    --query 'VpcConfig' \
    --output json 2>/dev/null || echo "{}")
  
  if echo "$VPC_CONFIG" | grep -q '"VpcId"'; then
    echo "  ⚠️  Función está en VPC (puede causar problemas de conectividad con Cognito)"
    echo "  💡 Verifica que la VPC tenga NAT Gateway o VPC Endpoint para AWS services"
  else
    echo "  ✅ Función no está en VPC"
  fi
  echo ""
fi

# 7. Resumen y recomendaciones
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Resumen y Recomendaciones"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$COMPILED" = false ]; then
  echo "❌ PROBLEMA: Código no compilado"
  echo "   Solución: cd backend && npm run build"
  echo ""
fi

if [ "$LAMBDA_EXISTS" = false ]; then
  echo "❌ PROBLEMA: Función Lambda no existe"
  echo "   Solución: cd backend && npm run deploy"
  echo ""
fi

if [ "$LAMBDA_EXISTS" = true ] && [ "$COGNITO_OK" = false ]; then
  echo "❌ PROBLEMA: Variables de Cognito no configuradas"
  echo "   Solución:"
  echo "   export COGNITO_USER_POOL_ID=\"us-east-1_ET27TiV8Y\""
  echo "   export COGNITO_CLIENT_ID=\"3ido9jo5thqnl5c05vlna3c0no\""
  echo "   export COGNITO_REGION=\"us-east-1\""
  echo "   export COGNITO_AUTO_CONFIRM=\"true\""
  echo "   npm run deploy"
  echo ""
fi

if [ "$COMPILED" = true ] && [ "$LAMBDA_EXISTS" = true ] && [ "$COGNITO_OK" = true ]; then
  echo "✅ Configuración básica correcta"
  echo ""
  echo "💡 Si el error persiste, revisa los logs de CloudWatch:"
  echo "   aws logs tail /aws/lambda/$FULL_FUNCTION_NAME --follow --region $REGION"
  echo ""
  echo "💡 Posibles causas adicionales:"
  echo "   - Error en el código que causa excepción no manejada"
  echo "   - Timeout (la función tarda más de ${TIMEOUT}s)"
  echo "   - Problema de conectividad con Cognito (si está en VPC)"
  echo "   - Problema con la base de datos (si se inicializa)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

