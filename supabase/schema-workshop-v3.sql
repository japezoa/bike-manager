-- ============================================================================
-- BIKE WORKSHOP SYSTEM v3.0 - Complete Schema
-- Sistema de taller de bicicletas con autenticación y roles
-- ============================================================================

-- ============================================================================
-- PARTE 1: EXTENSIONES Y FUNCIONES
-- ============================================================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Función para updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- ============================================================================
-- PARTE 2: TABLAS PRINCIPALES
-- ============================================================================

-- Tabla de propietarios (ahora incluye roles)
CREATE TABLE IF NOT EXISTS public.owners (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Link con Supabase Auth
    rut TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 0 AND age <= 150),
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'mechanic', 'customer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Índices para owners
CREATE INDEX IF NOT EXISTS owners_rut_idx ON public.owners(rut);
CREATE INDEX IF NOT EXISTS owners_user_id_idx ON public.owners(user_id);
CREATE INDEX IF NOT EXISTS owners_role_idx ON public.owners(role);

-- Tabla de bicicletas (extendida para taller)
CREATE TABLE IF NOT EXISTS public.bicycles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    model TEXT NOT NULL,
    frame TEXT NOT NULL,
    geometry TEXT NOT NULL,
    fork TEXT NOT NULL,
    transmission JSONB NOT NULL,
    brakes JSONB NOT NULL,
    wheels JSONB NOT NULL,
    components JSONB NOT NULL,
    maintenance_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    purchase_date DATE NOT NULL,
    purchase_price INTEGER NOT NULL,
    purchase_condition TEXT NOT NULL CHECK (purchase_condition IN ('new', 'used')),
    image_url TEXT,
    total_kilometers INTEGER DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    
    -- Owner
    owner_id UUID REFERENCES public.owners(id) ON DELETE SET NULL,
    
    -- Anti-theft
    serial_number TEXT,
    purchase_proof JSONB DEFAULT '{}'::jsonb,
    identification_photos JSONB DEFAULT '[]'::jsonb,
    
    -- Workshop
    current_status TEXT DEFAULT 'with_owner' CHECK (current_status IN ('with_owner', 'in_workshop', 'ready_for_pickup')),
    physical_location TEXT,
    reception_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Índices para bicycles
CREATE INDEX IF NOT EXISTS bicycles_owner_id_idx ON public.bicycles(owner_id);
CREATE INDEX IF NOT EXISTS bicycles_current_status_idx ON public.bicycles(current_status);
CREATE INDEX IF NOT EXISTS bicycles_serial_number_idx ON public.bicycles(serial_number) WHERE serial_number IS NOT NULL;

-- Tabla de órdenes de trabajo
CREATE TABLE IF NOT EXISTS public.work_orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    work_order_number TEXT NOT NULL UNIQUE,
    bicycle_id UUID NOT NULL REFERENCES public.bicycles(id) ON DELETE CASCADE,
    
    -- Fechas
    entry_date DATE NOT NULL,
    estimated_delivery_date DATE NOT NULL,
    actual_delivery_date DATE,
    
    -- Estado
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
    
    -- Asignación
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

-- Tabla de notificaciones
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
-- PARTE 3: TRIGGERS
-- ============================================================================

-- Trigger updated_at para owners
DROP TRIGGER IF EXISTS set_owners_updated_at ON public.owners;
CREATE TRIGGER set_owners_updated_at
    BEFORE UPDATE ON public.owners
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Trigger updated_at para bicycles
DROP TRIGGER IF EXISTS set_bicycles_updated_at ON public.bicycles;
CREATE TRIGGER set_bicycles_updated_at
    BEFORE UPDATE ON public.bicycles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Trigger updated_at para work_orders
DROP TRIGGER IF EXISTS set_work_orders_updated_at ON public.work_orders;
CREATE TRIGGER set_work_orders_updated_at
    BEFORE UPDATE ON public.work_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- PARTE 4: ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bicycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para OWNERS
-- Admin y mechanic ven todos, customer solo se ve a sí mismo
DROP POLICY IF EXISTS "owners_select_policy" ON public.owners;
CREATE POLICY "owners_select_policy" ON public.owners
    FOR SELECT USING (
        get_user_role() IN ('admin', 'mechanic')
        OR user_id = auth.uid()
    );

DROP POLICY IF EXISTS "owners_insert_policy" ON public.owners;
CREATE POLICY "owners_insert_policy" ON public.owners
    FOR INSERT WITH CHECK (
        get_user_role() = 'admin'
        OR user_id = auth.uid() -- Permitir auto-registro
    );

DROP POLICY IF EXISTS "owners_update_policy" ON public.owners;
CREATE POLICY "owners_update_policy" ON public.owners
    FOR UPDATE USING (
        get_user_role() = 'admin'
        OR user_id = auth.uid()
    );

DROP POLICY IF EXISTS "owners_delete_policy" ON public.owners;
CREATE POLICY "owners_delete_policy" ON public.owners
    FOR DELETE USING (get_user_role() = 'admin');

-- Políticas para BICYCLES
-- Admin y mechanic ven todas, customer solo las suyas
DROP POLICY IF EXISTS "bicycles_select_policy" ON public.bicycles;
CREATE POLICY "bicycles_select_policy" ON public.bicycles
    FOR SELECT USING (
        get_user_role() IN ('admin', 'mechanic')
        OR owner_id IN (SELECT id FROM public.owners WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "bicycles_insert_policy" ON public.bicycles;
CREATE POLICY "bicycles_insert_policy" ON public.bicycles
    FOR INSERT WITH CHECK (get_user_role() IN ('admin', 'mechanic'));

DROP POLICY IF EXISTS "bicycles_update_policy" ON public.bicycles;
CREATE POLICY "bicycles_update_policy" ON public.bicycles
    FOR UPDATE USING (get_user_role() IN ('admin', 'mechanic'));

DROP POLICY IF EXISTS "bicycles_delete_policy" ON public.bicycles;
CREATE POLICY "bicycles_delete_policy" ON public.bicycles
    FOR DELETE USING (get_user_role() = 'admin');

-- Políticas para WORK_ORDERS
-- Admin y mechanic ven todas, customer solo las de sus bicis
DROP POLICY IF EXISTS "work_orders_select_policy" ON public.work_orders;
CREATE POLICY "work_orders_select_policy" ON public.work_orders
    FOR SELECT USING (
        get_user_role() IN ('admin', 'mechanic')
        OR bicycle_id IN (
            SELECT b.id FROM public.bicycles b
            INNER JOIN public.owners o ON b.owner_id = o.id
            WHERE o.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "work_orders_insert_policy" ON public.work_orders;
CREATE POLICY "work_orders_insert_policy" ON public.work_orders
    FOR INSERT WITH CHECK (get_user_role() IN ('admin', 'mechanic'));

DROP POLICY IF EXISTS "work_orders_update_policy" ON public.work_orders;
CREATE POLICY "work_orders_update_policy" ON public.work_orders
    FOR UPDATE USING (get_user_role() IN ('admin', 'mechanic'));

DROP POLICY IF EXISTS "work_orders_delete_policy" ON public.work_orders;
CREATE POLICY "work_orders_delete_policy" ON public.work_orders
    FOR DELETE USING (get_user_role() = 'admin');

-- Políticas para NOTIFICATIONS
DROP POLICY IF EXISTS "notifications_select_policy" ON public.notifications;
CREATE POLICY "notifications_select_policy" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_update_policy" ON public.notifications;
CREATE POLICY "notifications_update_policy" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

-- ============================================================================
-- PARTE 5: VISTAS
-- ============================================================================

-- Vista de bicicletas con propietario
CREATE OR REPLACE VIEW public.bicycles_with_owner AS
SELECT 
    b.*,
    row_to_json(o.*) as owner_data
FROM public.bicycles b
LEFT JOIN public.owners o ON b.owner_id = o.id;

-- Vista de órdenes con detalles
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

-- ============================================================================
-- PARTE 6: STORAGE BUCKETS
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('bike-images', 'bike-images', true),
    ('purchase-proofs', 'purchase-proofs', true),
    ('identification-photos', 'identification-photos', true),
    ('work-order-photos', 'work-order-photos', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- PARTE 7: FUNCIONES ÚTILES
-- ============================================================================

-- Generar número de orden de trabajo
CREATE OR REPLACE FUNCTION public.generate_work_order_number()
RETURNS TEXT AS $$
DECLARE
    year TEXT;
    seq INTEGER;
    wo_number TEXT;
BEGIN
    year := TO_CHAR(NOW(), 'YYYY');
    
    SELECT COUNT(*) + 1 INTO seq
    FROM public.work_orders
    WHERE work_order_number LIKE 'OT-' || year || '-%';
    
    wo_number := 'OT-' || year || '-' || LPAD(seq::TEXT, 4, '0');
    
    RETURN wo_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PARTE 8: DATOS INICIALES
-- ============================================================================

-- Crear admin por defecto (debes actualizarlo con el user_id real después del primer login)
INSERT INTO public.owners (rut, name, age, gender, email, phone, role)
VALUES ('11.111.111-1', 'Admin Taller', 30, 'male', 'admin@taller.com', '+56912345678', 'admin')
ON CONFLICT (rut) DO NOTHING;

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

SELECT '✅ Schema de taller creado exitosamente' as resultado;
SELECT 'Recuerda configurar Google OAuth en Supabase Authentication' as nota;
