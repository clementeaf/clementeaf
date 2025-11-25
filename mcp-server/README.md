# Banados AWS MCP Server

Servidor MCP (Model Context Protocol) para gestionar AWS y despliegues serverless con rollback seguro.

## Características

- **Consultas AWS**: Lista y consulta recursos de AWS (Lambda, CloudFormation, API Gateway)
- **Despliegues Serverless**: Gestiona despliegues con Serverless Framework
- **Rollback Seguro**: Sistema de backups y rollback automático
- **Estado de Despliegues**: Consulta el estado actual de los despliegues

## Instalación

```bash
cd mcp-server
npm install
npm run build
```

## Configuración

### Variables de Entorno

El servidor MCP usa las credenciales de AWS configuradas en tu sistema:

```bash
# Configurar AWS CLI
aws configure

# O usar variables de entorno
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
export AWS_REGION=us-east-1
```

## Uso

### Iniciar el Servidor

```bash
npm start
```

### Herramientas Disponibles

#### Consultas AWS

1. **list_lambda_functions**: Lista todas las funciones Lambda
2. **get_lambda_function**: Obtiene información de una función Lambda específica
3. **list_cloudformation_stacks**: Lista todos los stacks de CloudFormation
4. **get_cloudformation_stack**: Obtiene información de un stack específico
5. **list_api_gateways**: Lista todos los API Gateways

#### Despliegues Serverless

1. **deploy_serverless**: Despliega un servicio serverless
   - `servicePath`: Ruta al directorio del servicio
   - `stage`: Stage del despliegue (dev, prod, etc.)
   - `region`: Región de AWS
   - `createBackup`: Crear backup antes del despliegue (default: true)

2. **get_deployment_status**: Obtiene el estado de un despliegue
   - `stackName`: Nombre del stack
   - `region`: Región de AWS

#### Rollback

1. **rollback_serverless**: Hace rollback a una versión anterior
   - `servicePath`: Ruta al directorio del servicio
   - `stackName`: Nombre del stack
   - `backupId`: ID del backup (opcional, usa el último si no se especifica)
   - `region`: Región de AWS

2. **list_deployment_backups**: Lista todos los backups disponibles
   - `stackName`: Nombre del stack
   - `region`: Región de AWS

## Ejemplos de Uso

### Desplegar Backend

```json
{
  "name": "deploy_serverless",
  "arguments": {
    "servicePath": "../backend",
    "stage": "dev",
    "region": "us-east-1",
    "createBackup": true
  }
}
```

### Hacer Rollback

```json
{
  "name": "rollback_serverless",
  "arguments": {
    "servicePath": "../backend",
    "stackName": "backend-dev",
    "region": "us-east-1"
  }
}
```

### Consultar Estado

```json
{
  "name": "get_deployment_status",
  "arguments": {
    "stackName": "backend-dev",
    "region": "us-east-1"
  }
}
```

## Sistema de Backups

Los backups se guardan automáticamente en `.mcp-backups/` y contienen:

- Template de CloudFormation
- Outputs del stack
- Timestamp del backup
- Información del stack

## Integración con Cursor

Para usar este servidor MCP en Cursor, agrega la siguiente configuración:

```json
{
  "mcpServers": {
    "banados-aws": {
      "command": "node",
      "args": ["/ruta/al/mcp-server/dist/index.js"]
    }
  }
}
```

## Seguridad

- Los backups se guardan localmente en `.mcp-backups/`
- Las credenciales de AWS se manejan a través de AWS CLI o variables de entorno
- No se almacenan credenciales en el código

## Troubleshooting

### Error: "AWS credentials not found"

Asegúrate de tener configuradas las credenciales de AWS:

```bash
aws configure
```

### Error: "Stack not found"

Verifica que el stack existe en la región especificada:

```bash
aws cloudformation list-stacks --region us-east-1
```

### Error: "Backup not found"

Lista los backups disponibles:

```json
{
  "name": "list_deployment_backups",
  "arguments": {
    "stackName": "backend-dev",
    "region": "us-east-1"
  }
}
```

