# Solución de Problemas - CheckAuditor API

## Problema: No encuentro cómo crear/obtener la API Key

### Pasos para Resolver

1. **Verificar si tienes cuenta activa**
   - Asegúrate de tener una cuenta en CheckAuditor/Certificado Tributario
   - Si no tienes cuenta, regístrate primero

2. **Revisar el panel de usuario**
   - Accede a: https://certificadotributario.com/panel/credenciales
   - Busca secciones como:
     - "API"
     - "Credenciales"
     - "Integraciones"
     - "Desarrolladores"
     - "Configuración"

3. **Contactar soporte**
   - Email: contacto@checkauditor.com
   - Incluye en tu mensaje:
     - Tu nombre y empresa
     - Que necesitas la API Key para integración
     - Que no encuentras la opción en el panel

4. **Verificar con el equipo de ventas**
   - Es posible que la API Key solo esté disponible para planes específicos
   - Contacta ventas para confirmar si tu plan incluye acceso a la API

## Problema: La API Key no funciona (Error 401)

### Posibles causas:
1. **API Key incorrecta**: Verifica que estés usando la API Key correcta
2. **API Key expirada**: Algunas APIs tienen API Keys con fecha de expiración
3. **Formato incorrecto**: Asegúrate de que la API Key no tenga espacios extra
4. **Header incorrecto**: Debe ser `API-KEY: {tu-api-key}` (no `Authorization: Bearer`)

### Solución:
```bash
# Verificar que la API Key esté configurada
echo $CHECKAUDITOR_API_KEY

# Probar directamente con curl
curl -X POST "https://app.checkauditor.com/api/v1/sii/sessions?id=b4622ede1fa55463d5df" \
  -H "API-KEY: tu-api-key-aqui" \
  -H "Content-Type: application/json"
```

## Problema: Error 404 (Endpoint not found)

### Posibles causas:
1. **URL base incorrecta**: Verifica que sea `https://app.checkauditor.com`
2. **Ruta incorrecta**: El endpoint debe ser `/api/v1/sii/sessions`
3. **Método HTTP incorrecto**: Verifica que uses POST para sessions

### Solución:
```bash
# Verificar la URL completa
https://app.checkauditor.com/api/v1/sii/sessions?id={company_id}
```

## Problema: Error 403 (Forbidden)

### Posibles causas:
1. **Permisos insuficientes**: Tu API Key no tiene permisos para ese endpoint
2. **Plan limitado**: Tu plan no incluye acceso a ese recurso
3. **IP bloqueada**: Tu IP podría estar bloqueada

### Solución:
- Contacta soporte para verificar los permisos de tu API Key
- Verifica qué endpoints están incluidos en tu plan

## Verificación de Configuración

### Checklist:
- [ ] API Key configurada en `CHECKAUDITOR_API_KEY`
- [ ] URL base correcta: `https://app.checkauditor.com`
- [ ] Header `API-KEY` configurado correctamente
- [ ] company_id correcto en los query parameters
- [ ] Método HTTP correcto (POST para sessions, GET para otros)

### Comando de Prueba:
```bash
# Probar autenticación
curl -X POST "https://app.checkauditor.com/api/v1/sii/sessions?id=b4622ede1fa55463d5df" \
  -H "API-KEY: $CHECKAUDITOR_API_KEY" \
  -H "Content-Type: application/json" \
  -v
```

## Contacto de Soporte

- **Email**: contacto@checkauditor.com
- **Sitio web**: https://www.checkauditor.com
- **Panel**: https://certificadotributario.com/panel/credenciales

