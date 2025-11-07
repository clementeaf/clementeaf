# URLs de CloudFront - Frontends

## URLs de Producción

### Admin Frontend
**URL:** `https://d13cunasrg048d.cloudfront.net`

**Información:**
- Bucket S3: `banados-admin-frontend-1762469469`
- CloudFront Distribution ID: `EHRAZA3DEI3JP`
- Región: `us-east-1`

---

### Auth Frontend
**URL:** `https://d1wdj9ggvinelv.cloudfront.net`

**Información:**
- Bucket S3: `banados-auth-frontend-1762469469`
- CloudFront Distribution ID: `E296Z8WIYMY1TJ`
- Región: `us-east-1`

---

### Client Frontend
**URL:** `https://d30lw2uu9x30lw.cloudfront.net`

**Información:**
- Bucket S3: `banados-client-frontend-1762469469`
- CloudFront Distribution ID: `E19017Y3Y6IWLG`
- Región: `us-east-1`

---

## URLs Alternativas (S3 Directo - Sin HTTPS)

Estas URLs están disponibles directamente desde S3, pero **no tienen HTTPS**:

- **Admin Frontend:** `http://banados-admin-frontend-1762469469.s3-website-us-east-1.amazonaws.com`
- **Auth Frontend:** `http://banados-auth-frontend-1762469469.s3-website-us-east-1.amazonaws.com`
- **Client Frontend:** `http://banados-client-frontend-1762469469.s3-website-us-east-1.amazonaws.com`

⚠️ **Recomendación:** Usar siempre las URLs de CloudFront (con HTTPS) para producción.

---

## Estado de Despliegue

✅ **Todos los frontends están desplegados y funcionando**

- ✅ Admin Frontend - Desplegado
- ✅ Auth Frontend - Desplegado
- ✅ Client Frontend - Desplegado

---

## Última Actualización

**Fecha:** 2025-11-06  
**Estado:** Activo

---

## Backend API (AWS Lambda + API Gateway)

**Base URL:** `https://9hzayjhnz8.execute-api.us-east-1.amazonaws.com/dev`

### Endpoints de Autenticación

- **POST** `/auth/register` - Registro de usuarios
- **POST** `/auth/login` - Login de usuarios
- **GET** `/auth/me` - Obtener información del usuario actual
- **POST** `/auth/logout` - Logout de usuarios

### Endpoints de Prueba

- **GET** `/hello` - Endpoint de prueba

**Stack:** `backend-dev`  
**Región:** `us-east-1`  
**Stage:** `dev`

⚠️ **Nota:** El backend está configurado para usar `localhost` como DB_HOST, lo cual no funcionará en Lambda. Se necesita configurar una base de datos RDS PostgreSQL en producción.

---

## Notas

- Las distribuciones CloudFront pueden tardar 15-20 minutos en estar completamente desplegadas después de cada actualización
- Los cambios se propagan automáticamente después de cada `npm run deploy`
- La invalidación de caché se realiza automáticamente en cada despliegue
- El backend está desplegado en AWS Lambda y usa API Gateway

