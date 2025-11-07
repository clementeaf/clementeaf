# Configuración de GitHub Actions

Este documento explica cómo configurar GitHub Actions para despliegue automático.

## Workflows Creados

✅ **4 workflows configurados:**

1. **deploy-auth-frontend.yml** - Despliega `auth-frontend` cuando hay cambios en `auth-frontend/`
2. **deploy-admin-frontend.yml** - Despliega `admin-frontend` cuando hay cambios en `admin-frontend/`
3. **deploy-client-frontend.yml** - Despliega `client-frontend` cuando hay cambios en `client-frontend/`
4. **deploy-backend.yml** - Despliega `backend` cuando hay cambios en `backend/`

## Configuración de Secrets en GitHub

### Paso 1: Acceder a Secrets

1. Ve a tu repositorio en GitHub
2. Haz clic en **Settings** (Configuración)
3. En el menú lateral, haz clic en **Secrets and variables** → **Actions**
4. Haz clic en **New repository secret**

### Paso 2: Configurar Secrets

Necesitas crear los siguientes secrets:

#### 1. AWS_ACCESS_KEY_ID

- **Name:** `AWS_ACCESS_KEY_ID`
- **Secret:** Tu AWS Access Key ID
- **Descripción:** Credencial de AWS para acceso a S3, CloudFront y Lambda

#### 2. AWS_SECRET_ACCESS_KEY

- **Name:** `AWS_SECRET_ACCESS_KEY`
- **Secret:** Tu AWS Secret Access Key
- **Descripción:** Credencial secreta de AWS

### Paso 3: Verificar Permisos de AWS

Asegúrate de que el usuario de AWS tenga los siguientes permisos:

#### Para Frontends (S3 y CloudFront):

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
        "s3:ListBucket",
        "s3:PutBucketPolicy",
        "s3:GetBucketPolicy",
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation",
        "cloudfront:ListInvalidations"
      ],
      "Resource": [
        "arn:aws:s3:::banados-*-frontend-*",
        "arn:aws:s3:::banados-*-frontend-*/*",
        "arn:aws:cloudfront::*:distribution/*"
      ]
    }
  ]
}
```

#### Para Backend (Lambda y Secrets Manager):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "lambda:*",
        "apigateway:*",
        "cloudformation:*",
        "iam:*",
        "logs:*",
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "*"
    }
  ]
}
```

## Cómo Funciona

### Frontends

Cuando haces push a `main` con cambios en una carpeta de frontend:

1. ✅ El workflow detecta los cambios usando `paths`
2. ✅ Instala dependencias con `npm ci`
3. ✅ Construye la aplicación con `npm run build`
4. ✅ Configura credenciales de AWS
5. ✅ Despliega a S3 y CloudFront
6. ✅ Invalida la caché de CloudFront automáticamente

### Backend

Cuando haces push a `main` con cambios en `backend/`:

1. ✅ El workflow detecta los cambios usando `paths`
2. ✅ Instala dependencias con `npm ci`
3. ✅ Configura credenciales de AWS
4. ✅ Obtiene credenciales de RDS desde AWS Secrets Manager
5. ✅ Compila TypeScript
6. ✅ Despliega a AWS Lambda con Serverless Framework

## Ejemplo de Uso

### Desplegar Client Frontend

```bash
# Hacer cambios en client-frontend
cd client-frontend
# ... hacer cambios ...
git add client-frontend/
git commit -m "feat: actualizar client-frontend"
git push origin main
```

El workflow `deploy-client-frontend.yml` se ejecutará automáticamente.

### Desplegar Backend

```bash
# Hacer cambios en backend
cd backend
# ... hacer cambios ...
git add backend/
git commit -m "feat: actualizar backend"
git push origin main
```

El workflow `deploy-backend.yml` se ejecutará automáticamente.

## Verificación

Puedes verificar el estado de los despliegues en:

**GitHub → Actions → [Nombre del Workflow]**

## Configuración de Buckets y CloudFront

Los workflows están configurados con los siguientes valores:

### Auth Frontend
- **Bucket:** `banados-auth-frontend-1762469469`
- **CloudFront ID:** `E296Z8WIYMY1TJ`
- **URL:** `https://d1wdj9ggvinelv.cloudfront.net`

### Admin Frontend
- **Bucket:** `banados-admin-frontend-1762469469`
- **CloudFront ID:** `EHRAZA3DEI3JP`
- **URL:** `https://d13cunasrg048d.cloudfront.net`

### Client Frontend
- **Bucket:** `banados-client-frontend-1762469469`
- **CloudFront ID:** `E19017Y3Y6IWLG`
- **URL:** `https://d30lw2uu9x30lw.cloudfront.net`

### Backend
- **API Gateway:** `https://9hzayjhnz8.execute-api.us-east-1.amazonaws.com/dev`
- **Secrets Manager:** `banados-db-credentials`

## Troubleshooting

### Error: "AWS credentials not configured"

**Solución:** Verifica que hayas configurado los secrets `AWS_ACCESS_KEY_ID` y `AWS_SECRET_ACCESS_KEY` en GitHub.

### Error: "Secrets Manager access denied"

**Solución:** Asegúrate de que las credenciales de AWS tengan permisos para acceder a AWS Secrets Manager.

### Error: "S3 bucket not found"

**Solución:** Verifica que los nombres de los buckets en los workflows coincidan con los buckets reales en AWS.

### Error: "Serverless command not found"

**Solución:** El workflow instala Serverless Framework automáticamente. Si persiste el error, verifica que el workflow esté usando la versión correcta.

### Error: "Python not found"

**Solución:** El workflow usa Python 3 que viene preinstalado en Ubuntu. Si persiste el error, verifica que el workflow esté usando `python3`.

## Notas Importantes

- ⚠️ Los workflows solo se ejecutan en la rama `main`
- ⚠️ Los workflows detectan cambios usando `paths` - solo se ejecutan si hay cambios en las carpetas específicas
- ⚠️ Los despliegues son automáticos después de cada push a `main`
- ⚠️ Los frontends se despliegan a S3 y CloudFront
- ⚠️ El backend se despliega a AWS Lambda
- ⚠️ Las credenciales de AWS deben tener los permisos necesarios

## Próximos Pasos

1. ✅ Configurar los secrets en GitHub
2. ✅ Verificar que los permisos de AWS sean correctos
3. ✅ Hacer un push de prueba para verificar que los workflows funcionan
4. ✅ Monitorear los despliegues en GitHub Actions

