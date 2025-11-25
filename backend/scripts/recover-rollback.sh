#!/bin/bash

# Script para recuperar de UPDATE_ROLLBACK_FAILED o DELETE_FAILED
# Este script intenta recuperarse automáticamente de estados fallidos de CloudFormation
# Uso: ./scripts/recover-rollback.sh [stage] [region]

set -e

STAGE=${1:-dev}
REGION=${2:-us-east-1}
STACK_NAME="backend-${STAGE}"

echo "🔧 Recuperando stack de UPDATE_ROLLBACK o DELETE_FAILED..."
echo "Stack: $STACK_NAME"
echo "Región: $REGION"
echo ""

# Verificar que AWS CLI esté disponible
if ! command -v aws &> /dev/null; then
  echo "❌ Error: AWS CLI no está instalado"
  exit 1
fi

# Obtener estado actual del stack
echo "📋 Verificando estado actual del stack..."
STACK_STATUS=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query 'Stacks[0].StackStatus' \
  --output text 2>/dev/null || echo "DOES_NOT_EXIST")

echo "Estado actual: $STACK_STATUS"
echo ""

if [ "$STACK_STATUS" = "DOES_NOT_EXIST" ]; then
  echo "✅ El stack no existe. Se creará nuevo en el próximo deploy."
  exit 0
fi

# Caso 1: UPDATE_ROLLBACK_FAILED
if [ "$STACK_STATUS" = "UPDATE_ROLLBACK_FAILED" ]; then
  echo "🔄 Intentando continuar update rollback..."
  
  if aws cloudformation continue-update-rollback \
    --stack-name "$STACK_NAME" \
    --region "$REGION" 2>/dev/null; then
    echo "✅ Continue update rollback iniciado exitosamente"
    
    # Esperar a que se complete
    echo "⏳ Esperando a que se complete el rollback..."
    aws cloudformation wait stack-update-complete \
      --stack-name "$STACK_NAME" \
      --region "$REGION" 2>/dev/null || true
    
    echo "✅ Stack recuperado. Estado final:"
    FINAL_STATUS=$(aws cloudformation describe-stacks \
      --stack-name "$STACK_NAME" \
      --region "$REGION" \
      --query 'Stacks[0].StackStatus' \
      --output text)
    echo "   $FINAL_STATUS"
  else
    echo "⚠️  Continue update rollback falló o no fue posible"
    echo "   Procediendo a eliminar stack para recrearlo..."
    
    # Intentar eliminar el stack bloqueado
    aws cloudformation delete-stack \
      --stack-name "$STACK_NAME" \
      --region "$REGION" 2>/dev/null || true
    
    echo "✅ Stack eliminado. Se creará nuevo en el próximo deploy."
  fi
  exit 0
fi

# Caso 2: DELETE_FAILED
if [ "$STACK_STATUS" = "DELETE_FAILED" ]; then
  echo "🔄 Stack en DELETE_FAILED. Intentando eliminar nuevamente..."
  
  # Obtener recursos que pueden estar bloqueando
  echo "📦 Buscando recursos que pueden estar bloqueando..."
  BLOCKING_RESOURCES=$(aws cloudformation describe-stack-resources \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query 'StackResources[?ResourceStatus==`DELETE_FAILED`].{LogicalId:LogicalResourceId,Type:ResourceType}' \
    --output text 2>/dev/null || echo "")
  
  if [ ! -z "$BLOCKING_RESOURCES" ]; then
    echo "⚠️  Recursos bloqueando eliminación:"
    echo "$BLOCKING_RESOURCES"
    echo ""
    echo "⚠️  Puedes necesitar limpiar estos recursos manualmente antes de continuar"
  fi
  
  # Intentar eliminar nuevamente
  aws cloudformation delete-stack \
    --stack-name "$STACK_NAME" \
    --region "$REGION" 2>/dev/null || true
  
  echo "✅ Comando delete-stack enviado. Esperando..."
  
  # Esperar con timeout de 5 minutos
  timeout 300 aws cloudformation wait stack-delete-complete \
    --stack-name "$STACK_NAME" \
    --region "$REGION" 2>/dev/null || true
  
  FINAL_STATUS=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query 'Stacks[0].StackStatus' \
    --output text 2>/dev/null || echo "DOES_NOT_EXIST")
  
  if [ "$FINAL_STATUS" = "DOES_NOT_EXIST" ]; then
    echo "✅ Stack eliminado exitosamente"
  else
    echo "❌ Stack aún existe con estado: $FINAL_STATUS"
    echo "   Requiere intervención manual"
    exit 1
  fi
  exit 0
fi

# Caso 3: ROLLBACK_COMPLETE (puede redesplegarse)
if [ "$STACK_STATUS" = "ROLLBACK_COMPLETE" ]; then
  echo "ℹ️  Stack en ROLLBACK_COMPLETE"
  echo "   Puede redesplegarse con: ./deploy.sh $STAGE"
  exit 0
fi

# Caso 4: CREATE_FAILED
if [ "$STACK_STATUS" = "CREATE_FAILED" ]; then
  echo "❌ Stack en CREATE_FAILED"
  echo "   Eliminando stack fallido para poder recrearlo..."
  
  aws cloudformation delete-stack \
    --stack-name "$STACK_NAME" \
    --region "$REGION" 2>/dev/null || true
  
  echo "✅ Stack eliminado. Puedes redirigirte a: ./deploy.sh $STAGE"
  exit 0
fi

# Otros estados
echo "ℹ️  Stack en estado: $STACK_STATUS"
echo ""
echo "Opciones:"
echo "1. Si el stack está en ROLLBACK_COMPLETE o UPDATE_COMPLETE:"
echo "   ./deploy.sh $STAGE"
echo ""
echo "2. Para ver detalles del stack:"
echo "   aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION"
echo ""
echo "3. Para ver eventos recientes:"
echo "   aws cloudformation describe-stack-events --stack-name $STACK_NAME --region $REGION --max-items 10"
