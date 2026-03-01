-- ============================================================================
-- MIGRACIÓN v1.x → v2.0 (LIMPIA - Sin errores de políticas)
-- Ejecutar este script si ya tienes la base de datos v1.x funcionando
-- ============================================================================

-- 1. Crear tabla de propietarios
CREATE TABLE IF NOT EXISTS public.owners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rut TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 0 AND age <= 150),
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS owners_rut_idx ON public.owners(rut);

-- 2. Agregar nuevas columnas a bicycles
ALTER TABLE public.bicycles ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.owners(id) ON DELETE SET NULL;
ALTER TABLE public.bicycles ADD COLUMN IF NOT EXISTS serial_number TEXT;
ALTER TABLE public.bicycles ADD COLUMN IF NOT EXISTS purchase_proof JSONB DEFAULT '{
    "receiptNumber": null,
    "barcode": null,
    "receiptImageUrl": null,
    "purchaseMethod": null,
    "sellerInfo": null,
    "evidenceImageUrls": []
}'::jsonb;
ALTER TABLE public.bicycles ADD COLUMN IF NOT EXISTS identification_photos JSONB DEFAULT '[]'::jsonb;

-- 3. Crear índices para las nuevas columnas
CREATE INDEX IF NOT EXISTS bicycles_owner_id_idx ON public.bicycles(owner_id);
CREATE INDEX IF NOT EXISTS bicycles_serial_number_idx ON public.bicycles(serial_number) WHERE serial_number IS NOT NULL;

-- 4. Habilitar RLS en owners
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;

-- 5. Crear política para owners
DROP POLICY IF EXISTS "Enable all operations for all users on owners" ON public.owners;
CREATE POLICY "Enable all operations for all users on owners" ON public.owners
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 6. Crear trigger para updated_at en owners
DROP TRIGGER IF EXISTS set_owners_updated_at ON public.owners;
CREATE TRIGGER set_owners_updated_at
    BEFORE UPDATE ON public.owners
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 7. Crear buckets de storage (ignorar si ya existen)
INSERT INTO storage.buckets (id, name, public)
VALUES ('purchase-proofs', 'purchase-proofs', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('identification-photos', 'identification-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 8. Crear vista de bicicletas con propietario
CREATE OR REPLACE VIEW public.bicycles_with_owner AS
SELECT 
    b.*,
    row_to_json(o.*) as owner_data
FROM public.bicycles b
LEFT JOIN public.owners o ON b.owner_id = o.id;

-- 9. Otorgar permisos en la vista
GRANT SELECT ON public.bicycles_with_owner TO authenticated, anon;

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Ver estructura de owners
SELECT 'Tabla owners creada' as status, COUNT(*) as registros FROM public.owners;

-- Ver nuevas columnas en bicycles
SELECT 'Columnas agregadas a bicycles' as status;

-- Ver buckets de storage
SELECT 'Buckets de storage creados' as status, COUNT(*) as total 
FROM storage.buckets 
WHERE id IN ('purchase-proofs', 'identification-photos');

-- Ver vista creada
SELECT 'Vista bicycles_with_owner creada' as status;

SELECT '✅ Migración completada exitosamente' as resultado;
