#!/bin/bash

# Script para configurar S3 y CloudFront para los tres frontends
# Uso: ./setup-cloudfront.sh [region]
# Requiere: AWS CLI configurado con permisos adecuados

set -e

AWS_REGION=${1:-us-east-1}
TIMESTAMP=$(date +%s)

# Nombres de buckets (deben ser únicos globalmente)
ADMIN_BUCKET="banados-admin-frontend-${TIMESTAMP}"
AUTH_BUCKET="banados-auth-frontend-${TIMESTAMP}"
CLIENT_BUCKET="banados-client-frontend-${TIMESTAMP}"

echo "🚀 Configurando infraestructura AWS para los frontends..."
echo "Región: $AWS_REGION"
echo ""

# Función para crear bucket S3
create_s3_bucket() {
  local BUCKET_NAME=$1
  local APP_NAME=$2
  
  echo "📦 Creando bucket S3: $BUCKET_NAME"
  
  # Crear bucket
  aws s3api create-bucket \
    --bucket "$BUCKET_NAME" \
    --region "$AWS_REGION" \
    --create-bucket-configuration LocationConstraint="$AWS_REGION" 2>/dev/null || \
  aws s3api create-bucket \
    --bucket "$BUCKET_NAME" \
    --region us-east-1 2>/dev/null || true
  
  # Deshabilitar Block Public Access PRIMERO (antes de poner la política)
  echo "  ⚙️  Deshabilitando Block Public Access..."
  aws s3api put-public-access-block \
    --bucket "$BUCKET_NAME" \
    --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
  
  # Configurar hosting estático
  echo "  ⚙️  Configurando hosting estático..."
  aws s3 website s3://$BUCKET_NAME/ \
    --index-document index.html \
    --error-document index.html
  
  # Configurar política pública
  echo "  ⚙️  Configurando política pública..."
  cat > /tmp/bucket-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
EOF
  
  aws s3api put-bucket-policy \
    --bucket "$BUCKET_NAME" \
    --policy file:///tmp/bucket-policy.json
  
  # Configurar CORS
  echo "  ⚙️  Configurando CORS..."
  cat > /tmp/cors.json <<EOF
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": []
    }
  ]
}
EOF
  
  aws s3api put-bucket-cors \
    --bucket "$BUCKET_NAME" \
    --cors-configuration file:///tmp/cors.json
  
  echo "  ✅ Bucket $BUCKET_NAME configurado"
  echo ""
}

# Función para crear distribución CloudFront
create_cloudfront_distribution() {
  local BUCKET_NAME=$1
  local APP_NAME=$2
  
  echo "🌐 Creando distribución CloudFront para $APP_NAME..."
  
  # Crear configuración de distribución
  cat > /tmp/cloudfront-config.json <<EOF
{
  "CallerReference": "$APP_NAME-${TIMESTAMP}",
  "Comment": "CloudFront distribution for $APP_NAME",
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-$BUCKET_NAME",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"],
      "CachedMethods": {
        "Quantity": 2,
        "Items": ["GET", "HEAD"]
      }
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000,
    "Compress": true
  },
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-$BUCKET_NAME",
        "DomainName": "$BUCKET_NAME.s3.$AWS_REGION.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "Enabled": true,
  "CustomErrorResponses": {
    "Quantity": 1,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  }
}
EOF
  
  DISTRIBUTION_OUTPUT=$(aws cloudfront create-distribution \
    --distribution-config file:///tmp/cloudfront-config.json)
  
  DISTRIBUTION_ID=$(echo $DISTRIBUTION_OUTPUT | grep -o '"Id": "[^"]*' | cut -d'"' -f4)
  DOMAIN_NAME=$(echo $DISTRIBUTION_OUTPUT | grep -o '"DomainName": "[^"]*' | cut -d'"' -f4)
  
  echo "  ✅ Distribución CloudFront creada: $DISTRIBUTION_ID"
  echo "  🌍 Domain: $DOMAIN_NAME"
  echo ""
  
  # Guardar información
  echo "$APP_NAME|$BUCKET_NAME|$DISTRIBUTION_ID|$DOMAIN_NAME" >> /tmp/cloudfront-info.txt
}

# Crear buckets S3
create_s3_bucket "$ADMIN_BUCKET" "admin-frontend"
create_s3_bucket "$AUTH_BUCKET" "auth-frontend"
create_s3_bucket "$CLIENT_BUCKET" "client-frontend"

# Esperar un momento para que los buckets estén listos
echo "⏳ Esperando que los buckets estén listos..."
sleep 5

# Crear distribuciones CloudFront
echo "🌐 Creando distribuciones CloudFront..."
echo ""
create_cloudfront_distribution "$ADMIN_BUCKET" "admin-frontend"
create_cloudfront_distribution "$AUTH_BUCKET" "auth-frontend"
create_cloudfront_distribution "$CLIENT_BUCKET" "client-frontend"

# Mostrar resumen
echo "═══════════════════════════════════════════════════════════"
echo "✅ Configuración completada!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📋 Resumen de configuración:"
echo ""
cat /tmp/cloudfront-info.txt | while IFS='|' read -r APP BUCKET DIST_ID DOMAIN; do
  echo "  $APP:"
  echo "    Bucket: $BUCKET"
  echo "    CloudFront ID: $DIST_ID"
  echo "    Domain: https://$DOMAIN"
  echo ""
done

echo "📝 Guarda esta información en un archivo .env o en la documentación"
echo ""
echo "⚠️  Nota: Las distribuciones CloudFront pueden tardar 15-20 minutos en estar completamente desplegadas"
echo "   Puedes verificar el estado con:"
echo "   aws cloudfront get-distribution --id <DISTRIBUTION_ID>"

# Limpiar archivos temporales
rm -f /tmp/bucket-policy.json /tmp/cors.json /tmp/cloudfront-config.json /tmp/cloudfront-info.txt

