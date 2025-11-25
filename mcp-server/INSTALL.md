# Guía de Instalación - Banados AWS MCP Server

## Prerrequisitos

1. **Node.js** (v18 o superior)
2. **AWS CLI** configurado con credenciales válidas
3. **Serverless Framework** instalado globalmente (opcional, se usa npx)

## Instalación

### 1. Instalar Dependencias

```bash
cd mcp-server
npm install
```

### 2. Compilar el Proyecto

```bash
npm run build
```

### 3. Configurar AWS

Asegúrate de tener configuradas las credenciales de AWS:

```bash
aws configure
```

O usa variables de entorno:

```bash
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
export AWS_REGION=us-east-1
```

## Configuración en Cursor

### Opción 1: Configuración Manual

1. Abre la configuración de Cursor
2. Busca "MCP Servers" o "Model Context Protocol"
3. Agrega la siguiente configuración:

```json
{
  "mcpServers": {
    "banados-aws": {
      "command": "node",
      "args": [
        "/ruta/completa/al/proyecto/banados-fullstack/mcp-server/dist/index.js"
      ],
      "env": {
        "AWS_REGION": "us-east-1"
      }
    }
  }
}
```

**Importante**: Reemplaza `/ruta/completa/al/proyecto/` con la ruta absoluta real a tu proyecto.

### Opción 2: Usar el Archivo de Configuración

1. Copia `cursor-config.example.json` a tu configuración de Cursor
2. Actualiza la ruta en el archivo

## Verificación

Para verificar que el servidor funciona:

```bash
cd mcp-server
npm start
```

Deberías ver:
```
Banados AWS MCP Server iniciado
```

## Uso

Una vez configurado en Cursor, puedes usar las herramientas MCP directamente desde el chat:

- "Lista todas las funciones Lambda"
- "Despliega el backend a dev"
- "Haz rollback del último despliegue"
- "Consulta el estado del stack backend-dev"

## Troubleshooting

### Error: "Cannot find module"

Asegúrate de haber compilado el proyecto:

```bash
npm run build
```

### Error: "AWS credentials not found"

Verifica tus credenciales:

```bash
aws sts get-caller-identity
```

### Error: "Permission denied"

Asegúrate de que el archivo tenga permisos de ejecución:

```bash
chmod +x dist/index.js
```

## Desarrollo

Para desarrollo con hot-reload:

```bash
npm run dev
```

Esto usará `tsx watch` para recompilar automáticamente cuando cambies archivos.

