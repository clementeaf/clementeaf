# Guía de Despliegue - Frontends a AWS S3/CloudFront

Esta guía explica cómo desplegar los tres frontends (`admin-frontend`, `auth-frontend`, `client-frontend`) a AWS S3 y CloudFront.

## Prerrequisitos

1. **AWS CLI instalado y configurado**
   ```bash
   aws --version
   aws configure
   ```

2. **Permisos IAM necesarios:**
   - `s3:CreateBucket`
   - `s3:PutBucketPolicy`
   - `s3:PutBucketWebsite`
   - `s3:PutBucketCors`
   - `s3:PutObject`
   - `s3:DeleteObject`
   - `s3:ListBucket`
   - `cloudfront:CreateDistribution`
   - `cloudfront:CreateInvalidation`
   - `cloudfront:GetDistribution`

## Configuración Inicial (Primera vez)

### Opción 1: Script Automático (Recomendado)

Ejecuta el script de configuración que crea automáticamente los buckets S3 y distribuciones CloudFront:

```bash
./setup-cloudfront.sh [region]
```

**Ejemplo:**
```bash
./setup-cloudfront.sh us-east-1
```

Este script:
- ✅ Crea 3 buckets S3 (uno para cada frontend)
- ✅ Configura hosting estático en cada bucket
- ✅ Configura políticas públicas y CORS
- ✅ Crea 3 distribuciones CloudFront
- ✅ Configura errores personalizados para SPAs (404 → index.html)

**⚠️ Nota:** Las distribuciones CloudFront pueden tardar 15-20 minutos en estar completamente desplegadas.

### Opción 2: Configuración Manual

Si prefieres configurar manualmente, sigue los pasos en [DEPLOY.md](./admin-frontend/DEPLOY.md) para cada frontend.

## Configuración de Variables de Entorno

Después de ejecutar el script de configuración, guarda la información en archivos `.env` en cada frontend:

### admin-frontend/.env
```bash
S3_BUCKET_NAME=banados-admin-frontend-XXXXXXXX
CLOUDFRONT_DISTRIBUTION_ID=EXXXXXXXXXXXXX
AWS_REGION=us-east-1
```

### auth-frontend/.env
```bash
S3_BUCKET_NAME=banados-auth-frontend-XXXXXXXX
CLOUDFRONT_DISTRIBUTION_ID=EXXXXXXXXXXXXX
AWS_REGION=us-east-1
```

### client-frontend/.env
```bash
S3_BUCKET_NAME=banados-client-frontend-XXXXXXXX
CLOUDFRONT_DISTRIBUTION_ID=EXXXXXXXXXXXXX
AWS_REGION=us-east-1
```

## Despliegue

### Desplegar un Frontend Específico

#### admin-frontend
```bash
cd admin-frontend
npm run deploy
```

O con parámetros explícitos:
```bash
cd admin-frontend
./deploy.sh banados-admin-frontend-XXXXXXXX EXXXXXXXXXXXXX
```

#### auth-frontend
```bash
cd auth-frontend
npm run deploy
```

O con parámetros explícitos:
```bash
cd auth-frontend
./deploy.sh banados-auth-frontend-XXXXXXXX EXXXXXXXXXXXXX
```

#### client-frontend
```bash
cd client-frontend
npm run deploy
```

O con parámetros explícitos:
```bash
cd client-frontend
./deploy.sh banados-client-frontend-XXXXXXXX EXXXXXXXXXXXXX
```

### Desplegar Todos los Frontends

```bash
# Admin Frontend
cd admin-frontend && npm run deploy && cd ..

# Auth Frontend
cd auth-frontend && npm run deploy && cd ..

# Client Frontend
cd client-frontend && npm run deploy && cd ..
```

## URLs de Acceso

Después del despliegue, cada frontend estará disponible en:

- **Admin Frontend:** `https://<cloudfront-domain>.cloudfront.net`
- **Auth Frontend:** `https://<cloudfront-domain>.cloudfront.net`
- **Client Frontend:** `https://<cloudfront-domain>.cloudfront.net`

También están disponibles directamente desde S3 (sin HTTPS):
- `http://<bucket-name>.s3-website-<region>.amazonaws.com`

## Configuración de CloudFront

### Características Configuradas

- ✅ **HTTPS automático** (redirect HTTP to HTTPS)
- ✅ **Compresión habilitada**
- ✅ **Cache optimizado:**
  - Archivos estáticos: 1 año
  - HTML: 0 (must-revalidate)
- ✅ **SPA Support:** 404 → index.html (código 200)
- ✅ **Invalidación automática** en cada despliegue

### Verificar Estado de Distribución

```bash
aws cloudfront get-distribution --id <DISTRIBUTION_ID>
```

### Listar Invalidaciones

```bash
aws cloudfront list-invalidations --distribution-id <DISTRIBUTION_ID>
```

## Configuración de Dominio Personalizado (Opcional)

### 1. Registrar Dominio en Route 53

### 2. Solicitar Certificado SSL en ACM

```bash
aws acm request-certificate \
  --domain-name *.tudominio.com \
  --validation-method DNS \
  --region us-east-1
```

### 3. Asociar Certificado a CloudFront

Edita la distribución CloudFront en la consola de AWS:
- Agrega el dominio alternativo (CNAME)
- Selecciona el certificado SSL
- Actualiza la distribución

### 4. Crear Registro CNAME en Route 53

Crea un registro CNAME apuntando al dominio de CloudFront.

## Troubleshooting

### Error: "Access Denied"

- Verificar permisos del bucket
- Verificar credenciales de AWS
- Verificar políticas IAM

### Error: "Invalidation failed"

- Verificar que el Distribution ID sea correcto
- Verificar permisos de CloudFront
- Esperar a que la distribución esté completamente desplegada

### Las rutas no funcionan (404)

- Verificar que el bucket tenga configurado el error document como `index.html`
- Verificar configuración de CloudFront para errores 404
- Verificar que la invalidación se haya completado

### Bucket ya existe

Si el bucket ya existe, el script fallará. Puedes:
1. Usar un bucket existente
2. Eliminar el bucket existente
3. Usar un nombre diferente

## Comandos Útiles

### Ver archivos en S3
```bash
aws s3 ls s3://<bucket-name>/
```

### Sincronizar manualmente
```bash
aws s3 sync dist/ s3://<bucket-name>/ --delete --region us-east-1
```

### Invalidar caché manualmente
```bash
aws cloudfront create-invalidation \
  --distribution-id <DISTRIBUTION_ID> \
  --paths "/*"
```

## Notas Importantes

- ⚠️ Los buckets S3 deben tener nombres únicos globalmente
- ⚠️ Las distribuciones CloudFront tardan 15-20 minutos en desplegarse completamente
- ⚠️ Las invalidaciones de CloudFront pueden tardar varios minutos
- ⚠️ Los archivos estáticos tienen cache de 1 año
- ⚠️ Los archivos HTML tienen cache de 0 (must-revalidate) para SPAs
- ⚠️ El script elimina archivos antiguos del bucket (`--delete`)

## Próximos Pasos

1. **Configurar CI/CD** (GitHub Actions, CodePipeline)
2. **Configurar dominios personalizados**
3. **Configurar monitoreo y alertas**
4. **Optimizar configuración de cache**

