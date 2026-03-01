# 🔧 Fix: Login con Email Registrado

## Problema

Usuarios registrados en la tabla `owners` no podían hacer login porque:
- El owner existe con su email
- Pero no tiene el campo `user_id` vinculado
- La búsqueda solo miraba `user_id`
- No encontraba el owner → Acceso denegado

## Solución Implementada

### Búsqueda Dual

Ahora el sistema busca el owner en 2 pasos:

```typescript
// Paso 1: Buscar por user_id (si ya está vinculado)
const ownerByUserId = await supabase
  .from('owners')
  .select('*')
  .eq('user_id', user.id)
  .single();

if (ownerByUserId) return ownerByUserId; // ✅ Encontrado

// Paso 2: Buscar por email (si no tiene user_id aún)
const ownerByEmail = await supabase
  .from('owners')
  .select('*')
  .eq('email', user.email)
  .single();

if (ownerByEmail) {
  // ✅ Encontrado por email
  // Vincular user_id automáticamente
  await supabase
    .from('owners')
    .update({ user_id: user.id })
    .eq('id', ownerByEmail.id);
  
  return ownerByEmail;
}

// ❌ No encontrado ni por user_id ni por email
return null; // Acceso denegado
```

### Vinculación Automática

Cuando se encuentra un owner por email:
1. Actualiza `user_id` en la base de datos
2. Próximos logins serán más rápidos (usa user_id)
3. No requiere intervención manual

## Flujo Completo

### Caso 1: Owner Creado Manualmente (SIN user_id)

```sql
-- Admin crea owner
INSERT INTO owners (rut, name, age, gender, email, phone, role)
VALUES ('12.345.678-9', 'Juan Pérez', 30, 'male', 'juan@gmail.com', '+56912345678', 'customer');
-- user_id es NULL
```

**Primer Login:**
1. Usuario hace login con Google (juan@gmail.com)
2. Sistema busca por user_id → No encuentra
3. Sistema busca por email → ✅ Encuentra
4. Sistema vincula user_id automáticamente
5. Usuario accede al sistema

**Logins Siguientes:**
1. Sistema busca por user_id → ✅ Encuentra
2. Acceso inmediato (más rápido)

### Caso 2: Owner CON user_id Ya Vinculado

```sql
-- Owner ya tiene user_id vinculado
SELECT * FROM owners WHERE email = 'pedro@gmail.com';
-- user_id: '123e4567-e89b-12d3-a456-426614174000'
```

**Cualquier Login:**
1. Sistema busca por user_id → ✅ Encuentra
2. Acceso inmediato

### Caso 3: Email NO Registrado

```sql
-- No existe en owners
SELECT * FROM owners WHERE email = 'noexiste@gmail.com';
-- (sin resultados)
```

**Login:**
1. Sistema busca por user_id → No encuentra
2. Sistema busca por email → No encuentra
3. ❌ Acceso denegado
4. Cierra sesión
5. Muestra: "Tu email no está registrado"

## Verificar Owner Existente

### Ver owners sin user_id vinculado

```sql
SELECT id, name, email, user_id
FROM owners
WHERE user_id IS NULL;
```

Estos owners se vincularán automáticamente en su primer login.

### Ver owners con user_id vinculado

```sql
SELECT id, name, email, user_id
FROM owners
WHERE user_id IS NOT NULL;
```

### Vincular manualmente (opcional)

Si conoces el user_id de Supabase Auth:

```sql
-- Obtener user_id del auth.users
SELECT id, email FROM auth.users WHERE email = 'usuario@gmail.com';

-- Vincular con owner
UPDATE owners 
SET user_id = 'el-uuid-que-obtuviste'
WHERE email = 'usuario@gmail.com';
```

Pero esto **no es necesario** ya que se hace automáticamente.

## Testing

### Test 1: Owner sin user_id

```bash
# 1. Crear owner manualmente
INSERT INTO owners (rut, name, age, gender, email, phone, role)
VALUES ('11.111.111-1', 'Test User', 25, 'male', 'test@gmail.com', '+56911111111', 'customer');

# 2. Verificar que user_id es NULL
SELECT user_id FROM owners WHERE email = 'test@gmail.com';
# Resultado: NULL

# 3. Login con Google usando test@gmail.com
# Debe permitir acceso

# 4. Verificar que ahora tiene user_id
SELECT user_id FROM owners WHERE email = 'test@gmail.com';
# Resultado: UUID del usuario
```

### Test 2: Email no registrado

```bash
# 1. Login con email que NO existe en owners
# Ejemplo: notregistered@gmail.com

# 2. Debe mostrar:
# "Acceso denegado. Tu email no está registrado en el sistema"

# 3. No puede acceder
```

### Test 3: Owner con user_id existente

```bash
# 1. Owner que ya hizo login antes
# Ya tiene user_id vinculado

# 2. Login de nuevo
# Debe acceder inmediatamente

# 3. user_id no cambia
```

## Troubleshooting

### "Acceso denegado" pero el email SÍ está registrado

Verifica:

```sql
-- 1. Confirma que el owner existe
SELECT * FROM owners WHERE email = 'tu-email@gmail.com';

-- 2. Verifica que el email coincide EXACTAMENTE
-- (case sensitive, sin espacios)

-- 3. Si existe pero sigue dando error, revisar logs
SELECT * FROM auth.users WHERE email = 'tu-email@gmail.com';
```

### Email en owners pero login falla

Posibles causas:

1. **Email no coincide exactamente:**
   - Owner: `Usuario@Gmail.com`
   - Google: `usuario@gmail.com`
   - ❌ No coinciden (case sensitive)

2. **RLS bloqueando la búsqueda:**
   ```sql
   -- Verificar políticas
   SELECT * FROM pg_policies WHERE tablename = 'owners';
   ```

3. **Owner deshabilitado:**
   ```sql
   -- Ver si hay algún campo de estado
   SELECT * FROM owners WHERE email = 'email@gmail.com';
   ```

## Migración de Owners Existentes

Si tienes owners creados antes de este cambio:

```sql
-- Ver cuántos owners no tienen user_id
SELECT COUNT(*) FROM owners WHERE user_id IS NULL;

-- No hacer nada
-- Se vincularán automáticamente cuando hagan login
```

## ✅ Resultado

- ✅ Owners existentes pueden hacer login
- ✅ Vinculación automática de user_id
- ✅ Sin pasos manuales requeridos
- ✅ Acceso denegado solo para emails no registrados
- ✅ Mensaje claro de error

---

**Fix aplicado - Owners existentes ahora pueden hacer login** ✅
