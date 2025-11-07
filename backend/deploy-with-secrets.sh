#!/bin/bash

# Script para desplegar backend usando credenciales de AWS Secrets Manager
# Uso: ./deploy-with-secrets.sh [stage]

set -e

STAGE=${1:-dev}
SECRET_NAME="banados-db-credentials"
AWS_REGION="us-east-1"

echo "🚀 Desplegando backend con credenciales de AWS Secrets Manager..."
echo "Stage: $STAGE"
echo ""

# Obtener credenciales de Secrets Manager
echo "🔐 Obteniendo credenciales de AWS Secrets Manager..."
SECRET_JSON=$(aws secretsmanager get-secret-value \
  --secret-id "$SECRET_NAME" \
  --region "$AWS_REGION" \
  --query 'SecretString' \
  --output text)

if [ -z "$SECRET_JSON" ] || [ "$SECRET_JSON" = "None" ]; then
  echo "❌ Error: No se pudo obtener el secreto de AWS Secrets Manager"
  echo "   Ejecuta primero: ./setup-secrets.sh <DB_PASSWORD> [JWT_SECRET]"
  exit 1
fi

# Extraer variables de entorno del JSON usando jq o python
if command -v jq &> /dev/null; then
  export DB_HOST=$(echo "$SECRET_JSON" | jq -r '.DB_HOST')
  export DB_PORT=$(echo "$SECRET_JSON" | jq -r '.DB_PORT')
  export DB_USERNAME=$(echo "$SECRET_JSON" | jq -r '.DB_USERNAME')
  export DB_PASSWORD=$(echo "$SECRET_JSON" | jq -r '.DB_PASSWORD')
  export DB_DATABASE=$(echo "$SECRET_JSON" | jq -r '.DB_DATABASE')
  export JWT_SECRET=$(echo "$SECRET_JSON" | jq -r '.JWT_SECRET')
  export JWT_EXPIRES_IN=$(echo "$SECRET_JSON" | jq -r '.JWT_EXPIRES_IN')
else
  # Fallback usando python si jq no está disponible
  export DB_HOST=$(echo "$SECRET_JSON" | python3 -c "import sys, json; print(json.load(sys.stdin)['DB_HOST'])")
  export DB_PORT=$(echo "$SECRET_JSON" | python3 -c "import sys, json; print(json.load(sys.stdin)['DB_PORT'])")
  export DB_USERNAME=$(echo "$SECRET_JSON" | python3 -c "import sys, json; print(json.load(sys.stdin)['DB_USERNAME'])")
  export DB_PASSWORD=$(echo "$SECRET_JSON" | python3 -c "import sys, json; print(json.load(sys.stdin)['DB_PASSWORD'])")
  export DB_DATABASE=$(echo "$SECRET_JSON" | python3 -c "import sys, json; print(json.load(sys.stdin)['DB_DATABASE'])")
  export JWT_SECRET=$(echo "$SECRET_JSON" | python3 -c "import sys, json; print(json.load(sys.stdin)['JWT_SECRET'])")
  export JWT_EXPIRES_IN=$(echo "$SECRET_JSON" | python3 -c "import sys, json; print(json.load(sys.stdin)['JWT_EXPIRES_IN'])")
fi

echo "✅ Credenciales obtenidas exitosamente"
echo "   DB_HOST: $DB_HOST"
echo "   DB_PORT: $DB_PORT"
echo "   DB_USERNAME: $DB_USERNAME"
echo "   DB_DATABASE: $DB_DATABASE"
echo ""

# Compilar TypeScript
echo "📦 Compilando TypeScript..."
npm run build

# Desplegar con Serverless Framework
echo "🚀 Desplegando a AWS Lambda..."
if [ "$STAGE" = "prod" ]; then
  serverless deploy --stage prod --force
else
  serverless deploy --force
fi

echo ""
echo "✅ Despliegue completado exitosamente!"
echo ""
echo "📋 Información del despliegue:"
echo "   Stage: $STAGE"
echo "   Región: $AWS_REGION"
echo "   DB_HOST: $DB_HOST"
echo ""

