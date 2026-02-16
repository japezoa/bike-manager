# 🚀 Guía de Deployment - Vercel + Supabase + GitHub

Esta guía te llevará paso a paso para desplegar tu aplicación Bike Manager en producción.

## Paso 1: Preparar Supabase

### 1.1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Click en "New Project"
3. Completa:
   - **Name**: bike-manager-prod
   - **Database Password**: Guarda esta contraseña en un lugar seguro
   - **Region**: Selecciona la más cercana a tus usuarios
4. Click en "Create new project"
5. Espera 2-3 minutos mientras se crea el proyecto

### 1.2. Configurar Base de Datos

1. En el panel lateral, click en **SQL Editor**
2. Click en "New query"
3. Copia todo el contenido de `supabase/schema.sql`
4. Pégalo en el editor
5. Click en "Run" (esquina inferior derecha)
6. Verifica que dice "Success. No rows returned"

### 1.3. Verificar Storage

1. En el panel lateral, click en **Storage**
2. Deberías ver el bucket "bike-images"
3. Click en "bike-images"
4. Ve a "Policies"
5. Verifica que exista la política "Allow all operations on bike images"

### 1.4. Obtener Credenciales

1. Click en **Settings** (ícono de engranaje)
2. Click en **API**
3. Copia y guarda:
   - **Project URL** (ejemplo: https://abcdefgh.supabase.co)
   - **API Key** → `anon` `public` (la clave larga)

⚠️ **IMPORTANTE**: Nunca uses la clave `service_role` en el frontend.

## Paso 2: Configurar GitHub

### 2.1. Crear Repositorio

1. Ve a [github.com](https://github.com) y crea una cuenta si no tienes
2. Click en el "+" arriba a la derecha → "New repository"
3. Completa:
   - **Repository name**: bike-manager
   - **Description**: Sistema de gestión de bicicletas
   - **Visibility**: Public o Private (tú eliges)
   - ❌ NO marques "Add a README file"
4. Click en "Create repository"

### 2.2. Subir Código

En tu terminal, dentro de la carpeta del proyecto:

```bash
# Inicializar Git (si no lo hiciste)
git init

# Agregar todos los archivos
git add .

# Hacer el primer commit
git commit -m "Initial commit: Bike Manager v1.0"

# Renombrar rama a main
git branch -M main

# Conectar con GitHub (reemplaza con tu URL)
git remote add origin https://github.com/TU_USUARIO/bike-manager.git

# Subir código
git push -u origin main
```

Si te pide credenciales:
- **Username**: Tu usuario de GitHub
- **Password**: Tu Personal Access Token (no tu contraseña)
  - Si no tienes un token, créalo en: Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token

## Paso 3: Deploy en Vercel

### 3.1. Conectar con GitHub

1. Ve a [vercel.com](https://vercel.com)
2. Click en "Sign Up" si no tienes cuenta
3. Selecciona "Continue with GitHub"
4. Autoriza a Vercel

### 3.2. Importar Proyecto

1. En el dashboard de Vercel, click en "Add New..."
2. Selecciona "Project"
3. Busca tu repositorio "bike-manager"
4. Click en "Import"

### 3.3. Configurar Variables de Entorno

1. En "Configure Project", expande "Environment Variables"
2. Agrega las siguientes variables:

   **Variable 1:**
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: Tu Project URL de Supabase
   - **Environment**: Production, Preview, Development (selecciona todas)

   **Variable 2:**
   - **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value**: Tu anon/public key de Supabase
   - **Environment**: Production, Preview, Development (selecciona todas)

3. Verifica que ambas variables estén agregadas

### 3.4. Deploy

1. Deja todas las otras configuraciones por defecto:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: next build
   - **Output Directory**: .next
2. Click en "Deploy"
3. Espera 2-3 minutos mientras se despliega

### 3.5. Verificar Deployment

1. Una vez completado, verás "Congratulations!"
2. Click en "Visit" o en la URL que aparece
3. Deberías ver tu aplicación funcionando
4. Prueba crear una bicicleta

## Paso 4: Configurar Auto-Deploy

Una vez conectado, cada vez que hagas `git push` a GitHub, Vercel desplegará automáticamente los cambios.

### Flujo de trabajo:

```bash
# 1. Hacer cambios en tu código
# 2. Guardar cambios
git add .
git commit -m "Descripción de los cambios"
git push

# 3. Vercel detectará el push y desplegará automáticamente
# 4. Recibirás un email cuando el deploy termine
```

## Paso 5: Configuración Post-Deploy

### 5.1. Verificar Imágenes

1. Ve a `next.config.js`
2. Verifica que el dominio de Supabase esté correcto:

```javascript
const nextConfig = {
  images: {
    domains: ['TU_PROJECT_ID.supabase.co'],
  },
}
```

Si está incorrecto:
1. Edita el archivo
2. Haz commit y push
3. Vercel redesplegará automáticamente

### 5.2. Configurar Dominio Personalizado (Opcional)

1. En Vercel, ve a tu proyecto
2. Click en "Settings"
3. Click en "Domains"
4. Click en "Add"
5. Ingresa tu dominio (ejemplo: bikes.tudominio.com)
6. Sigue las instrucciones para configurar DNS

## Paso 6: Monitoreo y Mantenimiento

### Logs en Vercel

1. Ve a tu proyecto en Vercel
2. Click en "Deployments"
3. Click en cualquier deployment
4. Click en "View Function Logs" para ver errores

### Logs en Supabase

1. Ve a tu proyecto en Supabase
2. Click en "Logs"
3. Selecciona "Postgres Logs" o "API Logs"

### Backups de Base de Datos

Supabase hace backups automáticos, pero puedes hacer backups manuales:

1. En Supabase, ve a "Database"
2. Click en "Backups"
3. Click en "Create backup"

## 🔄 Actualizar la Aplicación

```bash
# 1. Hacer cambios
# 2. Probar localmente
npm run dev

# 3. Si funciona, hacer commit
git add .
git commit -m "Nueva funcionalidad: XYZ"
git push

# 4. Vercel desplegará automáticamente
# 5. Revisar en producción
```

## 🐛 Troubleshooting

### Error: "Database connection failed"
- Verifica las variables de entorno en Vercel
- Asegúrate de que el schema SQL se ejecutó correctamente

### Error: "Image optimization failed"
- Verifica `next.config.js`
- Asegúrate de que el dominio de Supabase esté correcto

### Error: "Forbidden" al subir imágenes
- Verifica las políticas de Storage en Supabase
- Asegúrate de que el bucket sea público

### Cambios no se reflejan
- Limpia caché del navegador
- Espera 1-2 minutos (puede haber delay de CDN)
- Verifica que el commit se haya pusheado a GitHub

## 📊 Métricas

Vercel te da métricas gratis:
- Número de visitantes
- Tiempo de carga
- Errores
- Uso de ancho de banda

Supabase te da:
- Tamaño de base de datos
- Número de filas
- Consultas por segundo
- Almacenamiento usado

## 🎉 ¡Listo!

Tu aplicación está en producción. Comparte la URL con quien quieras:

```
https://tu-proyecto.vercel.app
```

## 🔐 Seguridad en Producción

⚠️ Para uso en producción real, considera:

1. **Autenticación**: Implementar Supabase Auth
2. **RLS**: Modificar políticas para que solo usuarios autenticados puedan modificar datos
3. **Rate Limiting**: Configurar límites de requests
4. **HTTPS**: Ya viene por defecto con Vercel ✅
5. **Environment Variables**: Nunca expongas claves secretas ✅

---

**¿Necesitas ayuda?** Abre un issue en GitHub.
