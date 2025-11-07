# Configuración de Secrets en GitHub

## Paso 1: Acceder a Secrets

### Método 1: URL Directa
Ve directamente a:
```
https://github.com/clementeaf/clementeaf/settings/secrets/actions
```

### Método 2: Navegación Manual
1. Ve a: `https://github.com/clementeaf/clementeaf`
2. Haz clic en **Settings** (parte superior del repositorio, junto a "Code", "Issues", etc.)
3. En el menú lateral izquierdo, busca:
   - **Security** (en la sección de configuración)
   - Dentro de Security, busca **Secrets and variables**
   - Haz clic en **Actions**

### Método 3: Si no aparece "Security"
1. Ve a: `https://github.com/clementeaf/clementeaf/settings`
2. En el menú lateral, busca directamente:
   - **Secrets and variables** → **Actions**
   - O busca en la barra de búsqueda: "secrets"

## Paso 2: Habilitar GitHub Actions (si es necesario)

Si no aparece la opción de Secrets, primero habilita GitHub Actions:

1. Ve a: `https://github.com/clementeaf/clementeaf/settings/actions`
2. En "Actions permissions", selecciona:
   - **Allow all actions and reusable workflows**
3. Haz clic en **Save**

## Paso 3: Crear los Secrets

Una vez que accedas a Secrets and variables → Actions:

### Secret 1: AWS_ACCESS_KEY_ID

1. Haz clic en **New repository secret**
2. **Name:** `AWS_ACCESS_KEY_ID`
3. **Secret:** Pega tu AWS Access Key ID
4. Haz clic en **Add secret**

### Secret 2: AWS_SECRET_ACCESS_KEY

1. Haz clic en **New repository secret** (otra vez)
2. **Name:** `AWS_SECRET_ACCESS_KEY`
3. **Secret:** Pega tu AWS Secret Access Key
4. Haz clic en **Add secret**

## Paso 4: Verificar que los Secrets estén creados

Deberías ver en la lista:
- ✅ `AWS_ACCESS_KEY_ID`
- ✅ `AWS_SECRET_ACCESS_KEY`

## Paso 5: Probar el Workflow

1. Haz un cambio pequeño en `client-frontend/`
2. Haz commit y push:
   ```bash
   git add client-frontend/
   git commit -m "test: probar deploy automático"
   git push
   ```
3. Ve a: `https://github.com/clementeaf/clementeaf/actions`
4. Deberías ver el workflow "Deploy Client Frontend" ejecutándose

## Troubleshooting

### Si no aparece "Secrets and variables"
- Verifica que tengas permisos de **Owner** o **Admin**
- Verifica que GitHub Actions esté habilitado
- Intenta acceder directamente con la URL: `https://github.com/clementeaf/clementeaf/settings/secrets/actions`

### Si el workflow falla
- Verifica que los secrets estén correctamente escritos (sin espacios extra)
- Verifica que las credenciales de AWS sean válidas
- Revisa los logs del workflow en la pestaña "Actions"

## Nota sobre Seguridad

⚠️ **IMPORTANTE**: Los secrets son sensibles. No los compartas ni los subas al repositorio. Solo se pueden ver una vez al crearlos.

