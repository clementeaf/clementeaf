# Mejores Prácticas para Despliegues

Este documento describe las mejores prácticas para evitar problemas en los despliegues del backend.

## ✅ Checklist Pre-Deploy

Antes de cada despliegue, ejecuta:

```bash
./scripts/pre-deploy-check.sh [stage]
```

Este script valida automáticamente:
- ✅ Compilación de TypeScript exitosa
- ✅ Handlers críticos presentes
- ✅ Entidades TypeORM compiladas
- ✅ Configuración de serverless.yml correcta
- ✅ Variables de entorno para producción
- ✅ Estado del stack de CloudFormation
- ✅ Configuración de AWS CLI

## 🚀 Proceso de Despliegue

### 1. Desarrollo Local
```bash
# Compilar y probar localmente
npm run build
npm run dev
```

### 2. Validación Pre-Deploy
```bash
# Ejecutar validaciones automáticas
./scripts/pre-deploy-check.sh dev
```

### 3. Despliegue
```bash
# Desplegar a dev
./deploy.sh dev

# Desplegar a producción (requiere variables de entorno)
export DB_HOST=...
export DB_PASSWORD=...
export JWT_SECRET=...
./deploy.sh prod
```

## 📋 Configuración Crítica en serverless.yml

### ✅ Configuraciones Requeridas

1. **excludeDevDependencies: true**
   - Excluye dependencias de desarrollo del paquete
   - Reduce significativamente el tamaño del paquete

2. **versionFunctions: false**
   - Evita acumulación de versiones antiguas de Lambda
   - Reduce costos y complejidad

3. **useInProcess: true** (en serverless-offline)
   - Requerido para rutas profundas en TypeORM
   - Necesario para desarrollo local

### 📦 Optimización de Paquetes

El `package.patterns` en `serverless.yml` está optimizado para incluir solo:
- Dependencias de producción necesarias
- Paquetes específicos de `@aws-sdk` (no todo el SDK)
- TypeORM y sus dependencias
- Excluye: devDependencies, tipos TypeScript, herramientas de desarrollo

**NUNCA** agregues `package.individually: true` sin una razón específica, ya que puede causar que cada función empaquete todo.

## ⚠️ Problemas Comunes y Soluciones

### 1. Error: "Unzipped size must be smaller than 262144000 bytes"

**Causa:** El paquete Lambda es demasiado grande (>250MB)

**Solución:**
- Verifica que `excludeDevDependencies: true` está habilitado
- Revisa que `package.patterns` excluye dependencias innecesarias
- No uses `package.individually: true` a menos que sea necesario

### 2. Error: Stack en estado `UPDATE_ROLLBACK_FAILED` o `DELETE_FAILED`

**Causa:** El stack de CloudFormation está bloqueado

**Solución:**
```bash
# 1. Intentar continuar el rollback
aws cloudformation continue-update-rollback \
  --stack-name backend-dev \
  --region us-east-1

# 2. Si falla, identificar recursos bloqueantes
aws cloudformation describe-stack-resources \
  --stack-name backend-dev \
  --region us-east-1

# 3. Eliminar recursos bloqueantes manualmente (ej: S3 buckets)
aws s3 rb s3://[bucket-name] --force

# 4. Eliminar el stack
aws cloudformation delete-stack \
  --stack-name backend-dev \
  --region us-east-1
```

### 3. Error: "Handler not found"

**Causa:** El handler no existe en `dist/` o la ruta es incorrecta

**Solución:**
- Verifica que `npm run build` se ejecutó exitosamente
- Verifica que el handler existe en `dist/modules/[Module]/handlers/[nombre].js`
- Verifica que la ruta en `serverless.yml` es: `dist/modules/[Module]/handlers/[nombre].handler`

### 4. Error: "Entity not found" en TypeORM

**Causa:** Las entidades no están siendo incluidas en el paquete

**Solución:**
- Verifica que las entidades están en `dist/modules/**/*.entity.js`
- Verifica que `serverless.yml` incluye estas rutas en `package.patterns`
- Verifica que TypeORM está configurado para buscar en `dist/modules/**/*.entity.js`

## 🔍 Monitoreo Post-Deploy

Después de cada despliegue:

1. **Verificar estado del stack:**
```bash
aws cloudformation describe-stacks \
  --stack-name backend-dev \
  --region us-east-1 \
  --query 'Stacks[0].StackStatus'
```

2. **Obtener URL del API:**
```bash
aws cloudformation describe-stacks \
  --stack-name backend-dev \
  --region us-east-1 \
  --query 'Stacks[0].Outputs[?OutputKey==`ServiceEndpoint`].OutputValue' \
  --output text
```

3. **Probar endpoint crítico:**
```bash
curl https://[api-url]/dev/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```

## 📝 Mantenimiento Regular

### Limpieza de Versiones Antiguas de Lambda

Si `versionFunctions: false` no está configurado, puedes acumular versiones:

```bash
# Listar funciones Lambda
aws lambda list-functions --region us-east-1

# Eliminar versiones antiguas (cuidado: esto elimina todas las versiones excepto $LATEST)
aws lambda delete-function --function-name [function-name] --region us-east-1
```

### Limpieza de Stacks Antiguos

Si tienes múltiples stacks de prueba:

```bash
# Listar stacks
aws cloudformation list-stacks \
  --region us-east-1 \
  --query 'StackSummaries[?contains(StackName, `backend-`)].{Name:StackName,Status:StackStatus}'

# Eliminar stack (solo si está en estado estable)
aws cloudformation delete-stack \
  --stack-name backend-[stage] \
  --region us-east-1
```

## 🎯 Resumen de Comandos Rápidos

```bash
# Validación pre-deploy
./scripts/pre-deploy-check.sh dev

# Despliegue
./deploy.sh dev

# Ver estado del stack
aws cloudformation describe-stacks --stack-name backend-dev --region us-east-1

# Ver eventos del stack (últimos 10)
aws cloudformation describe-stack-events \
  --stack-name backend-dev \
  --region us-east-1 \
  --max-items 10

# Obtener URL del API
aws cloudformation describe-stacks \
  --stack-name backend-dev \
  --region us-east-1 \
  --query 'Stacks[0].Outputs[?OutputKey==`ServiceEndpoint`].OutputValue' \
  --output text
```

## ⚡ Mejoras Continuas

- Revisa regularmente el tamaño de los paquetes
- Monitorea los costos de Lambda
- Actualiza dependencias regularmente
- Mantén documentación actualizada
- Usa el script de validación pre-deploy siempre

