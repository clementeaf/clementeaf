# Deployment Safeguards - Prevención de UPDATE_ROLLBACK

## Problemas Corregidos

### 1. ❌ Handlers Críticos Inexistentes
**Problema:** `deploy.sh` verificaba `dist/modules/Products/handlers/getAllProducts.js` que no existe
**Solución:** Actualizado a handlers reales que existen en el proyecto

### 2. ❌ VPC Configuration con IDs Inválidos por Defecto
**Problema:** `serverless.yml` tenía IDs de security groups/subnets hardcodeados como fallback que podrían no existir
**Solución:** Removidos los defaults; requieren variables de entorno `LAMBDA_SECURITY_GROUP_ID`, `SUBNET_ID_1`, `SUBNET_ID_2`

### 3. ❌ Falta de Permisos EC2 para ENIs
**Problema:** Lambda sin permisos VPC para crear/gestionar network interfaces fallaba
**Solución:** Agregados permisos EC2 requeridos

### 4. ❌ Sin Recuperación de Rollback Automática
**Problema:** Si el deploy fallaba, el stack quedaba en `UPDATE_ROLLBACK_FAILED` y bloqueaba futuros deploys
**Solución:** Nuevo script `recover-rollback.sh` que lo maneja automáticamente

### 5. ❌ Validaciones Incompletas Pre-Deploy
**Problema:** No se detectaban problemas antes de intentar desplegar
**Solución:** Mejoras en `pre-deploy-check.sh` para verificar Cognito, dependencias críticas, VPC config

---

## Checklist Pre-Deploy

```bash
# 1. Verificar compilación
npm run build

# 2. Ejecutar validaciones
./scripts/pre-deploy-check.sh dev

# 3. Si hay rollback fallido, recuperarse
./scripts/recover-rollback.sh dev

# 4. Desplegar
./deploy.sh dev
```

---

## Variables de Entorno Requeridas (Producción)

```bash
# VPC (REQUERIDO si Lambda usa VPC)
export LAMBDA_SECURITY_GROUP_ID=sg-xxxxx
export SUBNET_ID_1=subnet-xxxxx
export SUBNET_ID_2=subnet-xxxxx

# Database
export DB_HOST=your-rds-endpoint
export DB_PASSWORD=secure-password
export DB_DATABASE=postgres

# Auth
export JWT_SECRET=your-secure-secret

# Cognito (ya tiene defaults)
export COGNITO_USER_POOL_ID=us-east-1_ET27TiV8Y
export COGNITO_CLIENT_ID=3ido9jo5thqnl5c05vlna3c0no
```

---

## Scripts Disponibles

### `./scripts/pre-deploy-check.sh [stage]`
Verifica antes de desplegar:
- ✅ TypeScript compila
- ✅ Handlers críticos existen
- ✅ Variables de entorno configuradas
- ✅ CloudFormation stack en estado válido
- ✅ Cognito configurado
- ✅ AWS CLI disponible

### `./scripts/recover-rollback.sh [stage] [region]`
Recupera automáticamente de:
- `UPDATE_ROLLBACK_FAILED` → Intenta `continue-update-rollback`
- `DELETE_FAILED` → Intenta eliminar nuevamente
- `CREATE_FAILED` → Elimina y crea nuevo
- `ROLLBACK_COMPLETE` → Listo para redeploy

### `./deploy.sh [stage]`
**Ahora incluye:**
1. ✅ Detección de rollback fallido
2. ✅ Recuperación automática si es necesario
3. ✅ Validaciones pre-deploy
4. ✅ Compilación TypeScript
5. ✅ Deploy con Serverless Framework

---

## Configuración de serverless.yml - Cambios

```yaml
custom:
  serverless-offline:
    useInProcess: true  # Requerido para rutas profundas
    httpPort: 9500

provider:
  versionFunctions: false  # Evita acumulación de versiones
  
  vpc:
    securityGroupIds:
      - ${env:LAMBDA_SECURITY_GROUP_ID}    # SIN default fallido
    subnetIds:
      - ${env:SUBNET_ID_1}                  # SIN default fallido
      - ${env:SUBNET_ID_2}
  
  iam:
    role:
      statements:
        # ... permisos VPC agregados
        - Effect: Allow
          Action:
            - ec2:CreateNetworkInterface
            - ec2:DescribeNetworkInterfaces
            - ec2:DeleteNetworkInterface
            # ... etc
```

---

## Troubleshooting

### Si deploy falla con UPDATE_ROLLBACK_FAILED

```bash
# El deploy.sh lo intenta automáticamente, pero puedes manual:
./scripts/recover-rollback.sh dev us-east-1

# Si aún falla, ver detalles:
aws cloudformation describe-stack-events \
  --stack-name backend-dev \
  --region us-east-1 \
  --max-items 20

# Ver recursos bloqueados:
aws cloudformation describe-stack-resources \
  --stack-name backend-dev \
  --region us-east-1 \
  --query 'StackResources[?ResourceStatus==`DELETE_FAILED`]'
```

### Si VPC IDs no existen

```bash
# Listar security groups disponibles
aws ec2 describe-security-groups --region us-east-1

# Listar subnets disponibles
aws ec2 describe-subnets --region us-east-1

# Configurar variables
export LAMBDA_SECURITY_GROUP_ID=sg-xxxxx
export SUBNET_ID_1=subnet-xxxxx
export SUBNET_ID_2=subnet-xxxxx

# Redeploy
./deploy.sh dev
```

---

## Mejores Prácticas Implementadas

✅ **Validación pre-deploy exhaustiva**  
✅ **Recuperación automática de rollbacks**  
✅ **Handlers críticos verificados**  
✅ **Permisos VPC completos**  
✅ **Cognito configurado correctamente**  
✅ **Variables de entorno sin defaults fallidos**  
✅ **Scripts ejecutables documentados**

---

## Próximos Pasos Recomendados

1. Probar despliegue: `./deploy.sh dev`
2. Verificar endpoints: `./scripts/test-all-endpoints.sh`
3. Monitorear logs: `aws logs tail /aws/lambda/backend-dev --follow`
