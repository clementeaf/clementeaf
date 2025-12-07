#!/bin/bash

# Script de pruebas automatizadas para Fase 1
# Ejecutar con: bash test-phase1.sh

set -e

echo "🧪 Iniciando pruebas automatizadas de Fase 1..."
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
[ -f "backend/src/modules/Products/entities/Warehouse.entity.ts" ] && check_result "Warehouse.entity.ts existe"
[ -f "backend/src/modules/Products/entities/StockMovement.entity.ts" ] && check_result "StockMovement.entity.ts existe"
[ -f "backend/src/modules/Products/services/WarehouseService.ts" ] && check_result "WarehouseService.ts existe"
[ -f "backend/src/modules/Products/handlers/getWarehouses.ts" ] && check_result "getWarehouses.ts existe"
[ -f "backend/src/handlers/seedWarehouses.ts" ] && check_result "seedWarehouses.ts existe"
[ -f "backend/src/migrations/seed-warehouses.ts" ] && check_result "seed-warehouses.ts existe"

# 2. Verificar estructura de archivos frontend
echo ""
echo "📁 Verificando estructura de archivos frontend..."
[ -f "admin-frontend/src/pages/Products/SearchProducts.tsx" ] && check_result "SearchProducts.tsx existe"
[ -f "admin-frontend/src/pages/Products/columns.tsx" ] && check_result "columns.tsx existe"
[ -f "admin-frontend/src/services/warehousesService.ts" ] && check_result "warehousesService.ts existe"

# 3. Compilar backend
echo ""
echo "🔨 Compilando backend..."
cd backend
npm run build > /dev/null 2>&1 && check_result "Backend compila sin errores" || check_result "Backend compila sin errores"
cd ..

# 4. Verificar archivos compilados
echo ""
echo "📦 Verificando archivos compilados..."
[ -f "backend/dist/modules/Products/entities/Warehouse.entity.js" ] && check_result "Warehouse.entity.js compilado"
[ -f "backend/dist/modules/Products/entities/StockMovement.entity.js" ] && check_result "StockMovement.entity.js compilado"
[ -f "backend/dist/modules/Products/handlers/getWarehouses.js" ] && check_result "getWarehouses.js compilado"
[ -f "backend/dist/handlers/seedWarehouses.js" ] && check_result "seedWarehouses.js compilado"

# 5. Verificar configuración serverless
echo ""
echo "⚙️ Verificando configuración serverless..."
grep -q "getWarehouses:" backend/serverless.yml && check_result "Endpoint getWarehouses en serverless.yml"
grep -q "seedWarehouses:" backend/serverless.yml && check_result "Endpoint seedWarehouses en serverless.yml"

# 6. Verificar configuración frontend
echo ""
echo "⚙️ Verificando configuración frontend..."
grep -q "productsSearch" admin-frontend/src/routes/index.ts && check_result "Ruta productsSearch definida"
grep -q "Productos" admin-frontend/src/components/Sidebar/navItems.config.ts && check_result "Item Productos en navItems"
grep -q "warehouses" admin-frontend/src/api/endpoints.ts && check_result "Endpoint warehouses en endpoints.ts"
grep -q "view:products:search" admin-frontend/src/App.tsx && check_result "Ruta protegida con permiso"

# 7. Verificar imports y exports
echo ""
echo "🔍 Verificando imports y exports..."
grep -q "export.*SearchProducts" admin-frontend/src/pages/Products/SearchProducts.tsx && check_result "SearchProducts exportado"
grep -q "export.*Warehouse" backend/src/modules/Products/entities/Warehouse.entity.ts && check_result "Warehouse exportado"
grep -q "export.*StockMovement" backend/src/modules/Products/entities/StockMovement.entity.ts && check_result "StockMovement exportado"

# 8. Verificar TypeScript (sin errores de tipo)
echo ""
echo "📝 Verificando TypeScript..."
cd backend
npm run type-check > /dev/null 2>&1 && check_result "TypeScript sin errores de tipo" || check_result "TypeScript sin errores de tipo"
cd ..

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

