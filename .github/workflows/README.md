# GitHub Actions Workflows

Este directorio contiene los workflows de GitHub Actions para despliegue automático.

## Workflows Disponibles

### Frontends

1. **deploy-auth-frontend.yml** - Despliega `auth-frontend` cuando hay cambios en `auth-frontend/`
2. **deploy-admin-frontend.yml** - Despliega `admin-frontend` cuando hay cambios en `admin-frontend/`
3. **deploy-client-frontend.yml** - Despliega `client-frontend` cuando hay cambios en `client-frontend/`

### Backend

4. **deploy-backend.yml** - Despliega `backend` cuando hay cambios en `backend/`

## Configuración Requerida

Para que los workflows funcionen, necesitas configurar los siguientes secrets en GitHub:

### Secrets de GitHub

Ve a: **Settings → Secrets and variables → Actions → New repository secret**

Configura los siguientes secrets:

1. **AWS_ACCESS_KEY_ID** - Tu AWS Access Key ID
2. **AWS_SECRET_ACCESS_KEY** - Tu AWS Secret Access Key

## Cómo Funciona

### Frontends

Cuando haces push a `main` con cambios en una carpeta de frontend:

1. El workflow detecta los cambios en la carpeta correspondiente
2. Instala las dependencias con `npm ci`
3. Construye la aplicación con `npm run build`
4. Configura las credenciales de AWS
5. Despliega a S3 y CloudFront usando el script `deploy.sh`
6. Invalida la caché de CloudFront automáticamente

### Backend

Cuando haces push a `main` con cambios en `backend/`:

1. El workflow detecta los cambios en `backend/`
2. Instala las dependencias con `npm ci`
3. Configura las credenciales de AWS
4. Obtiene las credenciales de la base de datos desde AWS Secrets Manager
5. Compila TypeScript con `npm run build`
6. Despliega a AWS Lambda usando Serverless Framework

## Ejemplo de Uso

### Desplegar Auth Frontend

```bash
# Hacer cambios en auth-frontend
cd auth-frontend
# ... hacer cambios ...
git add auth-frontend/
git commit -m "feat: actualizar auth-frontend"
git push origin main
```

El workflow se ejecutará automáticamente y desplegará los cambios.

### Desplegar Backend

```bash
# Hacer cambios en backend
cd backend
# ... hacer cambios ...
git add backend/
git commit -m "feat: actualizar backend"
git push origin main
```

El workflow se ejecutará automáticamente y desplegará los cambios.

## Verificación

Puedes verificar el estado de los despliegues en:

**GitHub → Actions → [Nombre del Workflow]**

## Notas Importantes

- Los workflows solo se ejecutan en la rama `main`
- Los workflows detectan cambios en las carpetas específicas usando `paths`
- Los despliegues son automáticos después de cada push a `main`
- Los frontends se despliegan a S3 y CloudFront
- El backend se despliega a AWS Lambda

## Troubleshooting

### Error: "AWS credentials not configured"

Asegúrate de haber configurado los secrets `AWS_ACCESS_KEY_ID` y `AWS_SECRET_ACCESS_KEY` en GitHub.

### Error: "Secrets Manager access denied"

Asegúrate de que las credenciales de AWS tengan permisos para acceder a AWS Secrets Manager.

### Error: "S3 bucket not found"

Verifica que los nombres de los buckets en los workflows coincidan con los buckets reales en AWS.

