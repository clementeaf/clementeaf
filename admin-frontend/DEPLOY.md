# Guía de Despliegue a S3/CloudFront

Esta guía explica cómo desplegar la aplicación `admin-frontend` a AWS S3 y CloudFront.

## Prerrequisitos

1. **AWS CLI instalado y configurado**
   ```bash
   aws --version
   aws configure
   ```

2. **Bucket de S3 creado**
   - El bucket debe estar configurado para hosting estático
   - Configuración de permisos: lectura pública para archivos estáticos

3. **Distribución de CloudFront creada** (opcional pero recomendado)
   - Origen apuntando al bucket de S3
   - Configuración de errores personalizados (404 → index.html para SPAs)

## Configuración

### Opción 1: Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
S3_BUCKET_NAME=tu-bucket-name
CLOUDFRONT_DISTRIBUTION_ID=tu-distribution-id
AWS_REGION=us-east-1
```

### Opción 2: Parámetros en el script

```bash
./deploy.sh tu-bucket-name tu-distribution-id
```

## Despliegue

### Despliegue completo (con invalidación de CloudFront)

```bash
npm run deploy
```

O con parámetros explícitos:

```bash
./deploy.sh tu-bucket-name tu-distribution-id
```

### Solo subir a S3 (sin invalidación)

```bash
./deploy.sh tu-bucket-name
```

## Configuración del Bucket S3

### 1. Política del bucket (Bucket Policy)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::tu-bucket-name/*"
    }
  ]
}
```

### 2. Configuración de hosting estático

- **Índice**: `index.html`
- **Error**: `index.html` (para SPAs con React Router)

### 3. Configuración de CORS (si es necesario)

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

## Configuración de CloudFront

### 1. Origen

- **Domain Name**: `tu-bucket-name.s3.amazonaws.com`
- **Origin Path**: (dejar vacío)
- **Origin Access Control**: Habilitar si usas OAC

### 2. Comportamientos por defecto

- **Viewer Protocol Policy**: Redirect HTTP to HTTPS
- **Allowed HTTP Methods**: GET, HEAD, OPTIONS
- **Cache Policy**: Caching Optimized

### 3. Página de error personalizada

- **404 Error**: `index.html` (Código de respuesta: 200)
- Esto permite que React Router maneje las rutas

## Comandos útiles

### Verificar estado del despliegue

```bash
aws s3 ls s3://tu-bucket-name/
```

### Verificar invalidación de CloudFront

```bash
aws cloudfront list-invalidations --distribution-id tu-distribution-id
```

### Ver logs de CloudFront

```bash
aws cloudfront get-distribution --id tu-distribution-id
```

## Troubleshooting

### Error: "Access Denied"

- Verificar permisos del bucket
- Verificar credenciales de AWS
- Verificar políticas IAM

### Error: "Invalidation failed"

- Verificar que el Distribution ID sea correcto
- Verificar permisos de CloudFront

### Las rutas no funcionan (404)

- Verificar que el bucket tenga configurado el error document como `index.html`
- Verificar configuración de CloudFront para errores 404

## Notas

- El script elimina archivos antiguos del bucket (`--delete`)
- Los archivos estáticos tienen cache de 1 año
- Los HTML tienen cache de 0 (must-revalidate)
- La invalidación de CloudFront puede tardar varios minutos

