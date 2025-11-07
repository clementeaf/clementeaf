# Configuración de RDS PostgreSQL

## Estado Actual

✅ **Instancia RDS creada y disponible**

- **Identificador:** `banados-db`
- **Endpoint:** `banados-db.cupsguy6sr11.us-east-1.rds.amazonaws.com`
- **Puerto:** `5432`
- **Usuario:** `postgres`
- **Base de datos:** `banados_db`
- **Estado:** `available`
- **Región:** `us-east-1`

## Próximos Pasos

### Opción 1: Usar AWS Secrets Manager (Recomendado)

1. **Configurar el secreto con la contraseña de RDS:**
   ```bash
   cd backend
   ./setup-secrets.sh <DB_PASSWORD> [JWT_SECRET]
   ```
   
   Donde:
   - `<DB_PASSWORD>` es la contraseña que se generó durante la creación de RDS
   - `[JWT_SECRET]` es opcional (se generará automáticamente si no se proporciona)

2. **Desplegar el backend usando el secreto:**
   ```bash
   ./deploy-with-secrets.sh [stage]
   ```

### Opción 2: Desplegar directamente con variables de entorno

1. **Configurar variables de entorno:**
   ```bash
   export DB_HOST=banados-db.cupsguy6sr11.us-east-1.rds.amazonaws.com
   export DB_PORT=5432
   export DB_USERNAME=postgres
   export DB_PASSWORD=<TU_PASSWORD>
   export DB_DATABASE=banados_db
   export JWT_SECRET=<TU_JWT_SECRET>
   export JWT_EXPIRES_IN=7d
   ```

2. **Desplegar el backend:**
   ```bash
   cd backend
   ./deploy-with-rds.sh <DB_PASSWORD> [JWT_SECRET]
   ```

## Scripts Disponibles

### `setup-rds.sh`
Crea la instancia RDS PostgreSQL en AWS.

**Uso:**
```bash
./setup-rds.sh
```

### `setup-secrets.sh`
Configura AWS Secrets Manager con las credenciales de RDS.

**Uso:**
```bash
./setup-secrets.sh <DB_PASSWORD> [JWT_SECRET]
```

### `deploy-with-secrets.sh`
Despliega el backend usando credenciales de AWS Secrets Manager.

**Uso:**
```bash
./deploy-with-secrets.sh [stage]
```

### `deploy-with-rds.sh`
Despliega el backend con configuración de RDS directamente.

**Uso:**
```bash
./deploy-with-rds.sh <DB_PASSWORD> [JWT_SECRET]
```

## Obtener la Contraseña de RDS

Si no recuerdas la contraseña que se generó durante la creación de RDS, tienes dos opciones:

1. **Resetear la contraseña en AWS Console:**
   - Ve a AWS RDS Console
   - Selecciona la instancia `banados-db`
   - Modifica la instancia y cambia la contraseña maestra

2. **Usar AWS Secrets Manager:**
   Si configuraste el secreto, puedes recuperarlo:
   ```bash
   aws secretsmanager get-secret-value \
     --secret-id banados-db-credentials \
     --region us-east-1 \
     --query 'SecretString' \
     --output text | jq -r '.DB_PASSWORD'
   ```

## Verificar Conexión a RDS

Para verificar que la conexión funciona:

```bash
# Desde tu máquina local (si tienes psql instalado)
psql -h banados-db.cupsguy6sr11.us-east-1.rds.amazonaws.com \
     -U postgres \
     -d banados_db
```

## Notas Importantes

⚠️ **Seguridad:**
- Nunca commitees contraseñas en el repositorio
- Usa AWS Secrets Manager para almacenar credenciales de forma segura
- Rota las contraseñas regularmente

⚠️ **Conexión desde Lambda:**
- Asegúrate de que el Security Group de RDS permita conexiones desde Lambda
- Lambda necesita estar en la misma VPC o tener acceso público habilitado

⚠️ **Costo:**
- La instancia `db.t3.micro` es elegible para el tier gratuito de AWS
- Verifica los costos en AWS Console

## Troubleshooting

### Error: "Connection timeout"
- Verifica que el Security Group de RDS permita conexiones desde Lambda
- Verifica que la instancia RDS esté en estado `available`

### Error: "Authentication failed"
- Verifica que la contraseña sea correcta
- Verifica que el usuario sea `postgres`

### Error: "Database does not exist"
- Verifica que la base de datos `banados_db` exista
- Si no existe, créala manualmente o usa TypeORM migrations

