#!/bin/bash

# Script para desplegar backend con configuración de RDS
# Uso: ./deploy-with-rds.sh [DB_PASSWORD] [JWT_SECRET]

set -e

STAGE=${STAGE:-dev}
AWS_REGION="us-east-1"
DB_INSTANCE_IDENTIFIER="banados-db"

echo "🚀 Desplegando backend con configuración de RDS..."
echo "Stage: $STAGE"
echo ""

# Obtener endpoint de RDS
echo "🔍 Obteniendo información de RDS..."
DB_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier "$DB_INSTANCE_IDENTIFIER" \
  --region "$AWS_REGION" \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)

if [ -z "$DB_ENDPOINT" ] || [ "$DB_ENDPOINT" = "None" ]; then
  echo "❌ Error: No se pudo obtener el endpoint de RDS"
  echo "   Verifica que la instancia RDS existe y está disponible"
  exit 1
fi

echo "✅ Endpoint de RDS: $DB_ENDPOINT"
echo ""

# Configurar variables de entorno
DB_HOST="$DB_ENDPOINT"
DB_PORT="5432"
DB_USERNAME="postgres"
DB_DATABASE="banados_db"

# Obtener contraseña de RDS desde parámetro o generar una nueva
if [ -z "$1" ]; then
  echo "⚠️  No se proporcionó contraseña de RDS"
  echo "   Usando contraseña desde variable de entorno DB_PASSWORD"
  if [ -z "$DB_PASSWORD" ]; then
    echo "❌ Error: DB_PASSWORD no está configurado"
    echo "   Proporciona la contraseña como primer argumento o configura DB_PASSWORD"
    echo "   Uso: ./deploy-with-rds.sh <DB_PASSWORD> [JWT_SECRET]"
    exit 1
  fi
else
  DB_PASSWORD="$1"
fi

# Obtener JWT_SECRET desde parámetro o generar uno nuevo
if [ -z "$2" ]; then
  if [ -z "$JWT_SECRET" ]; then
    echo "⚠️  No se proporcionó JWT_SECRET, generando uno nuevo..."
    JWT_SECRET=$(openssl rand -base64 32 | tr -d '/@\" ' | head -c 64)
    echo "   JWT_SECRET generado (guárdalo de forma segura)"
  fi
else
  JWT_SECRET="$2"
fi

echo "📋 Configuración de variables de entorno:"
echo "   DB_HOST: $DB_HOST"
echo "   DB_PORT: $DB_PORT"
echo "   DB_USERNAME: $DB_USERNAME"
echo "   DB_DATABASE: $DB_DATABASE"
echo "   JWT_SECRET: [configurado]"
echo ""

# Exportar variables de entorno
export DB_HOST
export DB_PORT
export DB_USERNAME
export DB_PASSWORD
export DB_DATABASE
export JWT_SECRET
export JWT_EXPIRES_IN="${JWT_EXPIRES_IN:-7d}"

# Compilar TypeScript
echo "📦 Compilando TypeScript..."
npm run build

# Desplegar con Serverless Framework
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
echo "   DB_HOST: $DB_HOST"
echo ""
echo "⚠️  IMPORTANTE: Guarda estas credenciales de forma segura:"
echo "   DB_PASSWORD: [configurado]"
echo "   JWT_SECRET: $JWT_SECRET"
echo ""

