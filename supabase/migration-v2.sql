-- ============================================================================
-- MIGRACIÓN v1.x → v2.0
-- Ejecutar este script SOLO si ya tienes la base de datos v1.x funcionando
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
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'owners' 
        AND policyname = 'Enable all operations for all users on owners'
    ) THEN
        CREATE POLICY "Enable all operations for all users on owners" ON public.owners
            FOR ALL
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;

-- 6. Crear trigger para updated_at en owners
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'set_owners_updated_at'
    ) THEN
        CREATE TRIGGER set_owners_updated_at
            BEFORE UPDATE ON public.owners
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END $$;

-- 7. Crear buckets de storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('purchase-proofs', 'purchase-proofs', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('identification-photos', 'identification-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 8. Crear políticas de storage
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM storage.policies 
        WHERE bucket_id = 'purchase-proofs'
        AND name = 'Allow all operations on purchase proofs'
    ) THEN
        CREATE POLICY "Allow all operations on purchase proofs" ON storage.objects
            FOR ALL
            USING (bucket_id = 'purchase-proofs')
            WITH CHECK (bucket_id = 'purchase-proofs');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM storage.policies 
        WHERE bucket_id = 'identification-photos'
        AND name = 'Allow all operations on identification photos'
    ) THEN
        CREATE POLICY "Allow all operations on identification photos" ON storage.objects
            FOR ALL
            USING (bucket_id = 'identification-photos')
            WITH CHECK (bucket_id = 'identification-photos');
    END IF;
END $$;

-- 9. Crear vista de bicicletas con propietario
CREATE OR REPLACE VIEW public.bicycles_with_owner AS
SELECT 
    b.*,
    row_to_json(o.*) as owner_data
FROM public.bicycles b
LEFT JOIN public.owners o ON b.owner_id = o.id;

-- 10. Otorgar permisos en la vista
GRANT SELECT ON public.bicycles_with_owner TO authenticated, anon;

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Ejecuta estas queries para verificar que todo se creó correctamente:

-- Ver estructura de owners
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'owners';

-- Ver nuevas columnas en bicycles
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'bicycles' AND column_name IN ('owner_id', 'serial_number', 'purchase_proof', 'identification_photos');

-- Ver buckets de storage
-- SELECT * FROM storage.buckets WHERE id IN ('purchase-proofs', 'identification-photos');

RAISE NOTICE 'Migración completada exitosamente';
