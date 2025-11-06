#!/bin/bash

# Script de despliegue a S3/CloudFront
# Uso: ./deploy.sh [bucket-name] [cloudfront-distribution-id]

set -e

# Variables de configuración
BUCKET_NAME=${1:-${S3_BUCKET_NAME}}
CLOUDFRONT_ID=${2:-${CLOUDFRONT_DISTRIBUTION_ID}}
AWS_REGION=${AWS_REGION:-us-east-1}

# Validar que se proporcionen los parámetros necesarios
if [ -z "$BUCKET_NAME" ]; then
  echo "Error: Se requiere el nombre del bucket de S3"
  echo "Uso: ./deploy.sh <bucket-name> [cloudfront-distribution-id]"
  echo "O configure las variables de entorno: S3_BUCKET_NAME y CLOUDFRONT_DISTRIBUTION_ID"
  exit 1
fi

echo "🚀 Iniciando despliegue..."
echo "Bucket: $BUCKET_NAME"
echo "Región: $AWS_REGION"

# 1. Construir la aplicación
echo "📦 Construyendo la aplicación..."
npm run build

# 2. Sincronizar archivos con S3
echo "📤 Subiendo archivos a S3..."
aws s3 sync dist/ s3://$BUCKET_NAME/ \
  --region $AWS_REGION \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "*.html" \
  --exclude "service-worker.js"

# 3. Subir archivos HTML con cache diferente
echo "📤 Subiendo archivos HTML..."
aws s3 sync dist/ s3://$BUCKET_NAME/ \
  --region $AWS_REGION \
  --delete \
  --cache-control "public, max-age=0, must-revalidate" \
  --include "*.html"

# 4. Invalidar caché de CloudFront si se proporciona el ID
if [ -n "$CLOUDFRONT_ID" ]; then
  echo "🔄 Invalidando caché de CloudFront..."
  INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id $CLOUDFRONT_ID \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text)
  
  echo "✅ Invalidación creada: $INVALIDATION_ID"
  echo "⏳ Esperando a que la invalidación se complete..."
  aws cloudfront wait invalidation-completed \
    --distribution-id $CLOUDFRONT_ID \
    --id $INVALIDATION_ID
fi

echo "✅ Despliegue completado exitosamente!"

