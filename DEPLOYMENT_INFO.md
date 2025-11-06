# Información de Despliegue - Frontends

**Fecha de configuración:** 2025-11-06

## Configuración Completada ✅

### admin-frontend

- **Bucket S3:** `banados-admin-frontend-1762469469`
- **CloudFront Distribution ID:** `EHRAZA3DEI3JP`
- **CloudFront Domain:** `https://d13cunasrg048d.cloudfront.net`
- **S3 Website URL:** `http://banados-admin-frontend-1762469469.s3-website-us-east-1.amazonaws.com`
- **Región:** `us-east-1`

### auth-frontend

- **Bucket S3:** `banados-auth-frontend-1762469469`
- **CloudFront Distribution ID:** `E296Z8WIYMY1TJ`
- **CloudFront Domain:** `https://d1wdj9ggvinelv.cloudfront.net`
- **S3 Website URL:** `http://banados-auth-frontend-1762469469.s3-website-us-east-1.amazonaws.com`
- **Región:** `us-east-1`

### client-frontend

- **Bucket S3:** `banados-client-frontend-1762469469`
- **CloudFront Distribution ID:** `E19017Y3Y6IWLG`
- **CloudFront Domain:** `https://d30lw2uu9x30lw.cloudfront.net`
- **S3 Website URL:** `http://banados-client-frontend-1762469469.s3-website-us-east-1.amazonaws.com`
- **Región:** `us-east-1`

## Estado del Despliegue

✅ **Buckets S3 creados y configurados**
- Hosting estático configurado
- Políticas públicas configuradas
- CORS configurado
- Block Public Access deshabilitado

✅ **Distribuciones CloudFront creadas**
- HTTPS automático configurado
- Soporte para SPAs (404 → index.html)
- Cache optimizado
- Compresión habilitada

⚠️ **Nota:** Las distribuciones CloudFront pueden tardar 15-20 minutos en estar completamente desplegadas.

## Despliegue

### Desplegar admin-frontend

```bash
cd admin-frontend
npm run deploy
```

### Desplegar auth-frontend

```bash
cd auth-frontend
npm run deploy
```

### Desplegar client-frontend

```bash
cd client-frontend
npm run deploy
```

## URLs de Acceso

Una vez desplegados, los frontends estarán disponibles en:

- **Admin Frontend:** `https://d13cunasrg048d.cloudfront.net`
- **Auth Frontend:** `https://d1wdj9ggvinelv.cloudfront.net`
- **Client Frontend:** `https://d30lw2uu9x30lw.cloudfront.net`

## Verificar Estado

### Verificar distribución CloudFront

```bash
aws cloudfront get-distribution --id EHRAZA3DEI3JP
aws cloudfront get-distribution --id E296Z8WIYMY1TJ
aws cloudfront get-distribution --id E19017Y3Y6IWLG
```

### Verificar archivos en S3

```bash
aws s3 ls s3://banados-admin-frontend-1762469469/
aws s3 ls s3://banados-auth-frontend-1762469469/
aws s3 ls s3://banados-client-frontend-1762469469/
```

## Archivos .env

Los archivos `.env` han sido creados en cada frontend con la configuración necesaria:

- `admin-frontend/.env`
- `auth-frontend/.env`
- `client-frontend/.env`

## Próximos Pasos

1. **Desplegar los frontends** usando `npm run deploy` en cada directorio
2. **Esperar 15-20 minutos** para que CloudFront esté completamente desplegado
3. **Verificar** que los sitios sean accesibles en las URLs de CloudFront
4. **Configurar dominios personalizados** (opcional)

