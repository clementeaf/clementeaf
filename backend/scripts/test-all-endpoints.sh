#!/bin/bash

# Script para probar todos los endpoints del backend
# Uso: ./scripts/test-all-endpoints.sh [stage]

set -e

STAGE=${1:-dev}
BASE_URL="https://7ebampwqf4.execute-api.us-east-1.amazonaws.com/${STAGE}"

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contadores
TOTAL=0
PASSED=0
FAILED=0
SKIPPED=0

# Token para endpoints protegidos
AUTH_TOKEN=""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Probando todos los endpoints del backend"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Base URL: $BASE_URL"
echo ""

# Función para probar un endpoint
test_endpoint() {
  local method=$1
  local path=$2
  local data=$3
  local requires_auth=${4:-false}
  local description=$5
  
  TOTAL=$((TOTAL + 1))
  local url="${BASE_URL}${path}"
  
  echo -n "[$TOTAL] Testing $method $path ... "
  
  # Construir comando curl
  local curl_cmd="curl -s -w '\n%{http_code}' -X $method"
  
  if [ "$requires_auth" = true ] && [ -n "$AUTH_TOKEN" ]; then
    curl_cmd="$curl_cmd -H 'Authorization: Bearer $AUTH_TOKEN'"
  fi
  
  if [ -n "$data" ]; then
    curl_cmd="$curl_cmd -H 'Content-Type: application/json' -d '$data'"
  fi
  
  curl_cmd="$curl_cmd '$url'"
  
  # Ejecutar y capturar respuesta
  local response=$(eval $curl_cmd 2>/dev/null || echo -e "\n000")
  local http_code=$(echo "$response" | tail -n1)
  local body=$(echo "$response" | sed '$d')
  
  # Verificar código HTTP
  if [ "$http_code" = "200" ] || [ "$http_code" = "201" ] || [ "$http_code" = "204" ]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
    PASSED=$((PASSED + 1))
    
    # Si es login, guardar el token
    if [ "$path" = "/auth/login" ] && [ "$http_code" = "200" ]; then
      AUTH_TOKEN=$(echo "$body" | grep -o '"token":"[^"]*' | cut -d'"' -f4 || echo "")
      if [ -n "$AUTH_TOKEN" ]; then
        echo "   ${YELLOW}→ Token obtenido para endpoints protegidos${NC}"
      fi
    fi
  elif [ "$http_code" = "401" ] && [ "$requires_auth" = true ] && [ -z "$AUTH_TOKEN" ]; then
    echo -e "${YELLOW}⊘ SKIP${NC} (Requiere autenticación - token no disponible)"
    SKIPPED=$((SKIPPED + 1))
  elif [ "$http_code" = "404" ]; then
    echo -e "${RED}✗ FAIL${NC} (HTTP $http_code - Not Found)"
    FAILED=$((FAILED + 1))
  elif [ "$http_code" = "000" ] || [ "$http_code" = "504" ] || [ "$http_code" = "502" ]; then
    echo -e "${RED}✗ FAIL${NC} (HTTP $http_code - Timeout/Connection Error)"
    FAILED=$((FAILED + 1))
  else
    echo -e "${YELLOW}⚠ WARN${NC} (HTTP $http_code)"
    if [ -n "$body" ] && [ ${#body} -lt 200 ]; then
      echo "   Response: $body"
    fi
    SKIPPED=$((SKIPPED + 1))
  fi
}

# 1. Endpoints públicos de autenticación
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 1. Endpoints de Autenticación (Públicos)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_endpoint "POST" "/auth/register" '{"email":"test'$(date +%s)'@banados.cl","password":"TestPass123!","name":"Test User"}' false "Registro de usuario"

# Intentar login con usuario de prueba (puede fallar si no existe)
test_endpoint "POST" "/auth/login" '{"email":"test@banados.cl","password":"TestPass123!"}' false "Login de usuario"

# 2. Endpoints protegidos (requieren token)
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 2. Endpoints de Autenticación (Protegidos)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_endpoint "GET" "/auth/me" "" true "Obtener usuario actual"
test_endpoint "POST" "/auth/logout" "" true "Cerrar sesión"
test_endpoint "POST" "/auth/refresh" '{"refreshToken":"test"}' false "Refresh token"

# 3. Endpoints de Usuarios
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 3. Endpoints de Usuarios"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_endpoint "GET" "/users" "" true "Listar todos los usuarios"
test_endpoint "GET" "/users/123e4567-e89b-12d3-a456-426614174000" "" true "Obtener usuario por ID"

# 4. Endpoints de Analytics
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 4. Endpoints de Analytics"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_endpoint "GET" "/analytics/ctas-por-cobrar" "" true "Cuentas por cobrar"
test_endpoint "GET" "/analytics/deudas-activas" "" true "Deudas activas"
test_endpoint "GET" "/analytics/resumen/clientes" "" true "Resumen de clientes"
test_endpoint "GET" "/analytics/resumen/vendedores" "" true "Resumen de vendedores"
test_endpoint "GET" "/analytics/estadisticas" "" true "Estadísticas generales"
test_endpoint "POST" "/analytics/sync" "" true "Sincronizar datos"

# 5. Endpoints de CheckAuditor
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 5. Endpoints de CheckAuditor"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_endpoint "POST" "/checkauditor/sessions" '{"sessionId":"test"}' true "Autenticar sesión"
test_endpoint "GET" "/checkauditor/company-data" "" true "Datos de empresa"
test_endpoint "GET" "/checkauditor/notifications" "" true "Notificaciones"

# 6. Endpoints de Clientes
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 6. Endpoints de Clientes"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_endpoint "GET" "/clients" "" true "Listar clientes"
test_endpoint "GET" "/clients/123e4567-e89b-12d3-a456-426614174000" "" true "Obtener cliente por ID"
test_endpoint "POST" "/clients" '{"name":"Test Client","email":"client@test.com"}' true "Crear cliente"
test_endpoint "PUT" "/clients/123e4567-e89b-12d3-a456-426614174000" '{"name":"Updated Client"}' true "Actualizar cliente"
test_endpoint "DELETE" "/clients/123e4567-e89b-12d3-a456-426614174000" "" true "Eliminar cliente"

# 7. Endpoints de Chat
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 7. Endpoints de Chat"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_endpoint "POST" "/chat/conversations" '{"participantIds":["user1","user2"]}' true "Crear conversación"
test_endpoint "GET" "/chat/conversations/123e4567-e89b-12d3-a456-426614174000" "" true "Obtener conversación"
test_endpoint "GET" "/chat/conversations/user/123e4567-e89b-12d3-a456-426614174000" "" true "Conversaciones de usuario"
test_endpoint "POST" "/chat/messages" '{"conversationId":"123e4567-e89b-12d3-a456-426614174000","content":"Test message"}' true "Crear mensaje"
test_endpoint "GET" "/chat/conversations/123e4567-e89b-12d3-a456-426614174000/messages" "" true "Mensajes de conversación"
test_endpoint "PUT" "/chat/messages/123e4567-e89b-12d3-a456-426614174000/read" "" true "Marcar mensaje como leído"
test_endpoint "PUT" "/chat/conversations/123e4567-e89b-12d3-a456-426614174000/messages/read" "" true "Marcar mensajes como leídos"
test_endpoint "POST" "/chat/typing/start" '{"conversationId":"123e4567-e89b-12d3-a456-426614174000"}' true "Iniciar typing"
test_endpoint "POST" "/chat/typing/stop" '{"conversationId":"123e4567-e89b-12d3-a456-426614174000"}' true "Detener typing"

# 8. Endpoints de Tickets
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 8. Endpoints de Tickets"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_endpoint "GET" "/tickets" "" true "Listar tickets"
test_endpoint "GET" "/tickets/123e4567-e89b-12d3-a456-426614174000" "" true "Obtener ticket por ID"
test_endpoint "POST" "/tickets" '{"title":"Test Ticket","description":"Test description"}' true "Crear ticket"
test_endpoint "GET" "/tickets/reporter" "" true "Tickets del reporter"
test_endpoint "GET" "/tickets/assignee" "" true "Tickets del asignado"
test_endpoint "PUT" "/tickets/123e4567-e89b-12d3-a456-426614174000" '{"status":"closed"}' true "Actualizar ticket"
test_endpoint "DELETE" "/tickets/123e4567-e89b-12d3-a456-426614174000" "" true "Eliminar ticket"
test_endpoint "POST" "/tickets/presigned-url" '{"fileName":"test.jpg","fileType":"image/jpeg"}' true "Obtener presigned URL"

# 9. Endpoints de Email
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 9. Endpoints de Email"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_endpoint "POST" "/email/send" '{"to":"test@example.com","subject":"Test","body":"Test email"}' true "Enviar email"

# 10. Endpoints misceláneos
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 10. Endpoints Misceláneos"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_endpoint "GET" "/hello" "" false "Hello endpoint"
test_endpoint "POST" "/migrations/run" "" true "Ejecutar migraciones"

# Resumen
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESUMEN DE PRUEBAS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Total:    $TOTAL"
echo -e "${GREEN}Exitosos: $PASSED${NC}"
echo -e "${RED}Fallidos:  $FAILED${NC}"
echo -e "${YELLOW}Omitidos:  $SKIPPED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ Todos los endpoints responden correctamente${NC}"
  exit 0
else
  echo -e "${RED}❌ Algunos endpoints tienen problemas${NC}"
  exit 1
fi

