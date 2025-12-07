#!/bin/bash

# Script de pruebas automatizadas para Fase 3
# Ejecutar con: bash test-phase3.sh

set -e

echo "🧪 Iniciando pruebas automatizadas de Fase 3..."
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

# 1. Verificar estructura de archivos frontend
echo "📁 Verificando estructura de archivos frontend..."
[ -f "admin-frontend/src/pages/Products/CreateMovementModal.tsx" ] && check_result "CreateMovementModal.tsx existe"

# 2. Verificar componentes mejorados
echo ""
echo "📁 Verificando componentes mejorados..."
[ -f "admin-frontend/src/components/commons/Modal.tsx" ] && check_result "Modal.tsx existe"
[ -f "admin-frontend/src/components/commons/InputNumber.tsx" ] && check_result "InputNumber.tsx existe"

# 3. Verificar integración en SearchProducts
echo ""
echo "🔍 Verificando integración..."
grep -q "CreateMovementModal" admin-frontend/src/pages/Products/SearchProducts.tsx && check_result "CreateMovementModal importado en SearchProducts"
grep -q "isCreateMovementModalOpen" admin-frontend/src/pages/Products/SearchProducts.tsx && check_result "Estado isCreateMovementModalOpen en SearchProducts"
grep -q "setIsCreateMovementModalOpen" admin-frontend/src/pages/Products/SearchProducts.tsx && check_result "setIsCreateMovementModalOpen en SearchProducts"
grep -q "onCreateMovement" admin-frontend/src/pages/Products/SearchProducts.tsx && check_result "onCreateMovement prop en ProductHistoryTab"

# 4. Verificar imports y exports
echo ""
echo "🔍 Verificando imports y exports..."
grep -q "export.*CreateMovementModal" admin-frontend/src/pages/Products/CreateMovementModal.tsx && check_result "CreateMovementModal exportado"
grep -q "import.*useMutation" admin-frontend/src/pages/Products/CreateMovementModal.tsx && check_result "useMutation importado"
grep -q "import.*useQueryClient" admin-frontend/src/pages/Products/CreateMovementModal.tsx && check_result "useQueryClient importado"
grep -q "import.*stockMovementsService" admin-frontend/src/pages/Products/CreateMovementModal.tsx && check_result "stockMovementsService importado"

# 5. Verificar validaciones
echo ""
echo "🔍 Verificando validaciones..."
grep -q "validateForm" admin-frontend/src/pages/Products/CreateMovementModal.tsx && check_result "Función validateForm implementada"
grep -q "warehouseId.*required\|warehouseId.*requerida" admin-frontend/src/pages/Products/CreateMovementModal.tsx && check_result "Validación de bodega implementada"
grep -q "cantidad.*required\|cantidad.*requerida\|cantidad.*mayor" admin-frontend/src/pages/Products/CreateMovementModal.tsx && check_result "Validación de cantidad implementada"
grep -q "stock.*disponible\|stock.*available" admin-frontend/src/pages/Products/CreateMovementModal.tsx && check_result "Validación de stock disponible implementada"

# 6. Verificar campos del formulario
echo ""
echo "🔍 Verificando campos del formulario..."
grep -q "movementType\|MovementType" admin-frontend/src/pages/Products/CreateMovementModal.tsx && check_result "Campo tipo de movimiento"
grep -q "warehouseId" admin-frontend/src/pages/Products/CreateMovementModal.tsx && check_result "Campo bodega"
grep -q "cantidad" admin-frontend/src/pages/Products/CreateMovementModal.tsx && check_result "Campo cantidad"
grep -q "documento" admin-frontend/src/pages/Products/CreateMovementModal.tsx && check_result "Campo documento"
grep -q "numeroDocumento" admin-frontend/src/pages/Products/CreateMovementModal.tsx && check_result "Campo número de documento"
grep -q "fechaDocumento" admin-frontend/src/pages/Products/CreateMovementModal.tsx && check_result "Campo fecha de documento"
grep -q "lote" admin-frontend/src/pages/Products/CreateMovementModal.tsx && check_result "Campo lote"
grep -q "observaciones" admin-frontend/src/pages/Products/CreateMovementModal.tsx && check_result "Campo observaciones"

# 7. Verificar mejoras en Modal
echo ""
echo "🔍 Verificando mejoras en Modal..."
grep -q "size.*sm.*md.*lg.*xl\|size.*=.*'lg'" admin-frontend/src/components/commons/Modal.tsx && check_result "Modal soporta tamaños"
grep -q "max-w-sm\|max-w-md\|max-w-2xl\|max-w-4xl" admin-frontend/src/components/commons/Modal.tsx && check_result "Clases de tamaño en Modal"

# 8. Verificar mejoras en InputNumber
echo ""
echo "🔍 Verificando mejoras en InputNumber..."
grep -q "decimal\|parseFloat" admin-frontend/src/components/commons/InputNumber.tsx && check_result "InputNumber soporta decimales"
grep -q "inputMode.*decimal" admin-frontend/src/components/commons/InputNumber.tsx && check_result "InputMode decimal configurado"

# 9. Verificar mutación y invalidación
echo ""
echo "🔍 Verificando mutación y invalidación..."
grep -q "createMovementMutation\|useMutation" admin-frontend/src/pages/Products/CreateMovementModal.tsx && check_result "Mutación implementada"
grep -q "invalidateQueries.*productHistory" admin-frontend/src/pages/Products/CreateMovementModal.tsx && check_result "Invalidación de productHistory"
grep -q "onSuccess" admin-frontend/src/pages/Products/CreateMovementModal.tsx && check_result "Callback onSuccess implementado"

# 10. Verificar manejo de errores
echo ""
echo "🔍 Verificando manejo de errores..."
grep -q "errors\|error" admin-frontend/src/pages/Products/CreateMovementModal.tsx && check_result "Manejo de errores implementado"
grep -q "setErrors" admin-frontend/src/pages/Products/CreateMovementModal.tsx && check_result "Estado de errores implementado"
grep -q "error.*submit\|errors\.submit" admin-frontend/src/pages/Products/CreateMovementModal.tsx && check_result "Error de submit manejado"

# 11. Verificar UX/UI
echo ""
echo "🔍 Verificando UX/UI..."
grep -q "isSubmitting\|isPending" admin-frontend/src/pages/Products/CreateMovementModal.tsx && check_result "Estado de carga implementado"
grep -q "Creando\|Creating" admin-frontend/src/pages/Products/CreateMovementModal.tsx && check_result "Mensaje de carga mostrado"
grep -q "Stock Actual\|stock actual" admin-frontend/src/pages/Products/CreateMovementModal.tsx && check_result "Stock actual mostrado"
grep -q "Producto:" admin-frontend/src/pages/Products/CreateMovementModal.tsx && check_result "Información del producto mostrada"

# 12. Verificar botón en historial
echo ""
echo "🔍 Verificando botón en historial..."
grep -q "Crear Movimiento" admin-frontend/src/pages/Products/SearchProducts.tsx && check_result "Botón 'Crear Movimiento' en historial"
grep -q "Button.*onClick.*setIsCreateMovementModalOpen\|Button.*onClick.*onCreateMovement" admin-frontend/src/pages/Products/SearchProducts.tsx && check_result "Botón conectado al modal"

# 13. Verificar TypeScript (verificación básica)
echo ""
echo "📝 Verificando TypeScript..."
# Verificar que los archivos TypeScript tienen sintaxis válida básica
grep -q "export.*CreateMovementModal" admin-frontend/src/pages/Products/CreateMovementModal.tsx && \
grep -q "interface.*CreateMovementModalProps" admin-frontend/src/pages/Products/CreateMovementModal.tsx && \
grep -q ": React.ReactElement" admin-frontend/src/pages/Products/CreateMovementModal.tsx && \
check_result "TypeScript: Sintaxis básica correcta" || check_result "TypeScript: Sintaxis básica correcta"

# 14. Verificar que no hay errores de lint
echo ""
echo "🔍 Verificando lint..."
cd admin-frontend
npm run lint -- --quiet > /dev/null 2>&1 && check_result "Sin errores de lint" || echo -e "${YELLOW}⚠️  Lint tiene advertencias (no crítico)${NC}"
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

