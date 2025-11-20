# Solicitar Production Access en AWS SES

## Estado Actual

- **Modo**: Sandbox
- **ProductionAccessEnabled**: `false`
- **Límites actuales**:
  - Solo puede enviar a direcciones verificadas
  - 200 correos por día
  - 1 correo por segundo

## Pasos para Solicitar Production Access

### 1. Verificar noreply@banados.cl

Primero, verifica el correo `noreply@banados.cl`:

1. Revisa la bandeja de entrada de `noreply@banados.cl`
2. Busca el correo de verificación de AWS SES
3. Haz clic en el enlace de verificación

**Verificar estado:**
```bash
aws sesv2 get-email-identity --email-identity noreply@banados.cl --region us-east-1 --query 'VerificationStatus'
```

### 2. Solicitar Production Access

**Opción A: Desde AWS Console (Recomendado)**

1. Ir a AWS SES Console: https://console.aws.amazon.com/ses/home?region=us-east-1
2. En el menú lateral, hacer clic en "Account dashboard"
3. Buscar la sección "Sending limits"
4. Hacer clic en "Request production access"
5. Completar el formulario con:
   - **Mail Type**: Transactional (para correos transaccionales como notificaciones)
   - **Website URL**: https://banados.cl (o la URL de tu sitio)
   - **Use case description**: 
     ```
     Sistema de notificaciones automáticas para clientes sobre deudas y facturas pendientes.
     Envío de correos transaccionales desde noreply@banados.cl a clientes del sistema.
     ```
   - **Compliance**: Aceptar términos y condiciones
6. Enviar solicitud

**Opción B: Desde AWS CLI**

```bash
# Nota: La solicitud de Production Access debe hacerse desde la consola
# No hay comando CLI directo, pero puedes verificar el estado:
aws sesv2 get-account --region us-east-1 --query 'ProductionAccessEnabled'
```

### 3. Esperar Aprobación

- AWS revisa las solicitudes en 24-48 horas
- Puedes verificar el estado en la consola
- Una vez aprobado, `ProductionAccessEnabled` será `true`

### 4. Verificar Estado

```bash
# Verificar si está en modo producción
aws sesv2 get-account --region us-east-1 --query 'ProductionAccessEnabled'

# Verificar límites actuales
aws sesv2 get-account --region us-east-1 --query 'SendQuota'
```

## Límites en Modo Producción

Una vez aprobado:
- **Sin límite de destinatarios**: Puedes enviar a cualquier dirección
- **Límite inicial**: 50,000 correos por día (puede aumentar)
- **Tasa de envío**: 14 correos por segundo (puede aumentar)

## Notas Importantes

- En modo Sandbox, solo puedes enviar a direcciones verificadas
- La solicitud de Production Access puede ser rechazada si:
  - El caso de uso no es claro
  - No tienes un sitio web funcional
  - El dominio no está verificado
- Es recomendable verificar el dominio completo `banados.cl` en lugar de solo la dirección

## Verificar Dominio Completo (Recomendado)

Para mejor reputación y menos problemas:

```bash
# Crear identidad de dominio
aws sesv2 create-email-identity --email-identity banados.cl --region us-east-1

# Obtener registros DNS necesarios
aws sesv2 get-email-identity --email-identity banados.cl --region us-east-1
```

Luego agregar los registros DNS en tu proveedor DNS.

