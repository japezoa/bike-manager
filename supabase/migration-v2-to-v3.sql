-- ============================================================================
-- MIGRACIÓN v2.0 → v3.0 (Sistema de Taller)
-- Ejecutar SOLO si ya tienes v2.0 funcionando
-- ============================================================================

-- ============================================================================
-- PARTE 1: EXTENSIONES
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PARTE 2: AGREGAR CAMPOS A OWNERS (autenticación y roles)
-- ============================================================================

-- Agregar user_id para vincular con Supabase Auth
ALTER TABLE public.owners ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Agregar campo de rol
ALTER TABLE public.owners ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer' CHECK (role IN ('admin', 'mechanic', 'customer'));

-- Crear índices
CREATE INDEX IF NOT EXISTS owners_user_id_idx ON public.owners(user_id);
CREATE INDEX IF NOT EXISTS owners_role_idx ON public.owners(role);

-- Hacer email único
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'owners_email_key'
    ) THEN
        ALTER TABLE public.owners ADD CONSTRAINT owners_email_key UNIQUE (email);
    END IF;
END $$;

-- ============================================================================
-- PARTE 3: AGREGAR CAMPOS A BICYCLES (estado del taller)
-- ============================================================================

-- Estado actual de la bici
ALTER TABLE public.bicycles ADD COLUMN IF NOT EXISTS current_status TEXT DEFAULT 'with_owner' 
    CHECK (current_status IN ('with_owner', 'in_workshop', 'ready_for_pickup'));

-- Ubicación física en el taller
ALTER TABLE public.bicycles ADD COLUMN IF NOT EXISTS physical_location TEXT;

-- Notas de recepción
ALTER TABLE public.bicycles ADD COLUMN IF NOT EXISTS reception_notes TEXT;

-- Crear índice
CREATE INDEX IF NOT EXISTS bicycles_current_status_idx ON public.bicycles(current_status);

-- ============================================================================
-- PARTE 4: CREAR TABLA DE ÓRDENES DE TRABAJO
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.work_orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    work_order_number TEXT NOT NULL UNIQUE,
    bicycle_id UUID NOT NULL REFERENCES public.bicycles(id) ON DELETE CASCADE,
    
    -- Fechas
    entry_date DATE NOT NULL,
    estimated_delivery_date DATE NOT NULL,
    actual_delivery_date DATE,
    
    -- Estado y prioridad
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'waiting_parts', 'completed', 'delivered', 'cancelled')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'urgent')),
    
    -- Descripción
    description TEXT NOT NULL,
    internal_notes TEXT,
    
    -- Items de trabajo (JSON array)
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Totales
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
    iva NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0,
    
    -- Asignación a mecánico
    assigned_to_id UUID REFERENCES public.owners(id) ON DELETE SET NULL,
    
    -- Fotos
    reception_photos JSONB DEFAULT '[]'::jsonb,
    work_photos JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Índices para work_orders
CREATE INDEX IF NOT EXISTS work_orders_bicycle_id_idx ON public.work_orders(bicycle_id);
CREATE INDEX IF NOT EXISTS work_orders_status_idx ON public.work_orders(status);
CREATE INDEX IF NOT EXISTS work_orders_assigned_to_idx ON public.work_orders(assigned_to_id);
CREATE INDEX IF NOT EXISTS work_orders_entry_date_idx ON public.work_orders(entry_date DESC);

-- ============================================================================
-- PARTE 5: CREAR TABLA DE NOTIFICACIONES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    work_order_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('order_ready', 'order_created', 'status_changed')),
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON public.notifications(user_id, read);

-- ============================================================================
-- PARTE 6: CREAR STORAGE BUCKET PARA FOTOS DE OT
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('work-order-photos', 'work-order-photos', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- PARTE 7: TRIGGERS
-- ============================================================================

-- Trigger para work_orders updated_at
DROP TRIGGER IF EXISTS set_work_orders_updated_at ON public.work_orders;
CREATE TRIGGER set_work_orders_updated_at
    BEFORE UPDATE ON public.work_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- PARTE 8: FUNCIONES ÚTILES
-- ============================================================================

-- Función para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM public.owners
    WHERE user_id = auth.uid();
    
    RETURN COALESCE(user_role, 'customer');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para generar número de orden de trabajo
CREATE OR REPLACE FUNCTION public.generate_work_order_number()
RETURNS TEXT AS $$
DECLARE
    year TEXT;
    seq INTEGER;
    wo_number TEXT;
BEGIN
    year := TO_CHAR(NOW(), 'YYYY');
    
    SELECT COALESCE(MAX(
        CAST(
            SUBSTRING(work_order_number FROM 'OT-[0-9]{4}-([0-9]{4})') AS INTEGER
        )
    ), 0) + 1 INTO seq
    FROM public.work_orders
    WHERE work_order_number LIKE 'OT-' || year || '-%';
    
    wo_number := 'OT-' || year || '-' || LPAD(seq::TEXT, 4, '0');
    
    RETURN wo_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PARTE 9: ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS en tablas nuevas
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas antiguas si existen
DROP POLICY IF EXISTS "owners_select_policy" ON public.owners;
DROP POLICY IF EXISTS "owners_insert_policy" ON public.owners;
DROP POLICY IF EXISTS "owners_update_policy" ON public.owners;
DROP POLICY IF EXISTS "owners_delete_policy" ON public.owners;

DROP POLICY IF EXISTS "bicycles_select_policy" ON public.bicycles;
DROP POLICY IF EXISTS "bicycles_insert_policy" ON public.bicycles;
DROP POLICY IF EXISTS "bicycles_update_policy" ON public.bicycles;
DROP POLICY IF EXISTS "bicycles_delete_policy" ON public.bicycles;

-- Políticas para OWNERS
CREATE POLICY "owners_select_policy" ON public.owners
    FOR SELECT USING (
        get_user_role() IN ('admin', 'mechanic')
        OR user_id = auth.uid()
    );

CREATE POLICY "owners_insert_policy" ON public.owners
    FOR INSERT WITH CHECK (
        get_user_role() = 'admin'
        OR user_id = auth.uid()
    );

CREATE POLICY "owners_update_policy" ON public.owners
    FOR UPDATE USING (
        get_user_role() = 'admin'
        OR user_id = auth.uid()
    );

CREATE POLICY "owners_delete_policy" ON public.owners
    FOR DELETE USING (get_user_role() = 'admin');

-- Políticas para BICYCLES
CREATE POLICY "bicycles_select_policy" ON public.bicycles
    FOR SELECT USING (
        get_user_role() IN ('admin', 'mechanic')
        OR owner_id IN (SELECT id FROM public.owners WHERE user_id = auth.uid())
    );

CREATE POLICY "bicycles_insert_policy" ON public.bicycles
    FOR INSERT WITH CHECK (get_user_role() IN ('admin', 'mechanic'));

CREATE POLICY "bicycles_update_policy" ON public.bicycles
    FOR UPDATE USING (get_user_role() IN ('admin', 'mechanic'));

CREATE POLICY "bicycles_delete_policy" ON public.bicycles
    FOR DELETE USING (get_user_role() = 'admin');

-- Políticas para WORK_ORDERS
CREATE POLICY "work_orders_select_policy" ON public.work_orders
    FOR SELECT USING (
        get_user_role() IN ('admin', 'mechanic')
        OR bicycle_id IN (
            SELECT b.id FROM public.bicycles b
            INNER JOIN public.owners o ON b.owner_id = o.id
            WHERE o.user_id = auth.uid()
        )
    );

CREATE POLICY "work_orders_insert_policy" ON public.work_orders
    FOR INSERT WITH CHECK (get_user_role() IN ('admin', 'mechanic'));

CREATE POLICY "work_orders_update_policy" ON public.work_orders
    FOR UPDATE USING (get_user_role() IN ('admin', 'mechanic'));

CREATE POLICY "work_orders_delete_policy" ON public.work_orders
    FOR DELETE USING (get_user_role() = 'admin');

-- Políticas para NOTIFICATIONS
CREATE POLICY "notifications_select_policy" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notifications_update_policy" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "notifications_insert_policy" ON public.notifications
    FOR INSERT WITH CHECK (true); -- El sistema puede crear notificaciones

-- ============================================================================
-- PARTE 10: VISTAS
-- ============================================================================

-- Vista de órdenes con detalles completos
CREATE OR REPLACE VIEW public.work_orders_full AS
SELECT 
    wo.*,
    row_to_json(b.*) as bicycle_data,
    row_to_json(m.*) as mechanic_data,
    row_to_json(own.*) as owner_data
FROM public.work_orders wo
LEFT JOIN public.bicycles b ON wo.bicycle_id = b.id
LEFT JOIN public.owners m ON wo.assigned_to_id = m.id
LEFT JOIN public.owners own ON b.owner_id = own.id;

-- Otorgar permisos en la vista
GRANT SELECT ON public.work_orders_full TO authenticated, anon;

-- ============================================================================
-- PARTE 11: DATOS INICIALES
-- ============================================================================

-- Actualizar admin existente con rol (si existe)
UPDATE public.owners 
SET role = 'admin' 
WHERE email = 'admin@taller.com' OR rut = '11.111.111-1';

-- Si no existe, crear uno (deberás vincular user_id después del primer login)
INSERT INTO public.owners (rut, name, age, gender, email, phone, role)
VALUES ('11.111.111-1', 'Admin Taller', 30, 'male', 'admin@taller.com', '+56912345678', 'admin')
ON CONFLICT (rut) DO UPDATE SET role = 'admin';

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Ver estructura actualizada de owners
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'owners'
ORDER BY ordinal_position;

-- Ver estructura de work_orders
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'work_orders'
ORDER BY ordinal_position;

-- Ver buckets de storage
SELECT id, name, public
FROM storage.buckets
WHERE id IN ('bike-images', 'purchase-proofs', 'identification-photos', 'work-order-photos');

SELECT '✅ Migración a Sistema de Taller v3.0 completada' as resultado;
SELECT '📝 Siguiente paso: Configurar Google OAuth en Supabase' as nota1;
SELECT '👤 Vincular user_id del admin después del primer login' as nota2;
