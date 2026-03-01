# 🔧 Correcciones de Login/Registro

## ✅ Problemas Corregidos

### Problema 1: Usuario sin registro en owners podía entrar
**Antes**: Auto-creaba un owner con datos vacíos
**Ahora**: Redirige a `/register` para completar datos obligatorios

### Problema 2: Loop de redirección en login
**Causa**: Usuario logueado pero sin owner profile
**Solución**: Flujo de registro implementado

### Problema 3: Datos únicos no validados
**Antes**: No validaba duplicados de RUT y email
**Ahora**: Valida antes de insertar + constraint en BD

---

## 🔄 Nuevo Flujo de Autenticación

### Usuario Nuevo (Primera vez)
```
1. Ve a la app → Redirige a /login
2. Click "Continuar con Google"
3. Autoriza con Google
4. Sistema detecta que no tiene perfil de owner
5. Redirige a /register
6. Completa formulario:
   - RUT (único, formato 12.345.678-9)
   - Nombre completo
   - Edad
   - Género
   - Teléfono
7. Click "Completar Registro"
8. Sistema valida:
   - RUT único
   - Email único (del Google login)
   - Formato correcto
9. Crea owner con role 'customer'
10. Redirige a / (home)
11. ¡Listo para usar la app!
```

### Usuario Existente
```
1. Ve a la app → Redirige a /login
2. Click "Continuar con Google"
3. Autoriza con Google
4. Sistema encuentra su perfil de owner
5. Redirige a / (home)
6. ¡Listo!
```

---

## 📝 Página de Registro

**Ruta**: `/register`

**Campos Obligatorios**:
- ✅ RUT (auto-formatea a 12.345.678-9)
- ✅ Nombre completo (pre-llenado de Google si está disponible)
- ✅ Edad
- ✅ Género (Masculino/Femenino/Otro/Prefiero no decir)
- ✅ Teléfono
- ✅ Email (automático del login de Google, solo lectura)

**Validaciones**:
- RUT debe tener formato chileno válido
- RUT debe ser único en el sistema
- Email debe ser único en el sistema
- Todos los campos son obligatorios
- Edad entre 0-150

**Características**:
- No puede volver atrás sin completar
- No puede acceder a la app sin completar
- Datos no modificables después (excepto teléfono)

---

## 🔐 Validaciones Implementadas

### En el Frontend (register/page.tsx)
```typescript
// Formato RUT
if (!/^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/.test(formData.rut)) {
  throw new Error('Formato de RUT inválido');
}

// RUT único
const existingByRut = await ownerService.getByRut(formData.rut);
if (existingByRut) {
  throw new Error('Este RUT ya está registrado');
}

// Email único
const emailExists = allOwners.some(o => o.email === userEmail);
if (emailExists) {
  throw new Error('Este email ya está registrado');
}
```

### En el Backend (ownerService.ts)
```typescript
// Valida RUT único
const existingRut = await this.getByRut(owner.rut);
if (existingRut) {
  throw new Error('Ya existe un propietario con este RUT');
}

// Valida email único
const existingEmail = allOwners.find(o => o.email === owner.email);
if (existingEmail) {
  throw new Error('Ya existe un propietario con este email');
}
```

### En Base de Datos (migration-v2-to-v3.sql)
```sql
-- RUT único
CREATE UNIQUE INDEX owners_rut_idx ON public.owners(rut);

-- Email único
ALTER TABLE public.owners ADD CONSTRAINT owners_email_key UNIQUE (email);
```

---

## 🧪 Probar el Flujo

### Test 1: Registro de Usuario Nuevo
```bash
# 1. Limpia la sesión
# DevTools → Application → Clear site data

# 2. Ve a la app
# Debe redirigir a /login

# 3. Login con Google (email NO registrado)
# Debe redirigir a /register

# 4. Completa el formulario
# RUT: 12.345.678-9
# Nombre: Juan Pérez
# Edad: 30
# Género: Masculino
# Teléfono: +56912345678

# 5. Click "Completar Registro"
# Debe crear el owner y redirigir a /

# 6. Verifica que puedes usar la app
# Como cliente, solo verás tus bicis (ninguna aún)
```

### Test 2: RUT Duplicado
```bash
# 1. Crea un owner con RUT 12.345.678-9
# 2. Intenta registrar otro con el mismo RUT
# Debe mostrar: "Ya existe un propietario con este RUT"
```

### Test 3: Email Duplicado
```bash
# 1. Login con email1@gmail.com → Registra
# 2. Logout
# 3. Login con email1@gmail.com de nuevo
# Debe funcionar normalmente (owner ya existe)
# NO debe pedir registro de nuevo
```

### Test 4: Usuario Existente
```bash
# 1. Limpia sesión
# 2. Login con email ya registrado
# Debe ir directo a / sin pasar por /register
```

---

## 🔍 Debugging

### Ver si owner existe
```sql
SELECT * FROM owners WHERE email = 'tu-email@gmail.com';
```

### Ver si RUT existe
```sql
SELECT * FROM owners WHERE rut = '12.345.678-9';
```

### Eliminar owner para probar registro
```sql
DELETE FROM owners WHERE email = 'test@gmail.com';
-- Luego haz logout y login de nuevo
```

### Ver todos los owners
```sql
SELECT id, name, rut, email, role FROM owners;
```

---

## 📊 Estados del Usuario

```
┌─────────────────────────────────────────┐
│ Google Auth                             │
│ (session exists)                        │
└──────────────┬──────────────────────────┘
               │
               ▼
        ¿Existe owner?
               │
       ┌───────┴───────┐
       │               │
      NO              YES
       │               │
       ▼               ▼
   /register        / (home)
   [Formulario]    [App funcional]
       │
       ▼
   Completa datos
       │
       ▼
   Crea owner
   (role: customer)
       │
       ▼
   / (home)
   [App funcional]
```

---

## ⚠️ Notas Importantes

1. **Datos No Modificables**: RUT, nombre, edad y género no se pueden cambiar después del registro. Solo el admin puede editarlos desde `/owners`.

2. **Rol Automático**: Todos los registros nuevos son `customer`. Solo un admin puede cambiar roles.

3. **Email de Google**: Se usa el email del login de Google. No se puede cambiar.

4. **Validación de RUT**: El formato debe ser exactamente `12.345.678-9` con puntos y guión.

5. **Sin Bicis**: Un cliente recién registrado no tendrá bicis asociadas hasta que el taller las agregue.

---

## ✅ Checklist Post-Deploy

- [ ] Login con email nuevo → Redirige a /register
- [ ] Completa registro → Crea owner y redirige a /
- [ ] Intenta RUT duplicado → Muestra error
- [ ] Intenta email duplicado → Muestra error (no debería pasar, pero por si acaso)
- [ ] Login con email existente → Va directo a /
- [ ] Formato de RUT se auto-formatea al escribir
- [ ] Todos los campos son obligatorios
- [ ] Usuario puede usar la app después del registro

---

**Flujo de registro completo implementado** ✅
