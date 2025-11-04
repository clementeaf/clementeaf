# Backend Serverless

Backend API serverless con TypeScript y Serverless Framework v3.

## Desarrollo Local con LocalStack

Este proyecto utiliza LocalStack para emular servicios de AWS localmente mediante Docker.

### Opción 1: Todo con Docker (Recomendado)

```bash
# Iniciar LocalStack y el servidor serverless
npm run dev:docker

# O solo iniciar LocalStack
npm run localstack:up
```

### Opción 2: LocalStack en Docker, Serverless localmente

```bash
# Iniciar solo LocalStack
npm run localstack:up

# En otra terminal, iniciar serverless apuntando a LocalStack
npm run dev:local
```

El servidor estará disponible en `http://localhost:9500`

## Servicios Emulados

LocalStack emula los siguientes servicios de AWS:
- DynamoDB
- S3
- Lambda
- API Gateway
- IAM
- STS

## Despliegue a AWS

Una vez que tengas el mínimo funcionando localmente:

```bash
# Configurar credenciales de AWS (o usar variables de entorno)
export AWS_ACCESS_KEY_ID=tu_access_key
export AWS_SECRET_ACCESS_KEY=tu_secret_key

# Desplegar a AWS
npm run deploy:aws
```

## Estructura

```
backend/
├── src/
│   └── handlers/     # Funciones Lambda
├── serverless.yml    # Configuración de Serverless
├── docker-compose.yml # Configuración de Docker con LocalStack
└── Dockerfile        # Imagen para el servidor serverless
```

