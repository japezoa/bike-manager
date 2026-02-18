# 🆕 Actualización v1.1 - Nuevas Funcionalidades

## Cambios Implementados

### 1. ✅ Costo Total de Mantenciones
- En la lista de bicicletas ahora se muestra el costo total de todas las mantenciones
- Aparece debajo del precio de compra en color naranja
- Formato: "+ $XX.XXX en mantenciones"

### 2. ✅ Ordenamiento por Drag & Drop
- Puedes arrastrar las tarjetas de bicicletas para reordenarlas
- Hover sobre una tarjeta para ver el ícono de grip (⋮⋮)
- El orden se guarda automáticamente en la base de datos
- El orden personalizado se mantiene entre sesiones

### 3. ✅ Página de Detalle de Bicicleta
- Nueva pantalla con toda la información detallada
- Acceso desde:
  - Click en la imagen de la bicicleta
  - Click en el botón "Ver" 
  - Click en el nombre de la bicicleta
- URL: `/bike/[id]`
- Muestra:
  - Imagen grande
  - Todas las especificaciones organizadas por categoría
  - Resumen financiero (precio compra + mantenciones)
  - Historial completo de mantenciones

### 4. ✅ Campos de Kilómetros en Mantenciones
Dos nuevos campos opcionales en cada mantención:
- **KM actual**: Kilómetros que tenía la bici al momento de la mantención
- **Próximo KM**: Kilómetros estimados para la próxima mantención
- Ambos campos son opcionales
- Se muestran en el historial de mantenciones con íconos diferenciados

## 📋 Guía de Actualización

### Opción A: Nueva Instalación (Recomendado)

Si aún no has desplegado o quieres empezar de cero:

1. Descarga el nuevo `bike-manager.tar.gz`
2. Sigue las instrucciones del README.md
3. Ejecuta `supabase/schema.sql` (ya incluye todos los cambios)

### Opción B: Actualizar Instalación Existente

Si ya tienes la aplicación funcionando:

#### Paso 1: Actualizar Base de Datos

En Supabase → SQL Editor, ejecuta:

```sql
-- Agregar columna display_order
ALTER TABLE public.bicycles ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Crear índice
CREATE INDEX IF NOT EXISTS bicycles_display_order_idx ON public.bicycles(display_order ASC);

-- Inicializar valores basados en created_at
UPDATE public.bicycles 
SET display_order = subquery.row_num - 1
FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as row_num
    FROM public.bicycles
) AS subquery
WHERE bicycles.id = subquery.id;
```

O simplemente ejecuta el archivo: `supabase/migration-display-order.sql`

#### Paso 2: Actualizar Código

1. Reemplaza estos archivos en tu proyecto:
   - `types/bicycle.ts`
   - `lib/bicycleService.ts`
   - `components/BikeList.tsx`
   - `components/BikeForm.tsx`
   - `app/page.tsx`

2. Crea el nuevo directorio y archivo:
   - `app/bike/[id]/page.tsx`

3. Actualiza dependencias si es necesario:
```bash
npm install
```

#### Paso 3: Deploy

```bash
git add .
git commit -m "Update: Nueva funcionalidad v1.1 - Detalle, drag&drop, costos"
git push
```

Vercel desplegará automáticamente.

## 🎮 Uso de las Nuevas Funcionalidades

### Reordenar Bicicletas

1. Ve a la lista principal de bicicletas
2. Hover sobre cualquier tarjeta
3. Verás el ícono de grip (⋮⋮) en la esquina superior derecha
4. Click y arrastra la tarjeta a la posición deseada
5. Suelta para confirmar
6. El orden se guarda automáticamente

### Ver Detalle de Bicicleta

**Método 1 - Click en imagen:**
- Click en la foto de la bicicleta
- Aparecerá un ícono de ojo al hacer hover

**Método 2 - Botón Ver:**
- Click en el botón azul "Ver" en la tarjeta

**Método 3 - Click en nombre:**
- Click en el nombre de la bicicleta

### Agregar Kilómetros en Mantenciones

1. Edita una bicicleta o crea una nueva
2. En "Historial de Mantención", agrega o edita una mantención
3. Verás dos campos nuevos opcionales:
   - **KM actual**: Ingresa los kilómetros actuales de la bici
   - **Próximo KM**: Ingresa cuándo debe ser la próxima mantención
4. Guarda normalmente

Estos campos aparecerán en:
- La tarjeta de mantención en el formulario
- El detalle completo de la bicicleta
- Con íconos morados (KM actual) y cyan (próximo KM)

## 🔍 Nuevos Componentes de UI

### Íconos Agregados
- `Eye` - Ver detalle
- `GripVertical` - Drag handle
- `Box` - Cuadro
- `Settings` - Transmisión
- `Disc` - Frenos
- `Wheel` - Ruedas
- `Wrench` - Componentes

### Colores de Costos
- **Cyan**: Precio de compra
- **Naranja**: Costos de mantención
- **Gradiente**: Costo total

### Estados Visuales
- **Drag active**: Tarjeta con opacidad 50%
- **Drag over**: Ring cyan alrededor
- **Hover en imagen**: Overlay negro con ícono de ojo

## 📊 Mejoras de Rendimiento

- Los índices en `display_order` mejoran la velocidad de ordenamiento
- Las consultas usan el orden personalizado por defecto
- Cache de costos calculados para mejor performance

## 🐛 Troubleshooting

### El drag & drop no funciona
- Asegúrate de ejecutar la migración SQL
- Verifica que el campo `display_order` existe en tu tabla
- Limpia la caché del navegador

### No veo la página de detalle
- Verifica que creaste el directorio `app/bike/[id]/`
- Asegúrate que el archivo se llama `page.tsx`
- Reinicia el servidor de desarrollo

### Los kilómetros no se guardan
- Actualiza el archivo `types/bicycle.ts`
- Verifica que el `MaintenanceRecord` tiene los nuevos campos
- Revisa que el formulario usa `handleMaintenanceChange` correctamente

### Error al reordenar
- Revisa los logs del navegador (F12 → Console)
- Verifica que `bicycleService.updateOrder` existe
- Asegúrate que todos los bikes tienen ID

## 🔄 Compatibilidad

- ✅ Compatible con versión anterior (los campos nuevos son opcionales)
- ✅ Mantiene orden por fecha si no se ha personalizado
- ✅ No requiere migración de datos existentes
- ✅ Los campos de kilómetros pueden quedar vacíos

## 📝 Notas Técnicas

### Estructura de MaintenanceRecord Actualizada

```typescript
interface MaintenanceRecord {
  id?: string;
  date: string;
  description: string;
  cost?: number;
  kilometersAtMaintenance?: number;      // NUEVO
  nextMaintenanceKilometers?: number;    // NUEVO
}
```

### Bicycle con Display Order

```typescript
interface Bicycle {
  // ... campos existentes
  displayOrder?: number;  // NUEVO
}
```

### Nuevos Métodos del Servicio

```typescript
bicycleService.updateOrder(updates: { id: string; displayOrder: number }[])
```

## 🎉 ¡Listo!

Tu aplicación ahora tiene:
- 🎯 Ordenamiento personalizable
- 📊 Seguimiento completo de costos
- 📱 Vista detallada profesional
- 🛠️ Control de kilómetros para mantenciones

¿Preguntas? Revisa el README.md principal o abre un issue.
