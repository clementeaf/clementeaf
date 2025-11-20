# Guía de Verificación de AWS SES

## Estado Actual

- **Modo**: Sandbox (solo puede enviar a direcciones verificadas)
- **Direcciones verificadas**: `carriagadafalcone@gmail.com`
- **Dominio pendiente**: `banados.com`

## Opción 1: Verificar Dominio Completo (Recomendado)

Verificar el dominio `banados.com` permite usar cualquier dirección `@banados.com`.

### Pasos:

1. **Obtener los registros DNS necesarios:**
   ```bash
   aws sesv2 get-email-identity --email-identity banados.com --region us-east-1
   ```

2. **Agregar registros DNS en tu proveedor DNS (Register.com):**

   **Registro TXT de verificación:**
   - **Tipo**: TXT
   - **Nombre**: `_amazonses.banados.com`
   - **Valor**: (obtener con el comando anterior)

   **Registros CNAME para DKIM (3 registros):**
   - **Tipo**: CNAME
   - **Nombre**: `6lupdkxc3dkx6e6ackipmgo5wjih6t2f._domainkey.banados.com`
   - **Valor**: `6lupdkxc3dkx6e6ackipmgo5wjih6t2f.dkim.amazonses.com`
   
   - **Nombre**: `7htpoyvi34ttg4mgyjswx5aaj2l5xy5i._domainkey.banados.com`
   - **Valor**: `7htpoyvi34ttg4mgyjswx5aaj2l5xy5i.dkim.amazonses.com`
   
   - **Nombre**: `4fqgwufi6js2p7xlfvq7ropc66j3sovm._domainkey.banados.com`
   - **Valor**: `4fqgwufi6js2p7xlfvq7ropc66j3sovm.dkim.amazonses.com`

3. **Verificar el estado:**
   ```bash
   aws sesv2 get-email-identity --email-identity banados.com --region us-east-1 --query 'VerificationStatus'
   ```

4. **Una vez verificado**, actualizar la variable de entorno:
   ```bash
   SES_FROM_EMAIL=noreply@banados.com
   ```

## Opción 2: Usar Dirección Temporal para Pruebas

Mientras se verifica el dominio, puedes usar la dirección ya verificada:

1. **Actualizar variable de entorno:**
   ```bash
   SES_FROM_EMAIL=carriagadafalcone@gmail.com
   ```

2. **Actualizar en serverless.yml o variables de entorno de Lambda**

## Opción 3: Verificar Dirección Individual

Si solo necesitas verificar `noreply@banados.com`:

1. AWS envió un correo de verificación a `noreply@banados.com`
2. Revisa la bandeja de entrada (y spam) de esa dirección
3. Haz clic en el enlace de verificación

**Verificar estado:**
```bash
aws sesv2 get-email-identity --email-identity noreply@banados.com --region us-east-1 --query 'VerificationStatus'
```

## Solicitar Salir del Modo Sandbox

Para enviar correos a cualquier dirección (no solo verificadas):

1. Ir a AWS SES Console
2. Account dashboard → Request production access
3. Completar el formulario explicando el caso de uso
4. AWS revisará la solicitud (puede tardar 24-48 horas)

## Comandos Útiles

```bash
# Ver estado de la cuenta
aws sesv2 get-account --region us-east-1

# Listar direcciones verificadas
aws sesv2 list-email-identities --region us-east-1

# Verificar estado de una identidad
aws sesv2 get-email-identity --email-identity banados.com --region us-east-1

# Enviar correo de prueba (desde código)
# Usar el endpoint: POST /email/send
```

## Notas Importantes

- En modo Sandbox solo puedes enviar a direcciones verificadas
- El límite es 200 correos por día y 1 correo por segundo
- La verificación de dominio puede tardar hasta 72 horas en propagarse
- DKIM mejora la reputación del correo y reduce spam

