# Solución de Error 500 en Lambda - Login

## Problema
El endpoint `/dev/auth/login` está devolviendo error 500 (Internal Server Error) cuando se ejecuta en AWS Lambda.

## Posibles Causas

### 1. Timeout de Conexión a RDS
**Síntoma**: Lambda timeout (504) o error 500
**Causa**: La conexión a RDS está tardando demasiado o no se puede establecer

**Soluciones**:
- ✅ **Ya implementado**: Timeout aumentado a 30 segundos
- ✅ **Ya implementado**: Manejo de errores mejorado
- Verificar que el Security Group de RDS permita conexiones desde Lambda
- Verificar que Lambda esté en la misma VPC que RDS

### 2. Problemas de VPC/Security Groups
**Síntoma**: Timeout o "Connection refused"
**Causa**: Lambda no puede alcanzar RDS debido a configuración de red

**Verificar**:
1. Security Group de RDS debe permitir tráfico desde el Security Group de Lambda
2. Lambda debe estar en las subnets correctas
3. RDS debe estar en la misma VPC o tener acceso público habilitado

**Comandos para verificar**:
```bash
# Verificar Security Group de RDS
aws rds describe-db-instances \
  --db-instance-identifier banados-analytics-db \
  --query 'DBInstances[0].VpcSecurityGroups' \
  --region us-east-1

# Verificar Security Group de Lambda
aws lambda get-function-configuration \
  --function-name backend-dev-login \
  --query 'VpcConfig' \
  --region us-east-1
```

### 3. Credenciales Incorrectas
**Síntoma**: Error de autenticación
**Causa**: Variables de entorno incorrectas en Lambda

**Verificar**:
- `DB_HOST`: `banados-analytics-db.cupsguy6sr11.us-east-1.rds.amazonaws.com`
- `DB_PORT`: `5432`
- `DB_USERNAME`: `postgres`
- `DB_PASSWORD`: Debe ser la contraseña correcta
- `DB_DATABASE`: `postgres` (verificar si es correcto)

### 4. Base de Datos No Existe
**Síntoma**: Error "database does not exist"
**Causa**: La base de datos `postgres` no existe o el nombre es incorrecto

**Verificar**:
```bash
# Conectarse a RDS y verificar bases de datos
psql -h banados-analytics-db.cupsguy6sr11.us-east-1.rds.amazonaws.com \
     -U postgres \
     -d postgres \
     -c "\l"
```

### 5. Tabla de Usuarios No Existe
**Síntoma**: Error al consultar usuarios
**Causa**: Las tablas no se han creado o las migraciones no se han ejecutado

**Solución**:
- Verificar que `ENABLE_SYNC=true` esté configurado (solo para desarrollo)
- O ejecutar migraciones manualmente

## Cambios Implementados

### 1. Timeout Aumentado
```yaml
login:
  timeout: 30  # Aumentado de 15 a 30 segundos
  memorySize: 512
```

### 2. Manejo de Errores Mejorado
- Logging detallado de errores de conexión
- Mensajes de error más descriptivos
- Timeout de conexión configurado (30 segundos)

### 3. Configuración de Base de Datos
- Timeout de conexión: 30 segundos
- SSL configurado para producción
- Manejo de errores mejorado

## Pasos para Diagnosticar

### 1. Verificar Logs de CloudWatch
```bash
aws logs tail /aws/lambda/backend-dev-login --follow --region us-east-1
```

Buscar:
- Errores de conexión
- Timeouts
- Errores de autenticación
- Errores de base de datos

### 2. Verificar Estado de RDS
```bash
aws rds describe-db-instances \
  --db-instance-identifier banados-analytics-db \
  --query 'DBInstances[0].DBInstanceStatus' \
  --region us-east-1
```

Debe retornar: `available`

### 3. Probar Conexión Directa
```bash
# Desde tu máquina local (si tienes acceso)
psql -h banados-analytics-db.cupsguy6sr11.us-east-1.rds.amazonaws.com \
     -U postgres \
     -d postgres \
     -c "SELECT 1;"
```

### 4. Verificar Variables de Entorno en Lambda
```bash
aws lambda get-function-configuration \
  --function-name backend-dev-login \
  --query 'Environment.Variables' \
  --region us-east-1
```

## Soluciones Rápidas

### Opción 1: Usar AWS Secrets Manager
Si las credenciales están en Secrets Manager, actualizar Lambda para leerlas:
```yaml
environment:
  DB_HOST: ${ssm:/aws/reference/secretsmanager/banados-db-credentials~DB_HOST}
  DB_PASSWORD: ${ssm:/aws/reference/secretsmanager/banados-db-credentials~DB_PASSWORD}
```

### Opción 2: Verificar Security Groups
Asegurar que el Security Group de RDS permita conexiones desde Lambda:
- Puerto: 5432
- Protocolo: TCP
- Source: Security Group de Lambda

### Opción 3: Verificar VPC Configuration
Lambda debe estar en las subnets correctas y tener acceso a RDS.

## Próximos Pasos

1. **Revisar logs de CloudWatch** para ver el error exacto
2. **Verificar Security Groups** de RDS y Lambda
3. **Verificar variables de entorno** en Lambda
4. **Probar conexión directa** a RDS
5. **Verificar que las tablas existan** en la base de datos

## Comandos Útiles

```bash
# Ver logs recientes
aws logs tail /aws/lambda/backend-dev-login --since 10m --region us-east-1

# Invocar Lambda manualmente para probar
aws lambda invoke \
  --function-name backend-dev-login \
  --payload '{"body":"{\"email\":\"test@test.com\",\"password\":\"test\"}"}' \
  --region us-east-1 \
  response.json

# Ver respuesta
cat response.json
```

