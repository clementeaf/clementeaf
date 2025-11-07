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

✅ **Configuradas con RDS y AWS Secrets Manager**

- **JWT_SECRET:** Configurado en AWS Secrets Manager
- **JWT_EXPIRES_IN:** `7d`
- **DB_HOST:** `banados-db.cupsguy6sr11.us-east-1.rds.amazonaws.com` (RDS)
- **DB_PORT:** `5432`
- **DB_USERNAME:** `postgres`
- **DB_PASSWORD:** Configurado en AWS Secrets Manager
- **DB_DATABASE:** `banados_db`

## ✅ Configuración de RDS Completada

### Base de Datos RDS PostgreSQL

✅ **Instancia RDS creada y configurada**

- **Identificador:** `banados-db`
- **Endpoint:** `banados-db.cupsguy6sr11.us-east-1.rds.amazonaws.com`
- **Puerto:** `5432`
- **Usuario:** `postgres`
- **Base de datos:** `banados_db`
- **Estado:** `available`
- **Región:** `us-east-1`

### AWS Secrets Manager

✅ **Credenciales almacenadas en AWS Secrets Manager**

- **Secreto:** `banados-db-credentials`
- **Contiene:** DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE, JWT_SECRET, JWT_EXPIRES_IN

### Desplegar con RDS

El backend está configurado para usar RDS. Para desplegar:

```bash
cd backend
./deploy-with-secrets.sh [stage]
```

O manualmente:

```bash
cd backend
# Obtener credenciales de Secrets Manager
SECRET_JSON=$(aws secretsmanager get-secret-value --secret-id banados-db-credentials --region us-east-1 --query 'SecretString' --output text)
export DB_HOST=$(echo "$SECRET_JSON" | python3 -c "import sys, json; print(json.load(sys.stdin)['DB_HOST'])")
export DB_PASSWORD=$(echo "$SECRET_JSON" | python3 -c "import sys, json; print(json.load(sys.stdin)['DB_PASSWORD'])")
export JWT_SECRET=$(echo "$SECRET_JSON" | python3 -c "import sys, json; print(json.load(sys.stdin)['JWT_SECRET'])")
export DB_PORT=5432
export DB_USERNAME=postgres
export DB_DATABASE=banados_db
export JWT_EXPIRES_IN=7d

# Desplegar
npm run build
serverless deploy --force
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

- ✅ **Base de datos:** Configurada con RDS PostgreSQL
- ✅ **JWT_SECRET:** Configurado en AWS Secrets Manager
- ✅ **DB_PASSWORD:** Configurado en AWS Secrets Manager
- ✅ **CORS:** Configurado en todos los endpoints de autenticación
- ✅ **API Gateway:** Configurado automáticamente por Serverless Framework
- ✅ **AWS Secrets Manager:** Credenciales almacenadas de forma segura

