#!/bin/bash

# Script para configurar variables de entorno de Cognito en producción
# Uso: ./scripts/configure-cognito-production.sh [stage]

set -e

STAGE=${1:-dev}
REGION=${AWS_REGION:-us-east-1}

echo "🔧 Configurando Cognito para producción (stage: $STAGE)"
echo ""

# Valores de Cognito (configurados anteriormente)
COGNITO_USER_POOL_ID="us-east-1_fjM7EFRH1"
COGNITO_CLIENT_ID="3b46mfqscajmhvtiddblborqt9"
COGNITO_REGION="us-east-1"
COGNITO_AUTO_CONFIRM="true"

echo "📋 Variables a configurar:"
echo "  COGNITO_USER_POOL_ID=$COGNITO_USER_POOL_ID"
echo "  COGNITO_CLIENT_ID=$COGNITO_CLIENT_ID"
echo "  COGNITO_REGION=$COGNITO_REGION"
echo "  COGNITO_AUTO_CONFIRM=$COGNITO_AUTO_CONFIRM"
echo ""

# Opción 1: Usar AWS Systems Manager Parameter Store
echo "📦 Opción 1: Usando AWS Systems Manager Parameter Store..."
echo ""

# Crear parámetros en Parameter Store
aws ssm put-parameter \
  --name "/banados/$STAGE/COGNITO_USER_POOL_ID" \
  --value "$COGNITO_USER_POOL_ID" \
  --type "String" \
  --overwrite \
  --region "$REGION" 2>/dev/null || echo "  ⚠️  Parámetro ya existe, actualizando..."

aws ssm put-parameter \
  --name "/banados/$STAGE/COGNITO_CLIENT_ID" \
  --value "$COGNITO_CLIENT_ID" \
  --type "String" \
  --overwrite \
  --region "$REGION" 2>/dev/null || echo "  ⚠️  Parámetro ya existe, actualizando..."

aws ssm put-parameter \
  --name "/banados/$STAGE/COGNITO_REGION" \
  --value "$COGNITO_REGION" \
  --type "String" \
  --overwrite \
  --region "$REGION" 2>/dev/null || echo "  ⚠️  Parámetro ya existe, actualizando..."

aws ssm put-parameter \
  --name "/banados/$STAGE/COGNITO_AUTO_CONFIRM" \
  --value "$COGNITO_AUTO_CONFIRM" \
  --type "String" \
  --overwrite \
  --region "$REGION" 2>/dev/null || echo "  ⚠️  Parámetro ya existe, actualizando..."

echo "✅ Parámetros creados en Parameter Store"
echo ""

# Opción 2: Actualizar variables de entorno en el stack de CloudFormation
echo "📦 Opción 2: Actualizando variables de entorno en serverless.yml..."
echo ""
echo "⚠️  IMPORTANTE: Necesitas desplegar nuevamente con estas variables:"
echo ""
echo "export COGNITO_USER_POOL_ID=\"$COGNITO_USER_POOL_ID\""
echo "export COGNITO_CLIENT_ID=\"$COGNITO_CLIENT_ID\""
echo "export COGNITO_REGION=\"$COGNITO_REGION\""
echo "export COGNITO_AUTO_CONFIRM=\"$COGNITO_AUTO_CONFIRM\""
echo ""
echo "Luego ejecuta:"
echo "  cd backend"
echo "  npm run deploy:aws  # para producción"
echo "  # o"
echo "  npm run deploy      # para dev"
echo ""

# Opción 3: Usar AWS Secrets Manager (más seguro)
echo "📦 Opción 3: Usando AWS Secrets Manager (recomendado para producción)..."
echo ""

SECRET_NAME="banados/$STAGE/cognito-config"

SECRET_VALUE=$(cat <<EOF
{
  "COGNITO_USER_POOL_ID": "$COGNITO_USER_POOL_ID",
  "COGNITO_CLIENT_ID": "$COGNITO_CLIENT_ID",
  "COGNITO_REGION": "$COGNITO_REGION",
  "COGNITO_AUTO_CONFIRM": "$COGNITO_AUTO_CONFIRM"
}
EOF
)

aws secretsmanager create-secret \
  --name "$SECRET_NAME" \
  --secret-string "$SECRET_VALUE" \
  --region "$REGION" 2>/dev/null || \
aws secretsmanager update-secret \
  --secret-id "$SECRET_NAME" \
  --secret-string "$SECRET_VALUE" \
  --region "$REGION" 2>/dev/null

echo "✅ Secreto creado/actualizado en Secrets Manager: $SECRET_NAME"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Configuración completada"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Próximos pasos:"
echo ""
echo "1. Configura las variables de entorno antes de desplegar:"
echo "   export COGNITO_USER_POOL_ID=\"$COGNITO_USER_POOL_ID\""
echo "   export COGNITO_CLIENT_ID=\"$COGNITO_CLIENT_ID\""
echo "   export COGNITO_REGION=\"$COGNITO_REGION\""
echo "   export COGNITO_AUTO_CONFIRM=\"$COGNITO_AUTO_CONFIRM\""
echo ""
echo "2. Despliega el backend:"
echo "   cd backend"
echo "   npm run deploy:aws  # para producción"
echo ""
echo "3. Verifica que las variables estén en el stack:"
echo "   aws cloudformation describe-stacks \\"
echo "     --stack-name backend-$STAGE \\"
echo "     --region $REGION \\"
echo "     --query 'Stacks[0].Parameters'"
echo ""

