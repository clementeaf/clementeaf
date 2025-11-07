# Solución de Problema de Conexión RDS - Lambda

## Problema
Error: `connect ETIMEDOUT 172.31.5.220:5432`

Lambda no puede conectarse a RDS aunque están en la misma VPC.

## Diagnóstico

### Configuración Actual
- **RDS**: `banados-analytics-db.cupsguy6sr11.us-east-1.rds.amazonaws.com`
- **VPC**: `vpc-094d2ec2cace1d492` (misma para Lambda y RDS)
- **Security Group RDS**: `sg-00f5071f04ea3f3e1` (permite conexiones desde Lambda)
- **Security Group Lambda**: `sg-0b4465c0a3866b114`
- **RDS Publicly Accessible**: `true`

### Posibles Causas

1. **Subnets diferentes**: Lambda y RDS pueden estar en subnets diferentes sin routing
2. **NAT Gateway faltante**: Lambda necesita NAT Gateway para acceder a recursos en VPC
3. **Security Group incorrecto**: Aunque parece correcto, puede haber un problema

## Soluciones

### Opción 1: Agregar NAT Gateway (Recomendado)
Lambda en VPC necesita NAT Gateway para acceder a internet y recursos en VPC.

### Opción 2: Usar RDS Público
Si RDS es públicamente accesible, Lambda puede conectarse directamente (pero menos seguro).

### Opción 3: Verificar Subnets
Asegurar que Lambda y RDS estén en subnets con routing correcto.

## Verificación

```bash
# Verificar subnets de RDS
aws rds describe-db-instances \
  --db-instance-identifier banados-analytics-db \
  --query 'DBInstances[0].DBSubnetGroup.Subnets'

# Verificar subnets de Lambda
aws lambda get-function-configuration \
  --function-name backend-dev-login \
  --query 'VpcConfig.SubnetIds'
```

## Solución Temporal

Habilitar acceso público a RDS y verificar Security Groups.

