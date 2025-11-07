#!/bin/bash

# Script para crear y configurar instancia RDS PostgreSQL
# Uso: ./setup-rds.sh

set -e

DB_INSTANCE_IDENTIFIER="banados-db"
DB_NAME="banados_db"
DB_USERNAME="postgres"
# Generar contraseña válida para RDS (solo caracteres ASCII imprimibles excepto '/', '@', '"', ' ')
DB_PASSWORD="${DB_PASSWORD:-$(openssl rand -base64 24 | tr -d '/@\" ' | head -c 32)}"
DB_CLASS="db.t3.micro"
DB_STORAGE=20
AWS_REGION="us-east-1"

echo "🗄️  Configurando base de datos RDS PostgreSQL..."
echo ""

# Verificar si la instancia ya existe
echo "🔍 Verificando si la instancia RDS ya existe..."
EXISTING_DB=$(aws rds describe-db-instances \
  --db-instance-identifier "$DB_INSTANCE_IDENTIFIER" \
  --region "$AWS_REGION" \
  --query 'DBInstances[0].[DBInstanceStatus,Endpoint.Address]' \
  --output text 2>/dev/null || echo "NOT_FOUND")

if [ "$EXISTING_DB" != "NOT_FOUND" ] && [ "$EXISTING_DB" != "None" ]; then
  echo "✅ La instancia RDS ya existe"
  DB_STATUS=$(echo "$EXISTING_DB" | cut -f1)
  DB_ENDPOINT=$(echo "$EXISTING_DB" | cut -f2)
  
  echo "   Estado: $DB_STATUS"
  echo "   Endpoint: $DB_ENDPOINT"
  echo ""
  
  if [ "$DB_STATUS" = "available" ]; then
    echo "✅ La base de datos está disponible"
    echo ""
    echo "📋 Información de conexión:"
    echo "   DB_HOST: $DB_ENDPOINT"
    echo "   DB_PORT: 5432"
    echo "   DB_USERNAME: $DB_USERNAME"
    echo "   DB_DATABASE: $DB_NAME"
    echo ""
    echo "⚠️  Si no recuerdas la contraseña, necesitarás resetearla en la consola de AWS"
    echo ""
    exit 0
  else
    echo "⏳ La base de datos está en estado: $DB_STATUS"
    echo "   Esperando a que esté disponible..."
    
    aws rds wait db-instance-available \
      --db-instance-identifier "$DB_INSTANCE_IDENTIFIER" \
      --region "$AWS_REGION"
    
    DB_ENDPOINT=$(aws rds describe-db-instances \
      --db-instance-identifier "$DB_INSTANCE_IDENTIFIER" \
      --region "$AWS_REGION" \
      --query 'DBInstances[0].Endpoint.Address' \
      --output text)
    
    echo "✅ La base de datos está disponible"
    echo "   Endpoint: $DB_ENDPOINT"
    echo ""
    exit 0
  fi
fi

# Crear la instancia RDS
echo "🚀 Creando instancia RDS PostgreSQL..."
echo ""
echo "Configuración:"
echo "   Identificador: $DB_INSTANCE_IDENTIFIER"
echo "   Clase: $DB_CLASS"
echo "   Almacenamiento: ${DB_STORAGE}GB"
echo "   Usuario: $DB_USERNAME"
echo "   Base de datos: $DB_NAME"
echo "   Región: $AWS_REGION"
echo ""

# Generar contraseña si no se proporcionó
if [ -z "$DB_PASSWORD" ]; then
  DB_PASSWORD=$(openssl rand -base64 24 | tr -d '/@\" ' | head -c 32)
  echo "🔑 Contraseña generada automáticamente"
  echo ""
fi

# Crear la instancia
echo "⏳ Creando instancia RDS (esto puede tardar 10-15 minutos)..."
aws rds create-db-instance \
  --db-instance-identifier "$DB_INSTANCE_IDENTIFIER" \
  --db-instance-class "$DB_CLASS" \
  --engine postgres \
  --master-username "$DB_USERNAME" \
  --master-user-password "$DB_PASSWORD" \
  --allocated-storage "$DB_STORAGE" \
  --db-name "$DB_NAME" \
  --backup-retention-period 7 \
  --storage-type gp2 \
  --publicly-accessible \
  --region "$AWS_REGION" \
  --no-multi-az \
  --no-deletion-protection

echo ""
echo "✅ Instancia RDS creada exitosamente"
echo ""
echo "⏳ Esperando a que la instancia esté disponible (esto puede tardar 10-15 minutos)..."
aws rds wait db-instance-available \
  --db-instance-identifier "$DB_INSTANCE_IDENTIFIER" \
  --region "$AWS_REGION"

# Obtener el endpoint
DB_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier "$DB_INSTANCE_IDENTIFIER" \
  --region "$AWS_REGION" \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)

echo ""
echo "✅ Base de datos RDS configurada y disponible"
echo ""
echo "📋 Información de conexión:"
echo "   DB_HOST: $DB_ENDPOINT"
echo "   DB_PORT: 5432"
echo "   DB_USERNAME: $DB_USERNAME"
echo "   DB_PASSWORD: $DB_PASSWORD"
echo "   DB_DATABASE: $DB_NAME"
echo ""
echo "⚠️  IMPORTANTE: Guarda esta contraseña de forma segura"
echo ""
echo "🔧 Para configurar las variables de entorno para el despliegue:"
echo ""
echo "export DB_HOST=$DB_ENDPOINT"
echo "export DB_PORT=5432"
echo "export DB_USERNAME=$DB_USERNAME"
echo "export DB_PASSWORD='$DB_PASSWORD'"
echo "export DB_DATABASE=$DB_NAME"
echo "export JWT_SECRET='$(openssl rand -base64 32)'"
echo ""
echo "🚀 Luego puedes desplegar el backend con:"
echo "   cd backend && ./deploy.sh prod"

