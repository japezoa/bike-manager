-- ============================================================================
-- CONFIGURACIÓN DE POLÍTICAS DE STORAGE
-- Ejecuta este script DESPUÉS de migration-v2-clean.sql
-- SOLO SI NECESITAS configurar políticas de storage manualmente
-- ============================================================================

-- IMPORTANTE: Si tienes errores con este script, puedes configurar las políticas
-- manualmente desde la UI de Supabase:
-- Storage → [bucket] → Policies → New Policy

-- ============================================================================
-- MÉTODO 1: Usando la UI de Supabase (RECOMENDADO)
-- ============================================================================
-- 1. Ve a Storage en Supabase
-- 2. Click en el bucket "bike-images"
-- 3. Ve a la pestaña "Policies"
-- 4. Click en "New Policy"
-- 5. Selecciona "For full customization"
-- 6. Configura:
--    - Policy name: Allow all operations
--    - Allowed operation: SELECT, INSERT, UPDATE, DELETE
--    - Policy definition: true
--    - With check: true
-- 7. Repite para "purchase-proofs" e "identification-photos"

-- ============================================================================
-- MÉTODO 2: SQL (Solo si el Método 1 no funciona)
-- ============================================================================

-- Para bike-images
DO $$ 
BEGIN
    -- Intentar crear política
    BEGIN
        EXECUTE format('
            CREATE POLICY %I ON storage.objects
            FOR ALL
            USING (bucket_id = %L)
            WITH CHECK (bucket_id = %L)
        ', 'Allow all on bike-images', 'bike-images', 'bike-images');
    EXCEPTION 
        WHEN duplicate_object THEN
            RAISE NOTICE 'Policy already exists for bike-images';
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not create policy for bike-images: %', SQLERRM;
    END;
END $$;

-- Para purchase-proofs
DO $$ 
BEGIN
    BEGIN
        EXECUTE format('
            CREATE POLICY %I ON storage.objects
            FOR ALL
            USING (bucket_id = %L)
            WITH CHECK (bucket_id = %L)
        ', 'Allow all on purchase-proofs', 'purchase-proofs', 'purchase-proofs');
    EXCEPTION 
        WHEN duplicate_object THEN
            RAISE NOTICE 'Policy already exists for purchase-proofs';
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not create policy for purchase-proofs: %', SQLERRM;
    END;
END $$;

-- Para identification-photos
DO $$ 
BEGIN
    BEGIN
        EXECUTE format('
            CREATE POLICY %I ON storage.objects
            FOR ALL
            USING (bucket_id = %L)
            WITH CHECK (bucket_id = %L)
        ', 'Allow all on identification-photos', 'identification-photos', 'identification-photos');
    EXCEPTION 
        WHEN duplicate_object THEN
            RAISE NOTICE 'Policy already exists for identification-photos';
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not create policy for identification-photos: %', SQLERRM;
    END;
END $$;

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Ver buckets
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id IN ('bike-images', 'purchase-proofs', 'identification-photos');

-- Mostrar mensaje
SELECT '✅ Configuración de storage completada' as resultado;
SELECT 'Si hubo errores, configura las políticas manualmente desde la UI' as nota;
