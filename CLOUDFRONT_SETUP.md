# Configuración de CloudFront - Guía Rápida

## Resumen

Este proyecto tiene tres frontends que necesitan ser desplegados a AWS S3 y CloudFront:

1. **admin-frontend** - Panel de administración
2. **auth-frontend** - Autenticación
3. **client-frontend** - Aplicación cliente

## Configuración Inicial (Una sola vez)

### Paso 1: Ejecutar Script de Configuración

```bash
./setup-cloudfront.sh us-east-1
```

Este script crea automáticamente:
- 3 buckets S3 (uno para cada frontend)
- 3 distribuciones CloudFront
- Configuración de hosting estático
- Políticas públicas y CORS
- Soporte para SPAs (404 → index.html)

### Paso 2: Guardar Información de Configuración

El script mostrará la información de cada frontend. Guárdala en archivos `.env`:

**admin-frontend/.env**
```
S3_BUCKET_NAME=banados-admin-frontend-XXXXXXXX
CLOUDFRONT_DISTRIBUTION_ID=EXXXXXXXXXXXXX
AWS_REGION=us-east-1
```

**auth-frontend/.env**
```
S3_BUCKET_NAME=banados-auth-frontend-XXXXXXXX
CLOUDFRONT_DISTRIBUTION_ID=EXXXXXXXXXXXXX
AWS_REGION=us-east-1
```

**client-frontend/.env**
```
S3_BUCKET_NAME=banados-client-frontend-XXXXXXXX
CLOUDFRONT_DISTRIBUTION_ID=EXXXXXXXXXXXXX
AWS_REGION=us-east-1
```

## Despliegue

### Desplegar un Frontend

```bash
cd admin-frontend
npm run deploy
```

```bash
cd auth-frontend
npm run deploy
```

```bash
cd client-frontend
npm run deploy
```

### Desplegar Todos

```bash
cd admin-frontend && npm run deploy && cd ..
cd auth-frontend && npm run deploy && cd ..
cd client-frontend && npm run deploy && cd ..
```

## Verificar Estado

### Verificar Distribución CloudFront

```bash
aws cloudfront get-distribution --id <DISTRIBUTION_ID>
```

### Verificar Archivos en S3

```bash
aws s3 ls s3://<BUCKET_NAME>/
```

## URLs de Acceso

Cada frontend estará disponible en:
- **CloudFront:** `https://<cloudfront-domain>.cloudfront.net`
- **S3 Directo:** `http://<bucket-name>.s3-website-<region>.amazonaws.com`

## Notas

- ⏳ Las distribuciones CloudFront tardan 15-20 minutos en desplegarse
- ⚠️ Los buckets deben tener nombres únicos globalmente
- ✅ Los scripts de deploy invalidan automáticamente el caché de CloudFront

## Troubleshooting

Si el script de setup falla:
1. Verifica que AWS CLI esté configurado: `aws configure`
2. Verifica permisos IAM
3. Verifica que los nombres de buckets sean únicos
4. Si un bucket ya existe, elimínalo o usa otro nombre

Para más detalles, ver [DEPLOY.md](./DEPLOY.md)

