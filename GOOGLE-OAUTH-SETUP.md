# 🔐 Guía Completa: Configurar Google OAuth

## 📋 Requisitos Previos

- Una cuenta de Google (tu Gmail personal)
- Proyecto de Supabase creado
- 10-15 minutos de tiempo

---

## 🚀 PASO 1: Crear Proyecto en Google Cloud Console

### 1.1 Acceder a Google Cloud Console

1. Ve a: **https://console.cloud.google.com**
2. Inicia sesión con tu cuenta de Google

### 1.2 Crear Nuevo Proyecto

1. En la parte superior, click en el **selector de proyecto** (al lado del logo de Google Cloud)
2. Click en **"NEW PROJECT"** / **"NUEVO PROYECTO"**
3. Completa:
   - **Project name**: `Bike Manager` (o el nombre que quieras)
   - **Organization**: Deja en blanco (o selecciona si tienes)
   - **Location**: Deja en blanco
4. Click en **"CREATE"** / **"CREAR"**
5. Espera 30 segundos a que se cree
6. Selecciona el proyecto desde el selector de proyectos

---

## 🔑 PASO 2: Habilitar Google+ API

### 2.1 Ir al API Library

1. En el menú lateral (☰), ve a:
   ```
   APIs & Services → Library
   ```
   O usa este link directo:
   ```
   https://console.cloud.google.com/apis/library
   ```

### 2.2 Buscar y Habilitar la API

1. En el buscador, escribe: **"Google+ API"**
2. Click en **"Google+ API"** (el primer resultado)
3. Click en **"ENABLE"** / **"HABILITAR"**
4. Espera unos segundos

> **Nota**: Si aparece "MANAGE" en vez de "ENABLE", significa que ya está habilitada ✅

---

## 🔐 PASO 3: Configurar OAuth Consent Screen

### 3.1 Ir a OAuth Consent Screen

1. En el menú lateral (☰), ve a:
   ```
   APIs & Services → OAuth consent screen
   ```
   O usa este link directo:
   ```
   https://console.cloud.google.com/apis/credentials/consent
   ```

### 3.2 Seleccionar Tipo de Usuario

Verás 2 opciones:

**Opción A: Internal** (Solo para Google Workspace)
- Solo si tu Google es de una organización
- Si tienes @gmail.com, NO puedes usar esta opción

**Opción B: External** ✅ (RECOMENDADO)
- Para cuentas @gmail.com
- Permite que cualquier usuario con Google se loguee
- Selecciona esta
- Click en **"CREATE"** / **"CREAR"**

### 3.3 Completar App Information

**OAuth consent screen** (Página 1 de 4):

1. **App name**: `Bike Manager` (nombre de tu app)
2. **User support email**: Tu email de Gmail
3. **App logo**: (Opcional) Puedes subirlo después
4. **App domain** - Application home page: `https://tu-app.vercel.app` (lo agregas después del deploy)
5. **Authorized domains**: 
   - Deja en blanco por ahora
   - Lo agregarás después del deploy
6. **Developer contact information**: Tu email de Gmail
7. Click en **"SAVE AND CONTINUE"**

**Scopes** (Página 2 de 4):

1. Click en **"ADD OR REMOVE SCOPES"**
2. Busca y selecciona:
   - ✅ `.../auth/userinfo.email`
   - ✅ `.../auth/userinfo.profile`
   - ✅ `openid`
3. Debería mostrar 3 scopes seleccionados
4. Click en **"UPDATE"**
5. Click en **"SAVE AND CONTINUE"**

**Test users** (Página 3 de 4):

1. Click en **"ADD USERS"**
2. Agrega tu email de Gmail
3. Agrega emails de otros usuarios que quieras que puedan probar (opcional)
4. Click en **"ADD"**
5. Click en **"SAVE AND CONTINUE"**

**Summary** (Página 4 de 4):

1. Revisa todo
2. Click en **"BACK TO DASHBOARD"**

---

## 🎫 PASO 4: Crear Credenciales OAuth

### 4.1 Ir a Credentials

1. En el menú lateral (☰), ve a:
   ```
   APIs & Services → Credentials
   ```
   O usa este link directo:
   ```
   https://console.cloud.google.com/apis/credentials
   ```

### 4.2 Crear OAuth Client ID

1. Click en **"+ CREATE CREDENTIALS"** (arriba)
2. Selecciona **"OAuth client ID"**
3. Si te pide configurar consent screen, significa que faltó el paso 3. Vuelve atrás.

### 4.3 Configurar el OAuth Client

1. **Application type**: Selecciona **"Web application"**
2. **Name**: `Bike Manager Web Client` (o el nombre que quieras)
3. **Authorized JavaScript origins**: 
   ```
   http://localhost:3000
   ```
   (Click en + ADD URI para agregar más si necesitas)

4. **Authorized redirect URIs**: ⚠️ **MUY IMPORTANTE**
   
   Necesitas agregar 2 URIs (una para desarrollo, otra para producción):
   
   **Para desarrollo:**
   ```
   http://localhost:3000/auth/callback
   ```
   
   **Para producción (Supabase):**
   ```
   https://[TU-PROYECTO].supabase.co/auth/v1/callback
   ```
   
   **¿Cómo obtener la URL de Supabase?**
   - Ve a tu proyecto en Supabase
   - Settings → API
   - Copia el "Project URL"
   - Ejemplo: `https://abcdefghijk.supabase.co`
   - Agrégale `/auth/v1/callback` al final
   - Resultado: `https://abcdefghijk.supabase.co/auth/v1/callback`
   
   Click en **"+ ADD URI"** para cada una

5. Click en **"CREATE"**

### 4.4 Copiar Credenciales

Aparecerá un popup con:

```
Your Client ID
Tu-Client-ID-Aqui.apps.googleusercontent.com

Your Client Secret
GOCSPX-tu-secret-aqui
```

**⚠️ IMPORTANTE**: 
- **NO cierres** este popup todavía
- Copia estos valores ahora
- Los necesitarás en el siguiente paso

---

## 📝 PASO 5: Configurar en Supabase

### 5.1 Ir a Supabase Authentication

1. Ve a tu proyecto en **Supabase**
2. Menú lateral → **Authentication**
3. Click en **"Providers"**

### 5.2 Habilitar Google Provider

1. Busca **"Google"** en la lista
2. Click en el toggle para habilitarlo (debe ponerse verde)
3. Se expandirá un formulario

### 5.3 Completar el Formulario

1. **Client ID (for OAuth)**:
   - Pega el Client ID que copiaste de Google Cloud
   - Ejemplo: `123456789-abc.apps.googleusercontent.com`

2. **Client Secret (for OAuth)**:
   - Pega el Client Secret que copiaste
   - Ejemplo: `GOCSPX-abcdef123456`

3. **Authorized Client IDs**: 
   - Deja en blanco (no es necesario)

4. **Skip nonce checks**:
   - Deja desmarcado

5. Click en **"Save"** (abajo a la derecha)

---

## 🌐 PASO 6: Configurar URLs en Supabase

### 6.1 Site URL

1. En Supabase, ve a:
   ```
   Settings → API → Site URL
   ```

2. Configura según el ambiente:

   **Para desarrollo local:**
   ```
   http://localhost:3000
   ```

   **Para producción (Vercel):**
   ```
   https://tu-app.vercel.app
   ```

3. Click en **"Save"**

### 6.2 Redirect URLs

1. En la misma página, busca **"Redirect URLs"**
2. Agrega:
   ```
   http://localhost:3000/auth/callback
   https://tu-app.vercel.app/auth/callback
   ```
3. Click en **"Save"**

---

## ✅ PASO 7: Verificar Configuración

### 7.1 Checklist

Verifica que tengas todo:

- [x] Proyecto creado en Google Cloud
- [x] Google+ API habilitada
- [x] OAuth Consent Screen configurado
- [x] OAuth Client ID creado
- [x] Client ID y Secret copiados
- [x] Provider habilitado en Supabase
- [x] Client ID pegado en Supabase
- [x] Client Secret pegado en Supabase
- [x] Site URL configurado
- [x] Redirect URLs configurados

### 7.2 URLs Correctas

Verifica que tus redirect URIs sean **EXACTAMENTE**:

**En Google Cloud Console:**
```
http://localhost:3000/auth/callback
https://[TU-PROYECTO].supabase.co/auth/v1/callback
```

**En Supabase:**
```
http://localhost:3000/auth/callback
https://tu-app.vercel.app/auth/callback
```

⚠️ **Nota**: La URL de Google Cloud apunta a Supabase, la de Supabase apunta a tu app.

---

## 🧪 PASO 8: Probar el Login

### 8.1 Desarrollo Local

1. Asegúrate de que tu app corra en:
   ```bash
   npm run dev
   # Debe estar en http://localhost:3000
   ```

2. Ve a: `http://localhost:3000/login`

3. Click en **"Continuar con Google"**

4. Deberías ver:
   - Ventana popup de Google
   - Lista de tus cuentas de Google
   - Pantalla de permisos
   - Redirección a tu app

5. Si funciona: ✅ Todo bien

6. Si da error: Ve a la sección de Troubleshooting abajo

### 8.2 Producción (Vercel)

Después del deploy:

1. Actualiza el **Site URL** en Supabase:
   ```
   https://tu-app.vercel.app
   ```

2. Verifica las **Redirect URLs** incluyan:
   ```
   https://tu-app.vercel.app/auth/callback
   ```

3. En **Google Cloud**, verifica que la URL de producción de Supabase esté:
   ```
   https://[proyecto].supabase.co/auth/v1/callback
   ```

4. Prueba el login en producción

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"

**Causa**: La URL de redirect no coincide exactamente

**Solución**:
1. Ve a Google Cloud Console → Credentials
2. Click en tu OAuth Client ID
3. Verifica **Authorized redirect URIs**
4. Debe incluir EXACTAMENTE:
   ```
   https://[tu-proyecto].supabase.co/auth/v1/callback
   ```
5. NO debe tener espacios ni caracteres extra
6. Guarda y espera 5 minutos

### Error: "Access blocked: This app's request is invalid"

**Causa**: Falta configurar el OAuth Consent Screen

**Solución**:
1. Ve a OAuth consent screen
2. Completa toda la información
3. Agrega tu email como test user
4. Guarda

### Error: "Popup closed by user"

**Causa**: El popup se cerró antes de completar

**Solución**:
- Intenta de nuevo
- Verifica que no tengas bloqueador de popups
- Prueba en ventana incógnita

### No pasa nada después de autorizar

**Causa**: Callback no está bien configurado

**Solución**:
1. Verifica que la página `/auth/callback` exista
2. Verifica las Redirect URLs en Supabase
3. Revisa la consola del navegador (F12)

### Error: "Invalid client"

**Causa**: Client ID o Secret incorrectos

**Solución**:
1. Ve a Google Cloud → Credentials
2. Click en tu OAuth Client
3. Verifica el Client ID y Secret
4. Cópialos de nuevo a Supabase
5. Guarda en Supabase

---

## 📝 Resumen de URLs

### Google Cloud Console
```
Authorized JavaScript origins:
- http://localhost:3000

Authorized redirect URIs:
- http://localhost:3000/auth/callback
- https://[PROYECTO].supabase.co/auth/v1/callback
```

### Supabase
```
Site URL:
- Desarrollo: http://localhost:3000
- Producción: https://tu-app.vercel.app

Redirect URLs:
- http://localhost:3000/auth/callback
- https://tu-app.vercel.app/auth/callback

Provider: Google
- Client ID: [De Google Cloud]
- Client Secret: [De Google Cloud]
```

---

## 🎯 Siguiente Paso

Una vez que el login funcione:

1. Haz login con tu cuenta de Google
2. Ve a Supabase → SQL Editor
3. Ejecuta:
   ```sql
   UPDATE owners 
   SET role = 'admin' 
   WHERE email = 'tu-email@gmail.com';
   ```
4. Recarga la app
5. ¡Eres admin! 🎉

---

## 📞 ¿Necesitas Ayuda?

Si tienes problemas:

1. Revisa la consola del navegador (F12)
2. Revisa los logs de Supabase
3. Verifica que las URLs sean EXACTAS
4. Prueba en ventana incógnita
5. Espera 5-10 minutos después de cambios (cache de Google)

---

**¡Listo para autenticar usuarios!** 🔐✨
