#!/bin/bash

# Script para identificar y corregir problemas que causan rollbacks
# Uso: ./scripts/fix-deployment-issues.sh

set -e

echo "🔍 Analizando problemas que causan rollbacks..."
echo ""

# 1. Verificar que AWS_REGION no esté en environment
echo "1️⃣ Verificando variables de entorno reservadas..."
if grep -q "AWS_REGION:" serverless.yml; then
  echo "   ❌ AWS_REGION encontrado en environment (variable reservada)"
  echo "   ✅ Ya fue eliminado"
else
  echo "   ✅ AWS_REGION no está en environment"
fi

# 2. Verificar estado del stack
echo ""
echo "2️⃣ Verificando estado del stack..."
STACK_STATUS=$(aws cloudformation describe-stacks \
  --stack-name backend-dev \
  --region us-east-1 \
  --query 'Stacks[0].StackStatus' \
  --output text 2>/dev/null || echo "NOT_FOUND")

if [ "$STACK_STATUS" = "NOT_FOUND" ]; then
  echo "   ✅ Stack no existe, se creará nuevo"
elif [[ "$STACK_STATUS" == *"ROLLBACK"* ]] || [[ "$STACK_STATUS" == *"FAILED"* ]]; then
  echo "   ⚠️  Stack en estado problemático: $STACK_STATUS"
  echo "   🔧 Intentando continuar rollback..."
  aws cloudformation continue-update-rollback \
    --stack-name backend-dev \
    --region us-east-1 \
    --resources-to-skip $(aws cloudformation list-stack-resources \
      --stack-name backend-dev \
      --region us-east-1 \
      --query 'StackResourceSummaries[?ResourceStatus==`UPDATE_FAILED`].LogicalResourceId' \
      --output text 2>/dev/null | tr '\t' ' ') \
    2>/dev/null || echo "   ⚠️  No se pudo continuar rollback automáticamente"
  
  echo "   ⏳ Esperando a que termine el rollback..."
  aws cloudformation wait stack-rollback-complete \
    --stack-name backend-dev \
    --region us-east-1 \
    2>/dev/null || echo "   ⚠️  Rollback en progreso o completado"
else
  echo "   ✅ Stack en estado estable: $STACK_STATUS"
fi

# 3. Verificar que todos los handlers existen
echo ""
echo "3️⃣ Verificando handlers compilados..."
MISSING_HANDLERS=0
while IFS= read -r handler_path; do
  if [ ! -f "$handler_path" ]; then
    echo "   ❌ Handler faltante: $handler_path"
    MISSING_HANDLERS=$((MISSING_HANDLERS + 1))
  fi
done < <(grep -E "handler: dist/" serverless.yml | sed 's/.*handler: //' | sed 's/\.handler$/.js/')

if [ $MISSING_HANDLERS -eq 0 ]; then
  echo "   ✅ Todos los handlers existen"
else
  echo "   ⚠️  Faltan $MISSING_HANDLERS handlers - ejecutando build..."
  npm run build
fi

# 4. Verificar tamaño del paquete
echo ""
echo "4️⃣ Verificando configuración de paquete..."
if ! grep -q "excludeDevDependencies: true" serverless.yml; then
  echo "   ❌ excludeDevDependencies no está habilitado"
  echo "   🔧 Esto puede causar paquetes muy grandes"
else
  echo "   ✅ excludeDevDependencies está habilitado"
fi

# 5. Verificar variables de entorno problemáticas
echo ""
echo "5️⃣ Verificando variables de entorno..."
PROBLEMATIC_VARS=0

# Variables que no deberían estar vacías en producción
if grep -q "COGNITO_USER_POOL_ID:.*''" serverless.yml; then
  echo "   ⚠️  COGNITO_USER_POOL_ID tiene valor vacío por defecto"
  PROBLEMATIC_VARS=$((PROBLEMATIC_VARS + 1))
fi

if [ $PROBLEMATIC_VARS -eq 0 ]; then
  echo "   ✅ Variables de entorno OK"
fi

# 6. Verificar VPC
echo ""
echo "6️⃣ Verificando configuración VPC..."
VPC_CONFIGURED=$(grep -c "vpc:" serverless.yml || echo "0")
if [ "$VPC_CONFIGURED" -gt 0 ]; then
  echo "   ✅ VPC configurado"
  echo "   ⚠️  Asegúrate de que los Security Groups y Subnets existen"
else
  echo "   ℹ️  VPC no configurado"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Análisis completado"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Próximos pasos:"
echo ""
echo "1. Asegúrate de que el stack esté en estado estable"
echo "2. Configura las variables de entorno necesarias"
echo "3. Ejecuta: npm run build"
echo "4. Ejecuta: npm run deploy"
echo ""

