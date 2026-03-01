# 🔐 Guía de Login/Logout

## 🎯 Comportamiento Actual

### Sin Sesión (No logueado)
1. **Al entrar a la app**: 
   - Redirige automáticamente a `/login`
   - Muestra página de login con botón "Continuar con Google"

2. **Después de login exitoso**:
   - Redirige a `/` (página principal)
   - Header muestra tu nombre y rol
   - Puedes hacer click en tu nombre para ver el menú

### Con Sesión (Logueado)
1. **Header muestra**:
   - Tu foto de perfil (ícono)
   - Tu nombre
   - Tu rol (Admin/Mecánico/Cliente)
   - Flecha hacia abajo

2. **Al hacer click en tu nombre**:
   - Se abre un dropdown
   - Muestra tu información completa
   - Botón rojo "Cerrar Sesión"

3. **Al hacer click en "Cerrar Sesión"**:
   - Cierra sesión
   - Redirige a `/login`
   - Ya no tienes acceso a la app

## 🔧 Cómo Funciona

### AuthProvider
Maneja el estado global de autenticación:
```typescript
- user: Usuario de Supabase Auth
- owner: Perfil del owner (con rol)
- role: 'admin' | 'mechanic' | 'customer'
- signOut(): Función para cerrar sesión
```

### UserMenu
Componente en el header que:
- Muestra botón "Iniciar Sesión" si NO está logueado
- Muestra dropdown con info + logout si SÍ está logueado

### Rutas Protegidas
- `/login` - Pública
- `/auth/callback` - Pública
- Todas las demás - Requieren login

## 🐛 Problemas Comunes

### "Se auto-loguea"
**Causa**: Hay una sesión guardada en el navegador (cookies/localStorage de Supabase)

**Solución**:
1. **Para cerrar sesión**:
   - Click en tu nombre (arriba a la derecha)
   - Click en "Cerrar Sesión"

2. **Para limpiar sesión manualmente**:
   - Abre DevTools (F12)
   - Application → Storage → Clear site data
   - Recarga la página

### "No veo el botón de logout"
**Verifica**:
1. ¿Estás logueado? Debe mostrar tu nombre arriba a la derecha
2. ¿Hiciste click en tu nombre? El menú es dropdown
3. ¿Está el componente UserMenu en el header?

### "Después de logout sigo viendo la app"
**Causa**: Error en el signOut

**Solución**:
```typescript
// Verificar en authService.ts que signOut funcione:
async signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
```

## 📸 Ubicación de Botones

### Header (cuando está logueado)
```
┌─────────────────────────────────────────────────┐
│ 🚴 BIKE MANAGER              [👤 Tu Nombre ▼] │
│    Sistema de gestión                           │
│                                                  │
│ [LISTA] [PROPIETARIOS] [NUEVA BICI]            │
└─────────────────────────────────────────────────┘
                                    ↑
                          Click aquí para ver menú
```

### Dropdown del UserMenu
```
┌──────────────────────────┐
│ Juan Pérez               │
│ juan@email.com           │
│ [Admin]                  │
├──────────────────────────┤
│ 🚪 Cerrar Sesión         │ ← Click aquí
└──────────────────────────┘
```

## 🧪 Probar Login/Logout

### Test 1: Login desde Cero
```bash
1. Cierra el navegador completamente
2. Abre en incógnito
3. Ve a la app
4. Debe redirigir a /login
5. Click "Continuar con Google"
6. Autoriza
7. Debe ver la app con tu nombre en header
```

### Test 2: Logout
```bash
1. Estando logueado
2. Click en tu nombre (arriba derecha)
3. Se abre dropdown con tu info
4. Click en "Cerrar Sesión" (botón rojo)
5. Debe redirigir a /login
6. Intenta ir a / manualmente
7. Debe volver a redirigir a /login
```

### Test 3: Persistencia de Sesión
```bash
1. Login exitoso
2. Cierra el tab
3. Abre la app de nuevo
4. Debe seguir logueado (sesión persistente)
5. Solo se desloguea con el botón o limpiando storage
```

## 🔍 Debugging

### Ver estado de auth
Abre consola y ejecuta:
```javascript
// Ver si hay sesión
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);

// Ver usuario actual
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user);
```

### Limpiar sesión forzadamente
```javascript
// En la consola del navegador
await supabase.auth.signOut();
location.reload();
```

## 📝 Código de UserMenu

```typescript
// Si NO está logueado
if (!user || !owner) {
  return (
    <Link href="/login">
      <button>Iniciar Sesión</button>
    </Link>
  );
}

// Si está logueado
return (
  <div>
    <button onClick={() => setIsOpen(!isOpen)}>
      {owner.name} ▼
    </button>
    
    {isOpen && (
      <div>
        <p>{owner.name}</p>
        <p>{owner.email}</p>
        <button onClick={signOut}>
          Cerrar Sesión
        </button>
      </div>
    )}
  </div>
);
```

## ✅ Verificación Final

Checklist para confirmar que funciona:

- [ ] Al entrar sin login → Redirige a /login
- [ ] Login con Google → Funciona y redirige a /
- [ ] Header muestra mi nombre cuando estoy logueado
- [ ] Click en mi nombre → Abre dropdown
- [ ] Dropdown muestra mi información
- [ ] Botón "Cerrar Sesión" visible en dropdown
- [ ] Click en logout → Cierra sesión y redirige a /login
- [ ] Después de logout → No puedo acceder a /

---

**Si el "auto-login" persiste, es porque hay una sesión guardada (normal). Usa el botón de logout.** 🔓
