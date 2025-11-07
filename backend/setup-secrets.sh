#!/bin/bash

# Script para configurar AWS Secrets Manager con las credenciales de RDS
# Uso: ./setup-secrets.sh [DB_PASSWORD] [JWT_SECRET]

set -e

SECRET_NAME="banados-db-credentials"
AWS_REGION="us-east-1"
DB_INSTANCE_IDENTIFIER="banados-db"

echo "🔐 Configurando AWS Secrets Manager..."
echo ""

# Obtener endpoint de RDS
DB_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier "$DB_INSTANCE_IDENTIFIER" \
  --region "$AWS_REGION" \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)

if [ -z "$DB_ENDPOINT" ] || [ "$DB_ENDPOINT" = "None" ]; then
  echo "❌ Error: No se pudo obtener el endpoint de RDS"
  exit 1
fi

echo "✅ Endpoint de RDS: $DB_ENDPOINT"
echo ""

# Obtener contraseña de RDS
if [ -z "$1" ]; then
  echo "⚠️  No se proporcionó contraseña de RDS"
  echo "   Por favor, proporciona la contraseña como primer argumento"
  echo "   Uso: ./setup-secrets.sh <DB_PASSWORD> [JWT_SECRET]"
  exit 1
fi

DB_PASSWORD="$1"
JWT_SECRET="${2:-$(openssl rand -base64 32 | tr -d '/@\" ' | head -c 64)}"

# Crear o actualizar el secreto
SECRET_JSON=$(cat <<EOF
{
  "DB_HOST": "$DB_ENDPOINT",
  "DB_PORT": "5432",
  "DB_USERNAME": "postgres",
  "DB_PASSWORD": "$DB_PASSWORD",
  "DB_DATABASE": "banados_db",
  "JWT_SECRET": "$JWT_SECRET",
  "JWT_EXPIRES_IN": "7d"
}
EOF
)

echo "🔐 Creando/actualizando secreto en AWS Secrets Manager..."
if aws secretsmanager describe-secret --secret-id "$SECRET_NAME" --region "$AWS_REGION" >/dev/null 2>&1; then
  echo "   Actualizando secreto existente..."
  aws secretsmanager update-secret \
    --secret-id "$SECRET_NAME" \
    --secret-string "$SECRET_JSON" \
    --region "$AWS_REGION" >/dev/null
else
  echo "   Creando nuevo secreto..."
  aws secretsmanager create-secret \
    --name "$SECRET_NAME" \
    --secret-string "$SECRET_JSON" \
    --region "$AWS_REGION" >/dev/null
fi

echo "✅ Secreto configurado exitosamente"
echo ""
echo "📋 Información del secreto:"
echo "   Nombre: $SECRET_NAME"
echo "   Región: $AWS_REGION"
echo ""
echo "⚠️  IMPORTANTE: Guarda estas credenciales de forma segura:"
echo "   DB_PASSWORD: $DB_PASSWORD"
echo "   JWT_SECRET: $JWT_SECRET"
echo ""
echo "🔧 Para usar el secreto en el despliegue:"
echo "   ./deploy-with-secrets.sh"

