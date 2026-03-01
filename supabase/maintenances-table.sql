-- ============================================================================
-- MIGRACIÓN: Tabla de Mantenciones Separada
-- ============================================================================

-- Crear tabla de mantenciones
CREATE TABLE IF NOT EXISTS public.maintenances (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    bicycle_id UUID NOT NULL REFERENCES public.bicycles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    maintenance_type TEXT NOT NULL CHECK (maintenance_type IN ('repuesto', 'mano_de_obra')),
    description TEXT NOT NULL,
    cost NUMERIC(10, 2) DEFAULT 0,
    kilometers_at_maintenance INTEGER,
    next_maintenance_kilometers INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Índices
CREATE INDEX IF NOT EXISTS maintenances_bicycle_id_idx ON public.maintenances(bicycle_id);
CREATE INDEX IF NOT EXISTS maintenances_date_idx ON public.maintenances(date DESC);
CREATE INDEX IF NOT EXISTS maintenances_type_idx ON public.maintenances(maintenance_type);

-- RLS Policies
ALTER TABLE public.maintenances ENABLE ROW LEVEL SECURITY;

-- Admin y mechanic pueden ver todas las mantenciones
DROP POLICY IF EXISTS "maintenances_select_policy" ON public.maintenances;
CREATE POLICY "maintenances_select_policy" ON public.maintenances
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.owners 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'mechanic')
        )
        OR
        -- Clientes solo ven mantenciones de sus bicis
        EXISTS (
            SELECT 1 FROM public.bicycles b
            JOIN public.owners o ON b.owner_id = o.id
            WHERE b.id = maintenances.bicycle_id
            AND o.user_id = auth.uid()
            AND o.role = 'customer'
        )
    );

-- Admin y mechanic pueden insertar mantenciones
DROP POLICY IF EXISTS "maintenances_insert_policy" ON public.maintenances;
CREATE POLICY "maintenances_insert_policy" ON public.maintenances
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.owners 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'mechanic')
        )
    );

-- Admin y mechanic pueden actualizar mantenciones
DROP POLICY IF EXISTS "maintenances_update_policy" ON public.maintenances;
CREATE POLICY "maintenances_update_policy" ON public.maintenances
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.owners 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'mechanic')
        )
    );

-- Solo admin puede eliminar mantenciones
DROP POLICY IF EXISTS "maintenances_delete_policy" ON public.maintenances;
CREATE POLICY "maintenances_delete_policy" ON public.maintenances
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.owners 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Migrar datos existentes del campo maintenance_history a la nueva tabla
-- NOTA: Ejecutar solo si hay datos que migrar
-- INSERT INTO public.maintenances (bicycle_id, date, maintenance_type, description, cost, kilometers_at_maintenance, next_maintenance_kilometers)
-- SELECT 
--     id as bicycle_id,
--     (jsonb_array_elements(maintenance_history)->>'date')::date as date,
--     'mano_de_obra' as maintenance_type, -- Valor por defecto, ajustar según sea necesario
--     jsonb_array_elements(maintenance_history)->>'description' as description,
--     (jsonb_array_elements(maintenance_history)->>'cost')::numeric as cost,
--     (jsonb_array_elements(maintenance_history)->>'kilometersAtMaintenance')::integer as kilometers_at_maintenance,
--     (jsonb_array_elements(maintenance_history)->>'nextMaintenanceKilometers')::integer as next_maintenance_kilometers
-- FROM public.bicycles
-- WHERE maintenance_history IS NOT NULL AND jsonb_array_length(maintenance_history) > 0;

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_maintenances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS maintenances_updated_at_trigger ON public.maintenances;
CREATE TRIGGER maintenances_updated_at_trigger
    BEFORE UPDATE ON public.maintenances
    FOR EACH ROW
    EXECUTE FUNCTION public.update_maintenances_updated_at();

-- ============================================================================
SELECT '✅ Tabla de mantenciones creada exitosamente' as resultado;
