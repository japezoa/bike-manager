# 🔧 Solución Rápida - Error maintenanceHistory

## El Problema

El error que estás viendo es:
```
Could not find the 'maintenanceHistory' column of 'bicycles' in the schema cache
```

Esto ocurre porque hay un desajuste entre:
- **Base de datos**: Usa `maintenance_history` (snake_case)
- **Código TypeScript**: Usa `maintenanceHistory` (camelCase)

## ✅ Solución Implementada

He actualizado el archivo `lib/bicycleService.ts` para hacer la conversión automática entre los dos formatos.

## 🚀 Cómo Aplicar el Fix

### Opción 1: Actualizar el Archivo (Recomendado)

Descarga el nuevo archivo `bike-manager.tar.gz` que incluye el fix.

### Opción 2: Actualizar Manualmente

Si ya tienes el proyecto instalado, reemplaza el contenido de `lib/bicycleService.ts` con el código actualizado que incluye las funciones de conversión:

```typescript
// Helper function to convert camelCase to snake_case
const toSnakeCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      acc[snakeKey] = toSnakeCase(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
};

// Helper function to convert snake_case to camelCase
const toCamelCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = toCamelCase(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
};
```

Y actualiza cada método para usar estas funciones:

```typescript
// Antes de enviar a Supabase
const snakeCaseData = toSnakeCase(bicycle);

// Después de recibir de Supabase
return toCamelCase(data);
```

### Opción 3: Actualizar el Schema (Alternativa)

Si prefieres mantener camelCase en la base de datos (no recomendado para PostgreSQL):

1. Ve a Supabase → SQL Editor
2. Ejecuta:

```sql
ALTER TABLE bicycles 
RENAME COLUMN maintenance_history TO "maintenanceHistory";

ALTER TABLE bicycles 
RENAME COLUMN purchase_date TO "purchaseDate";

ALTER TABLE bicycles 
RENAME COLUMN purchase_price TO "purchasePrice";

ALTER TABLE bicycles 
RENAME COLUMN purchase_condition TO "purchaseCondition";

ALTER TABLE bicycles 
RENAME COLUMN image_url TO "imageUrl";

ALTER TABLE bicycles 
RENAME COLUMN total_kilometers TO "totalKilometers";

ALTER TABLE bicycles 
RENAME COLUMN created_at TO "createdAt";

ALTER TABLE bicycles 
RENAME COLUMN updated_at TO "updatedAt";
```

⚠️ **No recomiendo esta opción** porque PostgreSQL tradicionalmente usa snake_case y puede causar problemas con otras herramientas.

## 🧪 Probar el Fix

1. Reinicia el servidor de desarrollo:
```bash
npm run dev
```

2. Intenta crear una nueva bicicleta

3. Debería guardarse sin errores

## 🔄 Si Ya Tenías Datos

Si ya creaste bicicletas antes del fix, es posible que algunos campos estén en el formato incorrecto. Para limpiar:

```sql
-- Ejecuta esto en Supabase SQL Editor
DELETE FROM bicycles;
```

Luego vuelve a crear tus bicicletas.

## ✅ Verificar que Funciona

Después de aplicar el fix, deberías poder:
1. Crear nuevas bicicletas ✓
2. Ver la lista de bicicletas ✓
3. Editar bicicletas existentes ✓
4. Eliminar bicicletas ✓
5. Subir fotos ✓
6. Agregar historial de mantención ✓
7. Comparar bicicletas ✓

## 🆘 Si Sigue Sin Funcionar

1. Verifica que ejecutaste el `schema.sql` correctamente
2. Revisa que las variables de entorno estén correctas
3. Limpia la caché del navegador
4. Reinicia el servidor de desarrollo

Si el problema persiste, comparte el error exacto y te ayudo a resolverlo.
