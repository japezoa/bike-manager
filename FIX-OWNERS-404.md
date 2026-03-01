# 🔧 Fix: Error 404 en Página de Propietarios

## El Problema

Estás viendo el error:
```
Failed to load resource: the server responded with a status of 404
Error saving owner
```

## ✅ Causa

La tabla `owners` **NO existe** en tu base de datos de Supabase. Necesitas ejecutar la migración SQL primero.

## 🚀 Solución Rápida

### Opción 1: Setup Rápido (Solo Propietarios)

Si solo quieres probar la gestión de propietarios:

1. Ve a **Supabase** → **SQL Editor**
2. Ejecuta este archivo: `supabase/quick-setup-owners.sql`
3. Espera a que diga "Success"
4. Recarga la página de propietarios

### Opción 2: Migración Completa (Recomendado)

Para tener todas las características anti-robo:

1. Ve a **Supabase** → **SQL Editor**
2. Ejecuta este archivo: `supabase/migration-v2-clean.sql` ⚠️ (usa el -clean, no el normal)
3. Espera 1-2 minutos
4. Verifica que no haya errores
5. Recarga la página de propietarios

**Nota sobre Storage**: Las políticas de storage se pueden configurar después desde la UI de Supabase si es necesario.

## 📋 Paso a Paso Detallado

### 1. Abrir Supabase SQL Editor

```
1. Ve a supabase.com
2. Abre tu proyecto
3. Click en "SQL Editor" en el menú lateral
4. Click en "New query"
```

### 2. Copiar el SQL

**Para setup rápido:**
- Abre el archivo `supabase/quick-setup-owners.sql`
- Copia TODO el contenido

**Para migración completa:**
- Abre el archivo `supabase/migration-v2-clean.sql` ⚠️ (no uses migration-v2.sql)
- Copia TODO el contenido

### 3. Ejecutar

```
1. Pega el SQL en el editor
2. Click en "Run" (botón azul abajo a la derecha)
3. Espera a que termine
4. Debe decir "Success" en verde
```

### 4. Verificar

Ejecuta esta query para verificar:

```sql
-- Ver que la tabla existe
SELECT * FROM public.owners LIMIT 1;

-- Debe retornar columnas aunque esté vacía
```

### 5. Probar en la App

```
1. Vuelve a tu aplicación
2. Recarga la página de propietarios (F5)
3. Ahora deberías ver "No hay propietarios registrados"
4. Click en "NUEVO PROPIETARIO"
5. Prueba crear uno
```

## 🔍 Verificar que Funcionó

Deberías poder:
- ✅ Ver la página sin error 404
- ✅ Ver "No hay propietarios registrados"
- ✅ Abrir el formulario de nuevo propietario
- ✅ Crear un propietario de prueba
- ✅ Ver la tarjeta del propietario en la lista

## 🐛 Si Sigue Fallando

### Error: "relation 'owners' does not exist"
- No ejecutaste el SQL correctamente
- Vuelve al SQL Editor y ejecútalo de nuevo
- Asegúrate de que dice "Success"

### Error: "permission denied"
- Ve a Supabase → SQL Editor
- Ejecuta: `ALTER TABLE owners ENABLE ROW LEVEL SECURITY;`
- Luego ejecuta el quick-setup-owners.sql completo

### Error: "duplicate key value"
- Ya existe la tabla pero con datos conflictivos
- Ejecuta: `DROP TABLE IF EXISTS owners CASCADE;`
- Luego ejecuta el quick-setup-owners.sql

### Error en navegador persiste
- Limpia caché del navegador (Ctrl+Shift+Delete)
- Cierra y abre el navegador
- Prueba en ventana incógnita

## 📝 Contenido de quick-setup-owners.sql

El archivo crea:
- ✅ Tabla `owners` con todos los campos
- ✅ Índice en RUT para búsquedas rápidas
- ✅ Políticas RLS para permitir operaciones
- ✅ Trigger para actualizar `updated_at`
- ✅ Validaciones de edad y género

## ✅ Verificación Final

Ejecuta en Supabase SQL Editor:

```sql
-- Ver estructura de la tabla
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'owners';

-- Debe mostrar:
-- id, uuid
-- rut, text
-- name, text
-- age, integer
-- gender, text
-- email, text
-- phone, text
-- created_at, timestamp
-- updated_at, timestamp
```

## 🎉 ¡Listo!

Una vez ejecutado el SQL, deberías poder:
1. Ver la página de propietarios sin errores
2. Crear propietarios
3. Editar propietarios
4. Eliminar propietarios (si no tienen bicis)

---

**Si sigues teniendo problemas**, comparte:
1. El mensaje de error exacto que ves en la consola
2. El resultado de ejecutar el SQL en Supabase
3. Captura de pantalla del error
