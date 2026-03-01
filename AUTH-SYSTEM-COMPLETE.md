# 🔐 Sistema de Autenticación Implementado

## ✅ Lo que se Implementó

### 1. Páginas de Autenticación

**Login Page** (`/login`)
- Botón de "Continuar con Google"
- Diseño moderno con animaciones
- Manejo de errores
- Redirección automática si ya está logueado

**Callback Page** (`/auth/callback`)
- Procesa el retorno de Google OAuth
- Crea o actualiza perfil de usuario
- Redirige al dashboard

**Unauthorized Page** (`/unauthorized`)
- Mensaje amigable de acceso denegado
- Explicación de roles
- Botones para volver o cerrar sesión

### 2. Componentes de Autenticación

**AuthProvider** (`components/AuthProvider.tsx`)
- Context API para estado global de auth
- Manejo de sesiones automático
- Listener de cambios de auth
- Redirección automática según estado
- Hook `useAuth()` para acceder al contexto

**AuthGuard** (`components/AuthGuard.tsx`)
- Protección de rutas
- Verificación de roles
- Loading state mientras verifica
- Redirección automática si no autorizado

**UserMenu** (`components/UserMenu.tsx`)
- Dropdown con info del usuario
- Badge de rol con colores
- Botón de cerrar sesión
- Click outside para cerrar

### 3. Integración Global

**Layout** (`app/layout.tsx`)
- AuthProvider envuelve toda la app
- Metadata actualizado

**Main Page** (`app/page.tsx`)
- UserMenu en header
- Header reorganizado con navegación separada

### 4. Servicios

**authService** (`lib/authService.ts`) - Ya existía, ahora se usa:
- `signInWithGoogle()` - Login
- `signOut()` - Logout
- `getSession()` - Sesión actual
- `getCurrentUser()` - Usuario de Supabase Auth
- `getOrCreateOwnerProfile()` - Perfil de owner
- `getUserRole()` - Rol del usuario
- `isAdmin()` / `isStaff()` - Helpers de roles
- `onAuthStateChange()` - Listener de cambios

## 🎨 Flujo de Autenticación

### Login Flow
```
1. Usuario va a la app (cualquier página)
2. AuthProvider detecta que no hay sesión
3. Redirige a /login
4. Usuario hace click en "Continuar con Google"
5. Redirect a Google OAuth
6. Usuario autoriza
7. Google redirige a /auth/callback
8. Callback crea/actualiza perfil de owner
9. Redirige a / (home)
10. Usuario ve su dashboard según rol
```

### Logout Flow
```
1. Usuario hace click en UserMenu
2. Click en "Cerrar Sesión"
3. authService.signOut()
4. AuthProvider detecta cambio
5. Limpia estado
6. Redirige a /login
```

### Protected Routes
```
Usuario intenta acceder a cualquier página
    ↓
AuthProvider verifica sesión
    ↓
¿Tiene sesión? → NO → /login
    ↓ SÍ
¿Tiene permisos? → NO → /unauthorized
    ↓ SÍ
Muestra página
```

## 🔒 Control de Acceso por Rol

### Customer (Cliente)
- ✅ Ve solo SUS bicicletas (RLS en Supabase)
- ✅ Ve solo SUS órdenes de trabajo
- ❌ No puede crear/editar/eliminar

### Mechanic (Mecánico)
- ✅ Ve TODAS las bicicletas
- ✅ Ve TODAS las órdenes de trabajo
- ✅ Puede editar OT
- ❌ No puede eliminar

### Admin (Administrador)
- ✅ Ve TODO
- ✅ Puede hacer TODO
- ✅ Gestiona usuarios
- ✅ Control total

## 📁 Archivos Nuevos

```
app/
├── login/
│   └── page.tsx                    ✅ Página de login
├── auth/
│   └── callback/
│       └── page.tsx                ✅ Callback OAuth
├── unauthorized/
│   └── page.tsx                    ✅ Acceso denegado
└── layout.tsx                      ✏️ Con AuthProvider

components/
├── AuthProvider.tsx                ✅ Context de auth
├── AuthGuard.tsx                   ✅ Protección de rutas
└── UserMenu.tsx                    ✅ Menu de usuario
```

## 🚀 Configuración Necesaria

### 1. Google Cloud Console

```
1. Ve a console.cloud.google.com
2. Crea o selecciona proyecto
3. Habilita Google+ API
4. Credentials → Create → OAuth 2.0 Client ID
5. Application type: Web application
6. Authorized redirect URIs:
   - http://localhost:3000/auth/callback (desarrollo)
   - https://[tu-proyecto].supabase.co/auth/v1/callback (producción)
7. Copia Client ID y Client Secret
```

### 2. Supabase Dashboard

```
1. Ve a Authentication → Providers
2. Habilita Google
3. Pega Client ID y Client Secret
4. Site URL: https://tu-app.vercel.app
5. Redirect URLs: https://tu-app.vercel.app/auth/callback
6. Save
```

### 3. Variables de Entorno

Ya están en `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=https://tu-app.vercel.app
```

### 4. Crear Primer Admin

```sql
-- Después del primer login
UPDATE owners 
SET role = 'admin' 
WHERE email = 'tu-email@gmail.com';
```

## 🧪 Probar el Sistema

### Test 1: Login
```
1. Ve a la app
2. Debe redirigir a /login
3. Click "Continuar con Google"
4. Autoriza con Google
5. Debe redirigir a /
6. Debe ver UserMenu con tu nombre
```

### Test 2: Roles
```
1. Crea 3 usuarios con diferentes emails
2. En SQL, asigna roles:
   - UPDATE owners SET role = 'admin' WHERE email = 'admin@test.com'
   - UPDATE owners SET role = 'mechanic' WHERE email = 'mechanic@test.com'
   - UPDATE owners SET role = 'customer' WHERE email = 'customer@test.com'
3. Prueba cada uno:
   - Admin: Ve todo
   - Mechanic: Ve todo, no puede eliminar
   - Customer: Solo ve sus bicis
```

### Test 3: Protected Routes
```
1. Sin login, intenta ir a /owners
2. Debe redirigir a /login
3. Login como customer
4. Intenta crear una bici
5. Solo admin/mechanic pueden
```

### Test 4: Logout
```
1. Estando logueado
2. Click en tu nombre (UserMenu)
3. Click en "Cerrar Sesión"
4. Debe redirigir a /login
5. Intenta ir a /
6. Debe volver a /login
```

## 💡 Cómo Usar en Componentes

```typescript
'use client';

import { useAuth } from '@/components/AuthProvider';

export default function MiComponente() {
  const { user, owner, role, loading, signOut } = useAuth();

  if (loading) return <div>Cargando...</div>;
  
  if (!user) return <div>No autenticado</div>;

  return (
    <div>
      <h1>Hola {owner?.name}</h1>
      <p>Tu rol es: {role}</p>
      
      {role === 'admin' && (
        <button>Solo admins ven esto</button>
      )}
      
      <button onClick={signOut}>Logout</button>
    </div>
  );
}
```

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"
→ El redirect URI en Google Cloud no coincide
→ Debe ser: `https://[proyecto].supabase.co/auth/v1/callback`

### No redirige después de login
→ Verifica que el callback esté en `/auth/callback`
→ Revisa la consola del navegador

### Usuario queda en loop de login
→ Verifica que existe la tabla owners
→ Ejecuta migration-v2-to-v3.sql
→ Revisa que el owner se crea automáticamente

### RLS bloquea todo
→ Verifica que get_user_role() funciona:
```sql
SELECT get_user_role();
```

## ✅ Checklist

- [x] Página de login con Google
- [x] Callback de OAuth
- [x] AuthProvider global
- [x] AuthGuard para proteger rutas
- [x] UserMenu con logout
- [x] Control de roles
- [x] RLS en Supabase
- [x] Página unauthorized
- [x] Auto-creación de perfil
- [x] Listeners de auth changes

---

**Sistema de autenticación completo implementado** 🔐✨
