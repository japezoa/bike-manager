# 🔧 Fix: Error de Locale con date-fns

## El Error

```
Module not found: Can't resolve 'date-fns/locale'
Module not found: Can't resolve 'date-fns/locale/es'
```

## ✅ Solución Aplicada

He eliminado la dependencia de `date-fns/locale` y creado funciones helper que usan `date-fns` sin necesidad de locales.

## Archivos Actualizados

1. **Nuevo archivo**: `lib/dateUtils.ts` - Utilidades de formateo de fechas
2. **Actualizado**: `components/BikeList.tsx` - Usa las nuevas utilidades
3. **Actualizado**: `app/bike/[id]/page.tsx` - Usa las nuevas utilidades

## 🚀 Cómo Aplicar

### Opción 1: Descargar el Nuevo Paquete (Recomendado)

Descarga el nuevo `bike-manager.tar.gz` que ya incluye todos los fixes.

### Opción 2: Actualizar Manualmente

Si ya tienes el proyecto instalado:

#### 1. Crear el archivo de utilidades

Crea `lib/dateUtils.ts`:

```typescript
import { format as dateFnsFormat } from 'date-fns';

export const formatDate = (date: Date | string, formatStr: string = 'dd MMM yyyy'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateFnsFormat(dateObj, formatStr);
};

export const formatShortDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateFnsFormat(dateObj, 'dd/MM/yyyy');
};

export const formatLongDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateFnsFormat(dateObj, 'dd MMMM yyyy');
};
```

#### 2. Actualizar BikeList.tsx

Reemplaza el import:
```typescript
// ANTES
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// DESPUÉS
import { formatDate, formatShortDate } from '@/lib/dateUtils';
```

Reemplaza los usos:
```typescript
// ANTES
{format(new Date(bike.purchaseDate), 'dd MMM yyyy', { locale: es })}

// DESPUÉS
{formatDate(bike.purchaseDate)}
```

#### 3. Actualizar app/bike/[id]/page.tsx

Reemplaza el import:
```typescript
// ANTES
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// DESPUÉS
import { formatDate, formatLongDate } from '@/lib/dateUtils';
```

Reemplaza los usos:
```typescript
// Para fechas cortas
{formatDate(bike.purchaseDate)}

// Para fechas largas
{formatLongDate(maintenance.date)}
```

#### 4. Reinstalar dependencias (opcional)

```bash
rm -rf node_modules package-lock.json
npm install
```

#### 5. Reiniciar servidor

```bash
npm run dev
```

## 📝 Nota sobre el Idioma

Las fechas ahora se mostrarán en inglés por defecto:
- **Antes**: `14 feb 2026`
- **Ahora**: `14 Feb 2026`

Si necesitas fechas en español, puedes instalar el paquete de locales completo:

```bash
npm install date-fns
```

Y modificar `lib/dateUtils.ts`:

```typescript
import { format as dateFnsFormat } from 'date-fns';
import { es } from 'date-fns/locale'; // Agregar

export const formatDate = (date: Date | string, formatStr: string = 'dd MMM yyyy'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateFnsFormat(dateObj, formatStr, { locale: es }); // Agregar locale
};
```

Pero esto requiere instalar el paquete completo de locales (aumenta el tamaño del bundle).

## ✅ Verificar que Funciona

1. Reinicia el servidor: `npm run dev`
2. Ve a la lista de bicicletas
3. Las fechas deben mostrarse correctamente
4. Ve al detalle de una bicicleta
5. Las fechas en mantenciones deben mostrarse correctamente
6. No debe haber errores en la consola

## 🆘 Si Sigue Fallando

1. Limpia completamente:
```bash
rm -rf node_modules .next package-lock.json
npm install
npm run dev
```

2. Verifica que `lib/dateUtils.ts` existe

3. Verifica que los imports estén correctos en:
   - `components/BikeList.tsx`
   - `app/bike/[id]/page.tsx`

4. Revisa la consola del navegador (F12) para ver errores específicos

## 🎉 ¡Listo!

El error debería estar resuelto y las fechas deberían mostrarse correctamente.
