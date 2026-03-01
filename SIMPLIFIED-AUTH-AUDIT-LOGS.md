# 🔐 Sistema Simplificado de Autenticación + Audit Logs

## ✅ Cambios Implementados

### 1. Autenticación Solo para Usuarios Registrados

**Flujo Nuevo:**
```
Login con Google
    ↓
¿Email existe en tabla owners?
    ↓
NO → Cerrar sesión + Mostrar error "Acceso denegado"
    ↓
YES → Permitir acceso según rol
```

**Eliminado:**
- ❌ Página de registro (`/register`)
- ❌ Auto-creación de owners
- ❌ Proceso de completar datos

**Nuevo Comportamiento:**
- ✅ Solo usuarios pre-registrados pueden acceder
- ✅ Email no registrado = Acceso denegado
- ✅ Mensaje claro: "Tu email no está registrado. Contacta al administrador"

---

### 2. Control de Acceso por Rol

#### 👤 Cliente (Customer)
**Puede ver:**
- ✅ Todas SUS bicicletas
- ✅ Detalle completo de cada una
- ✅ Sus datos personales

**NO puede:**
- ❌ Ver bicis de otros
- ❌ Modificar nada
- ❌ Crear bicis
- ❌ Editar bicis
- ❌ Eliminar bicis
- ❌ Ver propietarios
- ❌ Acceder a panel de admin

**Botones visibles:**
- Ver detalle de bici
- Logout

#### 🔧 Mecánico (Mechanic)
**Puede ver:**
- ✅ TODAS las bicicletas
- ✅ TODOS los propietarios

**Puede editar:**
- ✅ Detalles de bicicleta
- ✅ Mantenciones

**NO puede:**
- ❌ Eliminar bicis
- ❌ Editar propietarios
- ❌ Eliminar propietarios
- ❌ Cambiar roles

**Log automático:**
- ✅ Cada cambio queda registrado con su email y timestamp

#### 👨‍💼 Administrador (Admin)
**Control Total:**
- ✅ Ver todo
- ✅ Editar todo
- ✅ Eliminar todo
- ✅ Gestionar propietarios
- ✅ Cambiar roles
- ✅ Ver logs de auditoría

**Log automático:**
- ✅ Todos sus cambios quedan registrados

---

### 3. Sistema de Audit Logs (Registro de Cambios)

**Qué se registra automáticamente:**
- ✅ Creación de bicicletas
- ✅ Modificación de bicicletas
- ✅ Eliminación de bicicletas
- ✅ Creación de propietarios
- ✅ Modificación de propietarios
- ✅ Eliminación de propietarios
- ✅ Cambios en mantenciones

**Información capturada:**
```typescript
{
  user_email: "mecanico@taller.com",
  user_name: "Juan Pérez",
  user_role: "mechanic",
  action: "update",
  entity_type: "bicycle",
  entity_id: "uuid-de-la-bici",
  description: "Bicicleta modificada: Trek Marlin 7",
  changes: {
    "owner_id": {
      "old": "uuid-propietario-1",
      "new": "uuid-propietario-2"
    },
    "current_status": {
      "old": "with_owner",
      "new": "in_workshop"
    }
  },
  created_at: "2024-02-28T12:00:00Z"
}
```

**Triggers Automáticos:**
- No requiere código extra
- Se activan automáticamente en INSERT/UPDATE/DELETE
- Solo registra campos que realmente cambiaron

---

## 📋 Instalación del Sistema

### Paso 1: Ejecutar Schema de Audit Logs

```sql
-- En Supabase SQL Editor
-- Ejecuta: supabase/audit-logs-schema.sql
```

Este script crea:
- Tabla `audit_logs`
- Triggers automáticos para bicycles y owners
- Función `create_audit_log()` para logs manuales
- Vista `audit_logs_readable` para consultas
- RLS (solo admin puede ver logs)

### Paso 2: Verificar Instalación

```sql
-- Ver estructura de audit_logs
\d audit_logs

-- Ver logs existentes
SELECT * FROM audit_logs_readable LIMIT 10;
```

### Paso 3: Deploy del Código

```bash
git add .
git commit -m "Auth simplificado + Audit logs automáticos"
git push
```

---

## 🧪 Probar el Sistema

### Test 1: Email NO Registrado
```
1. Ve a la app
2. Login con email NO registrado
3. Debe mostrar error:
   "Acceso denegado. Tu email no está registrado..."
4. Debe cerrar sesión automáticamente
5. No puede acceder al sistema
```

### Test 2: Cliente
```
1. Login con email registrado como customer
2. Debe ver solo sus bicis
3. NO debe ver botón "NUEVA BICI"
4. NO debe ver botón "PROPIETARIOS"
5. NO debe ver botones editar/eliminar
6. Puede ver detalle de sus bicis
7. Debe ver botón logout
```

### Test 3: Mecánico
```
1. Login como mechanic
2. Edita una bici (ej: cambiar propietario)
3. Ve a Supabase → SQL Editor
4. Consulta:
   SELECT * FROM audit_logs_readable 
   WHERE user_role = 'mechanic' 
   ORDER BY created_at DESC LIMIT 1;
5. Debe ver el log con:
   - Tu email
   - action: 'update'
   - entity_type: 'bicycle'
   - changes: { ... }
   - description: "Bicicleta modificada: ..."
```

### Test 4: Admin
```
1. Login como admin
2. Crea un propietario
3. Modifica un propietario
4. Elimina una bici
5. Consulta logs:
   SELECT * FROM audit_logs_readable 
   WHERE user_role = 'admin' 
   ORDER BY created_at DESC;
6. Debe ver todos los cambios registrados
```

---

## 📊 Consultas Útiles de Audit Logs

### Ver todos los cambios de hoy
```sql
SELECT 
    created_at,
    user_name,
    user_role,
    action,
    entity_type,
    description
FROM audit_logs_readable
WHERE created_at >= CURRENT_DATE
ORDER BY created_at DESC;
```

### Ver cambios de un mecánico específico
```sql
SELECT *
FROM audit_logs_readable
WHERE user_email = 'mecanico@taller.com'
ORDER BY created_at DESC;
```

### Ver historia de una bicicleta específica
```sql
SELECT 
    created_at,
    user_name,
    action,
    description,
    changes
FROM audit_logs_readable
WHERE entity_type = 'bicycle'
  AND entity_id = 'uuid-de-la-bici'
ORDER BY created_at DESC;
```

### Ver todos los cambios de propietario
```sql
SELECT *
FROM audit_logs_readable
WHERE entity_type = 'owner'
ORDER BY created_at DESC;
```

### Ver quién eliminó algo
```sql
SELECT 
    created_at,
    user_name,
    user_role,
    entity_type,
    description
FROM audit_logs_readable
WHERE action = 'delete'
ORDER BY created_at DESC;
```

---

## 🎯 Registrar Usuario Nuevo

Para que un nuevo usuario pueda acceder:

```sql
-- Opción A: Admin crea el propietario antes
INSERT INTO owners (rut, name, age, gender, email, phone, role)
VALUES (
    '12.345.678-9',
    'Nuevo Cliente',
    30,
    'male',
    'cliente@gmail.com',  -- Email de Google
    '+56912345678',
    'customer'
);

-- Opción B: Usuario hace login, admin vincula después
-- 1. Usuario intenta login → Error "no registrado"
-- 2. Admin crea owner con el email del usuario
-- 3. Usuario puede hacer login ahora
```

### Vincular user_id después del primer login

Si creaste el owner antes del primer login del usuario:

```sql
-- Después del primer login exitoso, vincular:
UPDATE owners 
SET user_id = (
    SELECT id FROM auth.users 
    WHERE email = 'cliente@gmail.com'
)
WHERE email = 'cliente@gmail.com';
```

---

## 🔒 Seguridad

**RLS en audit_logs:**
- Solo admin puede leer logs
- Todos pueden insertar (via triggers)
- Nadie puede modificar o eliminar

**Triggers automáticos:**
- Se ejecutan con SECURITY DEFINER
- No dependen del rol del usuario
- Capturan cambios incluso de admin

**Validación de email:**
- Se hace en AuthProvider
- Cierra sesión si no existe owner
- No permite acceso sin owner válido

---

## 📝 Próximos Pasos

1. **Ejecutar audit-logs-schema.sql** en Supabase
2. **Deploy del código** actualizado
3. **Probar login** con emails no registrados
4. **Crear propietarios** para usuarios que necesiten acceso
5. **Verificar logs** después de hacer cambios

---

## ✅ Checklist Post-Deploy

- [ ] Schema de audit logs ejecutado
- [ ] Login con email no registrado muestra error
- [ ] Login con email registrado funciona
- [ ] Cliente solo ve sus bicis
- [ ] Mecánico puede editar bicis
- [ ] Admin tiene acceso total
- [ ] Cambios quedan registrados en audit_logs
- [ ] Solo admin puede ver logs
- [ ] Triggers funcionan automáticamente

---

**Sistema simplificado de auth + audit logs completo** ✅
