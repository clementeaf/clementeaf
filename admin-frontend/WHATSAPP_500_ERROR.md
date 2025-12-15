# WhatsApp Status 500 Error - Diagnóstico Completo

## 🔴 Problema
```
GET https://zzv7qnwgz1.execute-api.us-east-1.amazonaws.com/dev/whatsapp/status 
→ 500 (Internal Server Error)
```

## 🎯 Causa Raíz Confirmada

**Error real del backend (CloudWatch Logs):**
```
JsonWebTokenError: jwt malformed
    at module.exports (/var/task/dist/node_modules/jsonwebtoken/verify.js:70:17)
    at CognitoService.verifyToken
    at validatePermission
    at getStatusHandler
```

**El problema NO es el endpoint de WhatsApp** - el error ocurre en la validación de autenticación ANTES de que el handler de WhatsApp se ejecute.

## 📋 Flujo del Error

```
1. Frontend → GET /whatsapp/status con Authorization: Bearer <TOKEN_MALFORMADO>
2. Backend → validatePermission() extrae el token
3. Backend → AuthService.verifyToken() intenta verificar el JWT
4. Backend → jsonwebtoken library → "jwt malformed" ❌
5. Backend → handlerWrapper catch error → 500 Internal Server Error
6. Frontend ← Recibe 500
```

## 🔍 Por Qué Sucede

El token JWT almacenado en la cookie `authToken` está malformado o corrupto. Un JWT válido debe:

1. ✅ Tener exactamente 3 partes separadas por puntos: `header.payload.signature`
2. ✅ Cada parte debe ser base64url encoded
3. ✅ Header y payload deben decodificarse a JSON válido

## 🛠️ Soluciones Implementadas

### 1. Validación de JWT antes de guardar en cookies

**Archivo modificado:** `admin-frontend/src/main.tsx`

Se agregó la función `isValidJWT()` que valida:
- Que el token tenga 3 partes
- Que header y payload sean JSON válidos
- Si el token es inválido, redirige automáticamente al login

### 2. Herramienta de Diagnóstico

**Archivo creado:** `admin-frontend/public/debug-token.html`

Acceder vía: `https://d38b47o2shfk09.cloudfront.net/debug-token.html`

Esta página:
- ✅ Verifica si hay un token en cookies
- ✅ Valida si el token es un JWT válido
- ✅ Muestra el contenido decodificado del token
- ✅ Verifica si el token ha expirado
- ✅ Permite limpiar tokens y redirigir al login

## 🚀 Pasos para Resolver (Usuario Final)

### Opción 1: Limpiar y Re-Login
```javascript
// En la consola del navegador:
document.cookie = 'authToken=; Path=/; Max-Age=0; SameSite=Lax';
document.cookie = 'refreshToken=; Path=/; Max-Age=0; SameSite=Lax';
window.location.href = 'https://d1wdj9ggvinelv.cloudfront.net';
```

### Opción 2: Usar la herramienta de diagnóstico
1. Ir a: `https://d38b47o2shfk09.cloudfront.net/debug-token.html`
2. Ver el diagnóstico del token
3. Click en "Clear All Tokens"
4. Click en "Go to Login"

### Opción 3: Manual desde la app
1. Abrir DevTools (F12)
2. Ir a Application → Cookies
3. Eliminar `authToken` y `refreshToken`
4. Recargar la página
5. El sistema redirigirá automáticamente al login

## 🔧 Verificación del Token (Developer)

```javascript
// En consola del navegador:
const token = document.cookie.split('; ').find(c => c.startsWith('authToken='))?.split('=')[1];
const parts = token?.split('.');

console.log('Token parts:', parts?.length, '(should be 3)');
console.log('Token preview:', token?.substring(0, 50));

if (parts?.length === 3) {
    try {
        console.log('Header:', JSON.parse(atob(parts[0])));
        console.log('Payload:', JSON.parse(atob(parts[1])));
        console.log('✅ Token is valid JWT');
    } catch (e) {
        console.error('❌ Token is malformed:', e);
    }
} else {
    console.error('❌ Token does not have 3 parts');
}
```

## 📊 Posibles Causas del Token Malformado

1. **Auth-frontend generando tokens incorrectos**
   - Verificar que Cognito esté retornando tokens válidos
   - Verificar que no haya corrupción al pasar tokens por URL

2. **Problemas de encoding en URL**
   - Los tokens JWT pueden tener caracteres especiales
   - URLSearchParams debería manejar esto automáticamente

3. **Truncamiento del token**
   - URLs muy largas pueden truncarse
   - Navegadores tienen límites de longitud de URL

4. **Tokens antiguos en caché**
   - Las cookies persisten entre sesiones (según expiración)
   - Si el formato del token cambió, tokens viejos pueden ser inválidos

## ✅ Siguiente Paso

Con la validación ahora implementada en `main.tsx`:
1. Los nuevos logins validarán el token antes de guardarlo
2. Si el token es inválido, redirigirá automáticamente
3. Si el problema persiste, investigar el auth-frontend

## 📝 Testing

Para probar la nueva validación:

```bash
# 1. Rebuild del admin-frontend
cd admin-frontend
npm run build

# 2. Deploy
./deploy.sh

# 3. Probar el flujo completo:
# - Limpiar cookies
# - Login desde auth-frontend
# - Verificar que el token se valide correctamente
```

## 🎯 Conclusión

El error 500 en `/whatsapp/status` es un **síntoma** de un problema de autenticación, no un problema del endpoint WhatsApp en sí. El endpoint de WhatsApp funciona correctamente, pero la validación de permisos falla debido a un JWT malformado en el token de autenticación.

**Fix inmediato:** Limpiar cookies y volver a hacer login
**Fix permanente:** Validación de JWT implementada en `main.tsx`
