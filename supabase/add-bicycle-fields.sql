-- ============================================================================
-- MIGRACIÓN: Agregar nuevos campos a bicycles
-- ============================================================================

-- Eliminar vista que depende de la columna geometry
DROP VIEW IF EXISTS bicycles_with_owner CASCADE;

-- Agregar campo marca
ALTER TABLE public.bicycles ADD COLUMN IF NOT EXISTS brand TEXT;

-- Agregar campo tipo de bici
ALTER TABLE public.bicycles ADD COLUMN IF NOT EXISTS bike_type TEXT 
    CHECK (bike_type IN ('MTB', 'Gravel', 'Ruta'));

-- Agregar campo estado de bici
ALTER TABLE public.bicycles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'in_use'
    CHECK (status IN ('in_use', 'sold', 'stolen'));

-- Eliminar columna geometry (ya no se usa)
ALTER TABLE public.bicycles DROP COLUMN IF EXISTS geometry;

-- Crear índices
CREATE INDEX IF NOT EXISTS bicycles_status_idx ON public.bicycles(status);
CREATE INDEX IF NOT EXISTS bicycles_bike_type_idx ON public.bicycles(bike_type);
CREATE INDEX IF NOT EXISTS bicycles_brand_idx ON public.bicycles(brand);

-- Actualizar datos existentes con valores por defecto
UPDATE public.bicycles 
SET 
    brand = COALESCE(brand, model),
    bike_type = COALESCE(bike_type, 'MTB'),
    status = COALESCE(status, 'in_use')
WHERE brand IS NULL OR bike_type IS NULL OR status IS NULL;

-- Recrear la vista sin la columna geometry
CREATE OR REPLACE VIEW bicycles_with_owner AS
SELECT 
    b.*,
    o.name as owner_name,
    o.email as owner_email,
    o.phone as owner_phone,
    o.rut as owner_rut
FROM bicycles b
LEFT JOIN owners o ON b.owner_id = o.id;

-- ============================================================================
SELECT '✅ Nuevos campos agregados a bicycles' as resultado;
