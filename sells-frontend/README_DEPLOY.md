# Sells Frontend - Deployment Guide

## 🚀 Configuración Actual

### URLs de Producción
- **API Backend:** https://zzv7qnwgz1.execute-api.us-east-1.amazonaws.com/dev
- **S3 Website:** http://banados-sells-frontend-1765796902.s3-website-us-east-1.amazonaws.com
- **CloudFront:** https://dnewvm8elfnco.cloudfront.net

### AWS Resources
- **S3 Bucket:** `banados-sells-frontend-1765796902`
- **CloudFront Distribution ID:** `E1ONQYF8BPZI0X`
- **Region:** `us-east-1`

---

## 📋 Variables de Entorno

El archivo `.env` contiene:
```env
S3_BUCKET_NAME=banados-sells-frontend-1765796902
CLOUDFRONT_DISTRIBUTION_ID=E1ONQYF8BPZI0X
AWS_REGION=us-east-1
VITE_API_URL=https://zzv7qnwgz1.execute-api.us-east-1.amazonaws.com/dev
```

**⚠️ Importante:** NO modificar `VITE_API_URL` sin antes verificar que el nuevo endpoint existe.

---

## 🛠️ Deploy Manual

### Opción 1: Usando el script de deploy
```bash
# Desde el directorio sells-frontend
./deploy.sh
```

### Opción 2: Paso a paso
```bash
# 1. Construir la aplicación
npm run build

# 2. Subir a S3
aws s3 sync dist/ s3://banados-sells-frontend-1765796902/ \
  --region us-east-1 \
  --delete

# 3. Invalidar cache de CloudFront
aws cloudfront create-invalidation \
  --distribution-id E1ONQYF8BPZI0X \
  --paths "/*"
```

---

## 🔍 Verificación Post-Deploy

### 1. Verificar build local
```bash
# Debe contener la URL correcta
grep -r "zzv7qnwgz1" dist/

# NO debe contener URLs viejas
grep -r "7ebampwqf4" dist/  # Debe retornar vacío
```

### 2. Verificar S3
```bash
curl http://banados-sells-frontend-1765796902.s3-website-us-east-1.amazonaws.com
```

### 3. Verificar CloudFront (esperar 10-15 min después de invalidación)
```bash
curl https://dnewvm8elfnco.cloudfront.net
```

### 4. Verificar API Backend
```bash
curl https://zzv7qnwgz1.execute-api.us-east-1.amazonaws.com/dev/hello
```

---

## 🐛 Troubleshooting

### Error: "API Gateway 404"
**Problema:** La app intenta conectarse a un endpoint que no existe.

**Solución:**
1. Verificar `.env`: `cat .env | grep VITE_API_URL`
2. Debe ser: `https://zzv7qnwgz1.execute-api.us-east-1.amazonaws.com/dev`
3. Si es diferente, corregir y hacer rebuild + redeploy

### Error: "CORS"
**Problema:** El backend no permite requests desde el frontend.

**Solución:**
1. Verificar configuración CORS en `backend/serverless.yml`
2. Asegurar que `origin: '*'` está configurado

### Error: "CloudFront 403"
**Problema:** El bucket S3 no es accesible desde CloudFront.

**Solución:**
```bash
# Verificar política del bucket
aws s3api get-bucket-policy --bucket banados-sells-frontend-1765796902

# Verificar public access block
aws s3api get-public-access-block --bucket banados-sells-frontend-1765796902
```

---

## 📦 Estructura de Archivos Desplegados

```
dist/
├── index.html              # Punto de entrada (cache: 0)
├── vite.svg               # Assets estáticos
└── assets/
    ├── index-[hash].css   # Estilos (cache: 1 año)
    └── index-[hash].js    # JavaScript bundle (cache: 1 año)
```

---

## 🔐 Permisos Necesarios

Para hacer deploy, necesitas los siguientes permisos AWS:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::banados-sells-frontend-1765796902",
        "arn:aws:s3:::banados-sells-frontend-1765796902/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation"
      ],
      "Resource": "arn:aws:cloudfront::*:distribution/E1ONQYF8BPZI0X"
    }
  ]
}
```

---

## 📝 Notas Adicionales

1. **Cache de CloudFront:** La invalidación puede tardar 5-10 minutos
2. **Build Time:** ~10-20 segundos para builds normales
3. **Deploy Time:** ~30-60 segundos para subir a S3
4. **Variables de Entorno:** Se compilan en el bundle (no son secretos dinámicos)

---

**Última actualización:** 2025-12-15
**Configurado por:** Warp AI Agent
