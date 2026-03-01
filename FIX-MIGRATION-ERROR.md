# 🔧 Fix: Error "column user_id does not exist"

## El Problema

```
ERROR: 42703: column "user_id" does not exist
```

Este error ocurre porque intentaste ejecutar `schema-workshop-v3.sql` (schema completo desde cero) pero ya tienes una base de datos con v2.0 funcionando.

## ✅ Solución

Usa el script de **migración** en lugar del schema completo.

### Paso 1: Identifica tu Versión Actual

¿Qué tienes ahora?

**Opción A: Tienes v2.0 (propietarios funcionando)**
- ✅ Tabla `owners` existe
- ✅ Tabla `bicycles` con `owner_id`
- ❌ NO tiene campo `user_id` en owners
- ❌ NO tiene tabla `work_orders`

→ Usa: `migration-v2-to-v3.sql`

**Opción B: Base de datos nueva (nada instalado)**
- ❌ No existe tabla `owners`
- ❌ No existe tabla `bicycles`

→ Usa: `schema-workshop-v3.sql`

**Opción C: Solo tienes v1.x (sin propietarios)**
- ✅ Tabla `bicycles` existe
- ❌ NO existe tabla `owners`

→ Primero ejecuta `migration-v2-clean.sql`, luego `migration-v2-to-v3.sql`

### Paso 2: Ejecutar el Script Correcto

#### Si tienes v2.0 (MÁS COMÚN):

```sql
-- En Supabase SQL Editor
-- Ejecuta: supabase/migration-v2-to-v3.sql
```

Este script:
1. ✅ Agrega `user_id` a owners
2. ✅ Agrega `role` a owners
3. ✅ Agrega campos de taller a bicycles
4. ✅ Crea tabla `work_orders`
5. ✅ Crea tabla `notifications`
6. ✅ Configura RLS por roles
7. ✅ Crea funciones auxiliares

### Paso 3: Verificar que Funcionó

Ejecuta en SQL Editor:

```sql
-- Ver que user_id existe en owners
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'owners' AND column_name = 'user_id';
-- Debe retornar: user_id

-- Ver que role existe en owners  
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'owners' AND column_name = 'role';
-- Debe retornar: role

-- Ver que work_orders existe
SELECT COUNT(*) FROM public.work_orders;
-- Debe retornar: 0 (o más si ya tienes datos)

-- Verificar función
SELECT public.generate_work_order_number();
-- Debe retornar: OT-2024-0001 (o el año actual)
```

## 📋 Guía de Scripts SQL

| Script | Cuándo Usar |
|--------|-------------|
| `migration-v2-to-v3.sql` | ✅ **YA TIENES v2.0** (propietarios funcionan) |
| `schema-workshop-v3.sql` | ❌ Base de datos completamente nueva |
| `migration-v2-clean.sql` | Estás en v1.x y quieres llegar a v2.0 |
| `quick-setup-owners.sql` | Solo quieres probar propietarios |

## 🔄 Orden Correcto de Migración

```
v1.x (solo bicis)
    ↓
[migration-v2-clean.sql]
    ↓
v2.0 (bicis + propietarios)
    ↓
[migration-v2-to-v3.sql] ← USA ESTE
    ↓
v3.0 (sistema de taller completo)
```

## 🐛 Troubleshooting

### Error: "function get_user_role() does not exist"
→ Normal, se crea durante la migración. Ejecuta todo el script completo.

### Error: "relation work_orders already exists"
→ Ya ejecutaste el script antes. Puedes:
```sql
-- Opción A: Limpiar y volver a ejecutar
DROP TABLE IF EXISTS work_orders CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
-- Luego ejecuta migration-v2-to-v3.sql de nuevo

-- Opción B: Continuar (si solo falló parcialmente)
-- Ejecuta solo las partes que fallaron
```

### Error: "constraint owners_email_key already exists"
→ Normal, el script maneja esto. Ignora este warning.

### Error: "permission denied for table owners"
→ Estás usando una cuenta sin permisos. Usa el usuario admin de Supabase.

## ✅ Después de la Migración

1. **Actualiza el código:**
```bash
# Descarga bike-manager.tar.gz
# Reemplaza los archivos
npm install
```

2. **Configura Google OAuth:**
```
Supabase Dashboard → Authentication → Providers → Google
```

3. **Vincula el admin:**
```
Después del primer login con Google del admin:
UPDATE owners SET user_id = 'el-uuid-del-usuario' 
WHERE email = 'tu-email-admin@gmail.com';
```

4. **Probar:**
```
- Login con Google
- Ver dashboard
- Crear una orden de trabajo
```

## 📞 ¿Sigue Fallando?

Comparte:
1. El mensaje de error completo
2. ¿Qué script ejecutaste?
3. ¿Qué tablas ya existen? (ejecuta: `\dt` en SQL Editor)

---

**Usa `migration-v2-to-v3.sql` y debería funcionar.** ✅
