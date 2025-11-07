# Información de Despliegue - Backend

**Fecha de despliegue:** 2025-11-06

## Despliegue Completado ✅

### Backend API (AWS Lambda + API Gateway)

- **Stack:** `backend-dev`
- **Región:** `us-east-1`
- **Stage:** `dev`
- **API Gateway ID:** `9hzayjhnz8`

### Endpoints Disponibles

**Base URL:** `https://9hzayjhnz8.execute-api.us-east-1.amazonaws.com/dev`

#### Endpoints de Autenticación

- **POST** `/auth/register` - Registro de usuarios
- **POST** `/auth/login` - Login de usuarios
- **GET** `/auth/me` - Obtener información del usuario actual
- **POST** `/auth/logout` - Logout de usuarios

#### Endpoints de Prueba

- **GET** `/hello` - Endpoint de prueba

### Funciones Lambda Desplegadas

- `backend-dev-hello` (62 MB)
- `backend-dev-register` (62 MB)
- `backend-dev-login` (62 MB)
- `backend-dev-me` (62 MB)
- `backend-dev-logout` (62 MB)

## Configuración Actual

### Variables de Entorno (Lambda)

- **JWT_SECRET:** `your-secret-key-change-in-production` (⚠️ Cambiar en producción)
- **JWT_EXPIRES_IN:** `7d`
- **DB_HOST:** `localhost` (⚠️ No funcionará en Lambda, necesita RDS)
- **DB_PORT:** `5432`
- **DB_USERNAME:** `postgres`
- **DB_PASSWORD:** `postgres` (⚠️ Cambiar en producción)
- **DB_DATABASE:** `banados_db`

## ⚠️ Acciones Requeridas para Producción

### 1. Crear Base de Datos RDS PostgreSQL

El backend actualmente está configurado para usar `localhost` como DB_HOST, lo cual no funcionará en Lambda. Necesitas:

1. **Crear una instancia RDS PostgreSQL:**
   ```bash
   aws rds create-db-instance \
     --db-instance-identifier banados-db \
     --db-instance-class db.t3.micro \
     --engine postgres \
     --master-username postgres \
     --master-user-password <TU_PASSWORD_SEGURO> \
     --allocated-storage 20 \
     --region us-east-1
   ```

2. **Obtener el endpoint de la base de datos:**
   ```bash
   aws rds describe-db-instances \
     --db-instance-identifier banados-db \
     --query 'DBInstances[0].Endpoint.Address' \
     --output text
   ```

### 2. Configurar Variables de Entorno para Producción

Antes de desplegar a producción, configura:

```bash
export DB_HOST=<RDS_ENDPOINT>
export DB_PASSWORD=<TU_PASSWORD_SEGURO>
export JWT_SECRET=<SECRETO_JWT_SEGURO>
export DB_USERNAME=postgres
export DB_DATABASE=banados_db
export DB_PORT=5432
```

### 3. Desplegar a Producción

```bash
cd backend
./deploy.sh prod
```

O manualmente:

```bash
cd backend
npm run deploy:aws
```

## Actualizar Frontends

Los frontends necesitan actualizar la URL del backend en producción:

### auth-frontend/src/api/endpoints.ts

```typescript
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://9hzayjhnz8.execute-api.us-east-1.amazonaws.com/dev'
  : 'http://localhost:9500';
```

## Comandos Útiles

### Ver logs de Lambda

```bash
aws logs tail /aws/lambda/backend-dev-register --follow
```

### Ver información del stack

```bash
aws cloudformation describe-stacks --stack-name backend-dev
```

### Eliminar el stack

```bash
cd backend
serverless remove
```

## Notas Importantes

- ⚠️ **Base de datos:** Actualmente configurada para `localhost`, no funcionará en Lambda
- ⚠️ **JWT_SECRET:** Usa el valor por defecto, cambiar en producción
- ⚠️ **DB_PASSWORD:** Usa el valor por defecto, cambiar en producción
- ✅ **CORS:** Configurado en todos los endpoints de autenticación
- ✅ **API Gateway:** Configurado automáticamente por Serverless Framework

