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

# 1. Compilar TypeScript
echo "📦 Compilando TypeScript..."
npm run build

# 2. Desplegar con Serverless Framework
echo "🚀 Desplegando a AWS Lambda..."
if [ "$STAGE" = "prod" ]; then
  npm run deploy:aws
else
  npm run deploy
fi

echo ""
echo "✅ Despliegue completado exitosamente!"
echo ""
echo "📋 Información del despliegue:"
echo "   Stage: $STAGE"
echo "   Región: $AWS_REGION"
echo ""
echo "🔍 Para ver los endpoints desplegados:"
echo "   aws apigateway get-rest-apis --query 'items[?name==\`backend-$STAGE\`]'"

