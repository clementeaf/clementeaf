#!/bin/bash

# Script de despliegue del backend a AWS Lambda
# Uso: ./deploy.sh [stage]
# Requiere: AWS CLI configurado con permisos adecuados

set -e

STAGE=${1:-dev}
AWS_REGION=${AWS_REGION:-us-east-1}

echo "🚀 Desplegando backend a AWS Lambda..."
echo "Stage: $STAGE"
echo "Región: $AWS_REGION"
echo ""

# Verificar si hay un rollback fallido y recuperar si es necesario
echo "🔍 Verificando estado del stack antes de desplegar..."
STACK_STATUS=$(aws cloudformation describe-stacks \
  --stack-name "backend-${STAGE}" \
  --region "$AWS_REGION" \
  --query 'Stacks[0].StackStatus' \
  --output text 2>/dev/null || echo "")

if [[ "$STACK_STATUS" == *"FAILED"* ]] || [[ "$STACK_STATUS" == *"ROLLBACK"* ]]; then
  echo "⚠️  ⚠️  Stack en estado problemático: $STACK_STATUS"
  echo "🔎 Intentando recuperarse automáticamente..."
  echo ""
  
  if [ -f "scripts/recover-rollback.sh" ]; then
    chmod +x scripts/recover-rollback.sh
    if ./scripts/recover-rollback.sh "$STAGE" "$AWS_REGION"; then
      echo ""
      echo "✅ Stack recuperado exitosamente"
    else
      echo ""
      echo "❌ Error: No se pudo recuperar el stack automáticamente"
      echo "   Ejecuta manualmente: ./scripts/recover-rollback.sh $STAGE $AWS_REGION"
      exit 1
    fi
  else
    echo "❌ Error: Script de recuperación no encontrado"
    exit 1
  fi
  echo ""
fi

# Ejecutar validaciones pre-deploy
if [ -f "scripts/pre-deploy-check.sh" ]; then
  echo "🔍 Ejecutando validaciones pre-deploy..."
  chmod +x scripts/pre-deploy-check.sh
  if ! ./scripts/pre-deploy-check.sh "$STAGE"; then
    echo ""
    echo "❌ Las validaciones pre-deploy fallaron. Corrige los errores antes de continuar."
    exit 1
  fi
  echo ""
else
  echo "⚠️  Script de validación pre-deploy no encontrado. Continuando sin validaciones..."
  echo ""
fi

# Verificar que las variables de entorno necesarias estén configuradas
if [ "$STAGE" = "prod" ]; then
  echo "⚠️  Desplegando a PRODUCCIÓN"
  echo ""
  echo "Verificando variables de entorno necesarias..."
  
  if [ -z "$DB_HOST" ]; then
    echo "❌ Error: DB_HOST no está configurado"
    echo "   Configura la variable de entorno DB_HOST con la dirección de tu base de datos RDS"
    exit 1
  fi
  
  if [ -z "$DB_PASSWORD" ]; then
    echo "❌ Error: DB_PASSWORD no está configurado"
    echo "   Configura la variable de entorno DB_PASSWORD con la contraseña de tu base de datos"
    exit 1
  fi
  
  if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "your-secret-key-change-in-production" ]; then
    echo "❌ Error: JWT_SECRET no está configurado o usa el valor por defecto"
    echo "   Configura la variable de entorno JWT_SECRET con un secreto seguro"
    exit 1
  fi
  
  echo "✅ Variables de entorno verificadas"
  echo ""
fi

# 1. Compilar TypeScript (ya compilado en pre-deploy, pero verificamos)
echo "📦 Verificando compilación de TypeScript..."
if [ ! -d "dist" ]; then
  echo "📦 Compilando TypeScript..."
  npm run build
else
  echo "✅ Directorio dist/ existe (ya compilado)"
fi

# Verificar que la compilación fue exitosa
if [ $? -ne 0 ]; then
  echo "❌ Error: La compilación de TypeScript falló"
  exit 1
fi

# Verificar que los archivos compilados existen
echo "🔍 Verificando archivos compilados..."
if [ ! -d "dist" ]; then
  echo "❌ Error: El directorio dist/ no existe después de la compilación"
  exit 1
fi

# Verificar que al menos algunos handlers críticos existen
echo "🔍 Verificando handlers críticos..."
CRITICAL_HANDLERS=(
  "dist/modules/Users/handlers/login.js"
  "dist/modules/Users/handlers/register.js"
  "dist/handlers/hello.js"
)

MISSING_COUNT=0
for handler in "${CRITICAL_HANDLERS[@]}"; do
  if [ ! -f "$handler" ]; then
    echo "❌ Error: Handler crítico no encontrado: $handler"
    MISSING_COUNT=$((MISSING_COUNT + 1))
  fi
done

if [ $MISSING_COUNT -gt 0 ]; then
  echo ""
  echo "❌ Error: $MISSING_COUNT handlers críticos faltantes"
  echo "   Verifica que la compilación de TypeScript fue exitosa"
  echo "   Ejecuta: npm run build"
  exit 1
fi
echo "✅ Todos los handlers críticos encontrados"

# 2. Desplegar con Serverless Framework
echo ""
echo "🚀 Desplegando a AWS Lambda..."
if [ "$STAGE" = "prod" ]; then
  npm run deploy:aws
else
  npm run deploy
fi

# Verificar que el despliegue fue exitoso
if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Error: El despliegue falló"
  echo ""
  echo "🔍 Comandos útiles para diagnosticar:"
  echo "   - Ver eventos del stack: aws cloudformation describe-stack-events --stack-name backend-$STAGE --region $AWS_REGION"
  echo "   - Ver estado del stack: aws cloudformation describe-stacks --stack-name backend-$STAGE --region $AWS_REGION"
  exit 1
fi

echo ""
echo "✅ Despliegue completado exitosamente!"
echo ""
echo "📋 Información del despliegue:"
echo "   Stage: $STAGE"
echo "   Región: $AWS_REGION"
echo ""

# Obtener URL del API Gateway
echo "🔍 Obteniendo URL del API Gateway..."
API_URL=$(aws cloudformation describe-stacks \
  --stack-name "backend-${STAGE}" \
  --region "$AWS_REGION" \
  --query 'Stacks[0].Outputs[?OutputKey==`ServiceEndpoint`].OutputValue' \
  --output text 2>/dev/null || echo "")

if [ -n "$API_URL" ]; then
  echo "   URL del API: $API_URL"
  echo ""
  echo "📝 Actualiza el frontend con esta URL:"
  echo "   VITE_API_URL=$API_URL"
else
  echo "   ⚠️  No se pudo obtener la URL del API Gateway automáticamente"
  echo "   Ejecuta manualmente:"
  echo "   aws apigateway get-rest-apis --query 'items[?name==\`backend-$STAGE\`]' --region $AWS_REGION"
fi

echo ""
echo "🔍 Para ver los endpoints desplegados:"
echo "   aws apigateway get-rest-apis --query 'items[?name==\`backend-$STAGE\`]' --region $AWS_REGION"

