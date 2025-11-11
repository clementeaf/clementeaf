#!/bin/bash

# Script simple para obtener la URL del API Gateway desde CloudFormation outputs
# Uso: ./scripts/get-api-url.sh

STACK_NAME=${1:-backend-dev}
REGION=${AWS_REGION:-us-east-1}

# Obtener la URL desde los outputs de CloudFormation
API_URL=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='ServiceEndpoint'].OutputValue" \
  --output text 2>/dev/null)

if [ -z "$API_URL" ] || [ "$API_URL" = "None" ]; then
  echo "❌ No se pudo obtener la URL del API Gateway"
  echo "💡 Asegúrate de haber desplegado el backend primero"
  exit 1
fi

echo "$API_URL"

