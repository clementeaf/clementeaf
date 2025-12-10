#!/bin/bash

# Script de validación pre-deploy
# Verifica que todo esté listo antes de desplegar
# Uso: ./scripts/pre-deploy-check.sh [stage]

set -e

STAGE=${1:-dev}
MAX_PACKAGE_SIZE_MB=250
MAX_PACKAGE_SIZE_BYTES=$((MAX_PACKAGE_SIZE_MB * 1024 * 1024))

echo "🔍 Ejecutando validaciones pre-deploy..."
echo "Stage: $STAGE"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Función para reportar error
report_error() {
  echo -e "${RED}❌ Error: $1${NC}"
  ERRORS=$((ERRORS + 1))
}

# Función para reportar warning
report_warning() {
  echo -e "${YELLOW}⚠️  Warning: $1${NC}"
  WARNINGS=$((WARNINGS + 1))
}

# Función para reportar éxito
report_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

# 1. Verificar que estamos en el directorio correcto
if [ ! -f "serverless.yml" ]; then
  report_error "No se encontró serverless.yml. Ejecuta este script desde el directorio backend/"
  exit 1
fi

# 2. Verificar que TypeScript está disponible (local o global)
if ! command -v tsc &> /dev/null && [ ! -f "node_modules/.bin/tsc" ]; then
  report_error "TypeScript no está instalado. Ejecuta: npm install"
  exit 1
fi

# 3. Verificar que node_modules existe
if [ ! -d "node_modules" ]; then
  report_error "node_modules no existe. Ejecuta: npm install"
  exit 1
fi

# 4. Compilar TypeScript
echo "📦 Compilando TypeScript..."
if ! npm run build; then
  report_error "La compilación de TypeScript falló"
  exit 1
fi
report_success "Compilación de TypeScript exitosa"

# 5. Verificar que dist/ existe
if [ ! -d "dist" ]; then
  report_error "El directorio dist/ no existe después de la compilación"
  exit 1
fi
report_success "Directorio dist/ existe"

# 6. Verificar handlers críticos
echo ""
echo "🔍 Verificando handlers críticos..."
CRITICAL_HANDLERS=(
  "dist/modules/Users/handlers/login.js"
  "dist/modules/Users/handlers/register.js"
  "dist/modules/Users/handlers/me.js"
  "dist/modules/Clients/handlers/getAllClients.js"
  "dist/modules/Clients/handlers/getClientById.js"
)

MISSING_HANDLERS=0
for handler in "${CRITICAL_HANDLERS[@]}"; do
  if [ ! -f "$handler" ]; then
    report_error "Handler crítico no encontrado: $handler"
    MISSING_HANDLERS=$((MISSING_HANDLERS + 1))
  else
    report_success "Handler encontrado: $handler"
  fi
done

if [ $MISSING_HANDLERS -gt 0 ]; then
  report_error "$MISSING_HANDLERS handlers críticos faltantes"
  exit 1
fi

# 7. Verificar entidades TypeORM
echo ""
echo "🔍 Verificando entidades TypeORM..."
ENTITY_PATTERNS=(
  "dist/modules/**/*.entity.js"
  "dist/modules/**/entities/*.entity.js"
)

ENTITY_FOUND=0
for pattern in "${ENTITY_PATTERNS[@]}"; do
  if ls $pattern 1> /dev/null 2>&1; then
    ENTITY_COUNT=$(ls $pattern 2>/dev/null | wc -l | tr -d ' ')
    if [ "$ENTITY_COUNT" -gt 0 ]; then
      report_success "Encontradas $ENTITY_COUNT entidades con patrón: $pattern"
      ENTITY_FOUND=1
    fi
  fi
done

if [ $ENTITY_FOUND -eq 0 ]; then
  report_warning "No se encontraron entidades TypeORM. Verifica que las entidades estén siendo compiladas correctamente."
fi

# 8. Verificar tamaño de node_modules (aproximado)
echo ""
echo "🔍 Verificando tamaño de dependencias..."
if [ -d "node_modules" ]; then
  NODE_MODULES_SIZE=$(du -sm node_modules 2>/dev/null | cut -f1)
  if [ "$NODE_MODULES_SIZE" -gt 500 ]; then
    report_warning "node_modules es muy grande (${NODE_MODULES_SIZE}MB). Considera usar excludeDevDependencies."
  else
    report_success "Tamaño de node_modules: ${NODE_MODULES_SIZE}MB"
  fi
fi

# 9. Verificar configuración de serverless.yml
echo ""
echo "🔍 Verificando configuración de serverless.yml..."

# Verificar que excludeDevDependencies está habilitado
if ! grep -q "excludeDevDependencies: true" serverless.yml; then
  report_warning "excludeDevDependencies no está habilitado en serverless.yml"
fi

# Verificar que versionFunctions está en false
if ! grep -q "versionFunctions: false" serverless.yml; then
  report_warning "versionFunctions no está configurado como false. Esto puede causar acumulación de versiones."
fi

# Verificar que useInProcess está habilitado
if ! grep -q "useInProcess: true" serverless.yml; then
  report_warning "useInProcess no está habilitado en serverless.yml (requerido para rutas profundas)"
fi

# 10. Verificar variables de entorno para producción
if [ "$STAGE" = "prod" ]; then
  echo ""
  echo "🔍 Verificando variables de entorno para producción..."
  
  if [ -z "$DB_HOST" ]; then
    report_error "DB_HOST no está configurado para producción"
  else
    report_success "DB_HOST configurado"
  fi
  
  if [ -z "$DB_PASSWORD" ]; then
    report_error "DB_PASSWORD no está configurado para producción"
  else
    report_success "DB_PASSWORD configurado"
  fi
  
  if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "your-secret-key-change-in-production" ]; then
    report_error "JWT_SECRET no está configurado o usa el valor por defecto"
  else
    report_success "JWT_SECRET configurado"
  fi
fi

# 13. Verificar Cognito configuration (critical para auth)
echo ""
echo "🔍 Verificando configuración de Cognito..."
if [ -z "$COGNITO_USER_POOL_ID" ] && ! grep -q "COGNITO_USER_POOL_ID.*:.*'[^']*'" serverless.yml; then
  report_warning "COGNITO_USER_POOL_ID no configurado (requiere variable de entorno o default en serverless.yml)"
else
  report_success "COGNITO_USER_POOL_ID configurado"
fi

# 14. Verificar que package.json tiene dependencias críticas
echo ""
echo "🔍 Verificando dependencias críticas..."
if ! grep -q "typeorm" package.json; then
  report_error "typeorm no se encuentra en package.json"
else
  report_success "typeorm en dependencias"
fi

if ! grep -q "@aws-sdk" package.json; then
  report_error "@aws-sdk no se encuentra en package.json"
else
  report_success "@aws-sdk en dependencias"
fi

if ! grep -q "jwk-to-pem" package.json; then
  report_error "jwk-to-pem no se encuentra en package.json (requerido para Cognito)"
else
  report_success "jwk-to-pem en dependencias"
fi

# 14.1. Verificar que las dependencias de jwk-to-pem están incluidas en serverless.yml
echo ""
echo "🔍 Verificando dependencias de jwk-to-pem en serverless.yml..."
JWK_DEPENDENCIES=(
  "jwk-to-pem"
  "asn1.js"
  "elliptic"
  "safe-buffer"
  "bn.js"
)

MISSING_DEPENDENCIES=0
for dep in "${JWK_DEPENDENCIES[@]}"; do
  if ! grep -q "node_modules/${dep}/" serverless.yml; then
    report_error "Dependencia ${dep} no está incluida en serverless.yml (requerida para jwk-to-pem)"
    MISSING_DEPENDENCIES=$((MISSING_DEPENDENCIES + 1))
  else
    report_success "Dependencia ${dep} incluida en serverless.yml"
  fi
done

if [ $MISSING_DEPENDENCIES -gt 0 ]; then
  report_error "$MISSING_DEPENDENCIES dependencias de jwk-to-pem faltantes en serverless.yml"
  echo "   💡 Agrega estas dependencias a la sección 'package.patterns' en serverless.yml:"
  for dep in "${JWK_DEPENDENCIES[@]}"; do
    if ! grep -q "node_modules/${dep}/" serverless.yml; then
      echo "      - 'node_modules/${dep}/**'"
    fi
  done
fi

# 15. Advertencia sobre VPC configuration
echo ""
echo "🔍 Verificando configuración de VPC en serverless.yml..."
if grep -q "LAMBDA_SECURITY_GROUP_ID" serverless.yml && [ -z "$LAMBDA_SECURITY_GROUP_ID" ]; then
  report_warning "VPC está configurado pero LAMBDA_SECURITY_GROUP_ID no está establecido. Usar defaults de serverless.yml."
fi

# 11. Verificar que AWS CLI está configurado
echo ""
echo "🔍 Verificando configuración de AWS..."
if ! command -v aws &> /dev/null; then
  report_error "AWS CLI no está instalado"
else
  if ! aws sts get-caller-identity &> /dev/null; then
    report_error "AWS CLI no está configurado o las credenciales no son válidas"
  else
    AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text 2>/dev/null)
    report_success "AWS CLI configurado (Account: $AWS_ACCOUNT)"
  fi
fi

# 12. Verificar estado del stack de CloudFormation
echo ""
echo "🔍 Verificando estado del stack de CloudFormation..."
STACK_NAME="backend-${STAGE}"
if aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region us-east-1 &> /dev/null; then
  STACK_STATUS=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region us-east-1 --query 'Stacks[0].StackStatus' --output text 2>/dev/null)
  
  # Estados problemáticos que requieren acción
  # UPDATE_ROLLBACK_COMPLETE y ROLLBACK_COMPLETE son estados válidos que permiten redesplegar
  if [[ "$STACK_STATUS" == *"FAILED"* ]] || \
     [[ "$STACK_STATUS" == "UPDATE_ROLLBACK_FAILED" ]] || \
     [[ "$STACK_STATUS" == "ROLLBACK_FAILED" ]]; then
    report_error "El stack $STACK_NAME está en estado problemático: $STACK_STATUS"
    echo "   Acción requerida: Resolver el estado del stack antes de desplegar"
    echo "   Comandos útiles:"
    echo "     - Ver eventos: aws cloudformation describe-stack-events --stack-name $STACK_NAME"
    echo "     - Continuar rollback: aws cloudformation continue-update-rollback --stack-name $STACK_NAME"
    echo "     - Usar script de recuperación: ./scripts/recover-rollback.sh $STAGE"
    ERRORS=$((ERRORS + 1))
  elif [[ "$STACK_STATUS" == "UPDATE_ROLLBACK_COMPLETE" ]] || [[ "$STACK_STATUS" == "ROLLBACK_COMPLETE" ]]; then
    report_success "Stack $STACK_NAME está en estado: $STACK_STATUS (puede redesplegarse)"
  else
    report_success "Stack $STACK_NAME está en estado: $STACK_STATUS"
  fi
else
  report_success "Stack $STACK_NAME no existe (se creará en el despliegue)"
fi

# Resumen final
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
  if [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ Todas las validaciones pasaron exitosamente${NC}"
    echo ""
    echo "🚀 Listo para desplegar. Ejecuta:"
    echo "   ./deploy.sh $STAGE"
    exit 0
  else
    echo -e "${YELLOW}⚠️  Validaciones completadas con $WARNINGS advertencia(s)${NC}"
    echo ""
    echo "⚠️  Revisa las advertencias antes de continuar"
    echo "🚀 Si todo está bien, ejecuta:"
    echo "   ./deploy.sh $STAGE"
    exit 0
  fi
else
  echo -e "${RED}❌ Validaciones fallaron con $ERRORS error(es)${NC}"
  echo ""
  echo "🔧 Corrige los errores antes de intentar desplegar nuevamente"
  exit 1
fi

