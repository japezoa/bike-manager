# 🚀 Guía de Inicio Rápido - v2.0

## 📋 Prerrequisitos

- ✅ Proyecto de Supabase creado
- ✅ Variables de entorno configuradas en Vercel
- ✅ Aplicación desplegada y funcionando (v1.x)

## 🎯 Objetivo

Agregar el sistema de gestión de propietarios sin romper nada.

## ⚡ Instalación Rápida (5 minutos)

### Paso 1: Migrar Base de Datos (2 min)

1. Ve a **Supabase.com** → Tu proyecto → **SQL Editor**
2. Click en **"New query"**
3. Copia y pega **TODO** el contenido de: `supabase/migration-v2-clean.sql`
4. Click en **"Run"** (botón azul)
5. Espera a que diga **"Success"**
6. Verifica que el último mensaje diga: `✅ Migración completada exitosamente`

### Paso 2: Actualizar Código (2 min)

```bash
# En tu computador
git pull  # Si bajaste los cambios

# O reemplaza manualmente estos archivos:
- app/owners/page.tsx (nuevo)
- components/OwnerForm.tsx (nuevo)
- components/OwnerList.tsx (nuevo)
- lib/ownerService.ts (nuevo)
- lib/supabase.ts (actualizado)
- lib/bicycleService.ts (actualizado)
- types/bicycle.ts (actualizado)
- app/page.tsx (actualizado - tiene link a propietarios)
```

### Paso 3: Deploy (1 min)

```bash
git add .
git commit -m "Add owner management system v2.0"
git push
```

Vercel desplegará automáticamente.

### Paso 4: Probar (30 seg)

1. Ve a tu app: `https://tu-app.vercel.app`
2. Click en **"PROPIETARIOS"**
3. Deberías ver: "No hay propietarios registrados"
4. Click en **"NUEVO PROPIETARIO"**
5. Llena el formulario de prueba:
   - RUT: 12.345.678-9
   - Nombre: Juan Pérez
   - Edad: 35
   - Email: juan@test.com
   - Teléfono: +56912345678
6. Click en **"Guardar"**
7. Deberías ver la tarjeta del propietario

## ✅ Verificación

Si todo funcionó:
- ✅ No hay errores en consola
- ✅ Ves la página de propietarios
- ✅ Puedes crear un propietario
- ✅ El propietario aparece en la lista
- ✅ Puedes editarlo
- ✅ Puedes borrarlo (si no tiene bicis)

## 🐛 Solución de Problemas

### Error: "Failed to load resource: 404"
→ No ejecutaste el SQL
→ Ejecuta `migration-v2-clean.sql` en Supabase

### Error: "relation 'owners' does not exist"
→ El SQL falló
→ Ve a Supabase → SQL Editor → Revisa el log
→ Ejecuta `quick-setup-owners.sql` como alternativa

### Error: "storage.policies does not exist"
→ Normal si usaste `migration-v2.sql` (el viejo)
→ Usa `migration-v2-clean.sql` en su lugar
→ Las políticas de storage se configuran después si las necesitas

### La página está en blanco
→ Limpia caché (Ctrl+Shift+Delete)
→ Abre en ventana incógnita
→ Revisa la consola del navegador (F12)

### No veo el link "PROPIETARIOS"
→ No actualizaste `app/page.tsx`
→ Verifica que el commit se hizo push
→ Espera que Vercel termine de desplegar

## 📁 Archivos de Migración

Hay varios archivos SQL, usa el correcto:

| Archivo | Cuándo Usar |
|---------|-------------|
| `quick-setup-owners.sql` | Solo quieres probar propietarios, sin migrar todo |
| `migration-v2-clean.sql` | ✅ **Recomendado** - Migración completa sin errores |
| `migration-v2.sql` | ❌ No usar - Tiene problemas con políticas de storage |
| `setup-storage-policies.sql` | Opcional - Solo si necesitas configurar storage manualmente |

## 🎯 Siguiente Paso

Una vez que esto funcione, puedes continuar con:
- Parte 2: Asociar propietarios a bicicletas
- Parte 2: Upload de múltiples fotos
- Parte 2: Sistema anti-robo completo

## 📞 ¿Necesitas Ayuda?

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Revisa los logs de Vercel
3. Verifica que el SQL se ejecutó sin errores
4. Lee `FIX-OWNERS-404.md` para soluciones comunes

---

**¡Listo!** Ahora tienes gestión de propietarios funcionando. 🎉
