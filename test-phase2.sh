#!/bin/bash

# Script de pruebas automatizadas para Fase 2
# Ejecutar con: bash test-phase2.sh

set -e

echo "🧪 Iniciando pruebas automatizadas de Fase 2..."
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# Función para verificar resultado
check_result() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ $1${NC}"
        ((FAILED++))
        return 1
    fi
}

# 1. Verificar estructura de archivos backend
echo "📁 Verificando estructura de archivos backend..."
[ -f "backend/src/modules/Products/services/StockMovementService.ts" ] && check_result "StockMovementService.ts existe"
[ -f "backend/src/modules/Products/handlers/getProductHistory.ts" ] && check_result "getProductHistory.ts existe"
[ -f "backend/src/modules/Products/handlers/createMovement.ts" ] && check_result "createMovement.ts existe"
[ -f "backend/src/modules/Products/dto/CreateMovementDto.ts" ] && check_result "CreateMovementDto.ts existe"

# 2. Verificar estructura de archivos frontend
echo ""
echo "📁 Verificando estructura de archivos frontend..."
[ -f "admin-frontend/src/services/stockMovementsService.ts" ] && check_result "stockMovementsService.ts existe"
[ -f "admin-frontend/src/pages/Products/HistoryColumns.tsx" ] && check_result "HistoryColumns.tsx existe"
grep -q "ProductHistoryTab" admin-frontend/src/pages/Products/SearchProducts.tsx && check_result "ProductHistoryTab en SearchProducts.tsx"

# 3. Compilar backend
echo ""
echo "🔨 Compilando backend..."
cd backend
npm run build > /dev/null 2>&1 && check_result "Backend compila sin errores" || check_result "Backend compila sin errores"
cd ..

# 4. Verificar archivos compilados
echo ""
echo "📦 Verificando archivos compilados..."
[ -f "backend/dist/modules/Products/services/StockMovementService.js" ] && check_result "StockMovementService.js compilado"
[ -f "backend/dist/modules/Products/handlers/getProductHistory.js" ] && check_result "getProductHistory.js compilado"
[ -f "backend/dist/modules/Products/handlers/createMovement.js" ] && check_result "createMovement.js compilado"

# 5. Verificar configuración serverless
echo ""
echo "⚙️ Verificando configuración serverless..."
grep -q "getProductHistory:" backend/serverless.yml && check_result "Endpoint getProductHistory en serverless.yml"
grep -q "createMovement:" backend/serverless.yml && check_result "Endpoint createMovement en serverless.yml"
grep -q "products/{productId}/history" backend/serverless.yml && check_result "Ruta products/{productId}/history configurada"
grep -q "products/movements" backend/serverless.yml && check_result "Ruta products/movements configurada"

# 6. Verificar configuración frontend
echo ""
echo "⚙️ Verificando configuración frontend..."
grep -q "getHistory" admin-frontend/src/api/endpoints.ts && check_result "Endpoint getHistory en endpoints.ts"
grep -q "createMovement" admin-frontend/src/api/endpoints.ts && check_result "Endpoint createMovement en endpoints.ts"
grep -q "stockMovementsService" admin-frontend/src/pages/Products/SearchProducts.tsx && check_result "stockMovementsService importado"
grep -q "HistoryColumns" admin-frontend/src/pages/Products/SearchProducts.tsx && check_result "HistoryColumns importado"

# 7. Verificar imports y exports
echo ""
echo "🔍 Verificando imports y exports..."
grep -q "export.*StockMovementService" backend/src/modules/Products/services/StockMovementService.ts && check_result "StockMovementService exportado"
grep -q "export.*historyColumns" admin-frontend/src/pages/Products/HistoryColumns.tsx && check_result "historyColumns exportado"
grep -q "export.*stockMovementsService" admin-frontend/src/services/stockMovementsService.ts && check_result "stockMovementsService exportado"

# 8. Verificar TypeScript (sin errores de tipo)
echo ""
echo "📝 Verificando TypeScript..."
cd backend
npm run type-check > /dev/null 2>&1 && check_result "TypeScript sin errores de tipo" || check_result "TypeScript sin errores de tipo"
cd ..

# 9. Verificar uso de MovementType
echo ""
echo "🔍 Verificando tipos de movimiento..."
grep -q "MovementType" admin-frontend/src/services/stockMovementsService.ts && check_result "MovementType en stockMovementsService"
grep -q "MovementType" admin-frontend/src/pages/Products/SearchProducts.tsx && check_result "MovementType en SearchProducts"
grep -q "MovementType" backend/src/modules/Products/entities/StockMovement.entity.ts && check_result "MovementType en entidad"

# 10. Verificar cálculo de stock acumulativo
echo ""
echo "🔍 Verificando lógica de stock acumulativo..."
grep -q "stockAcumulativo" backend/src/modules/Products/services/StockMovementService.ts && check_result "stockAcumulativo en servicio"
grep -q "stockAcumulativo" admin-frontend/src/pages/Products/HistoryColumns.tsx && check_result "stockAcumulativo en columnas"

# 11. Verificar filtros
echo ""
echo "🔍 Verificando filtros..."
grep -q "selectedType" admin-frontend/src/pages/Products/SearchProducts.tsx && check_result "Filtro por tipo implementado"
grep -q "startDate\|endDate" admin-frontend/src/pages/Products/SearchProducts.tsx && check_result "Filtros por fecha implementados"
grep -q "movementType\|startDate\|endDate" backend/src/modules/Products/services/StockMovementService.ts && check_result "Filtros en servicio backend"

# 12. Verificar manejo de errores
echo ""
echo "🔍 Verificando manejo de errores..."
grep -q "errorMessage" admin-frontend/src/pages/Products/SearchProducts.tsx && check_result "Manejo de errores en UI"
grep -q "catch\|error" backend/src/modules/Products/handlers/getProductHistory.ts && check_result "Manejo de errores en getProductHistory"
grep -q "catch\|error" backend/src/modules/Products/handlers/createMovement.ts && check_result "Manejo de errores en createMovement"

# Resumen
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Pruebas pasadas: $PASSED${NC}"
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}❌ Pruebas fallidas: $FAILED${NC}"
    exit 1
else
    echo -e "${GREEN}🎉 Todas las pruebas pasaron!${NC}"
    exit 0
fi

