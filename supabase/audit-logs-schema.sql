-- ============================================================================
-- AUDIT LOG SYSTEM - Sistema de Registro de Cambios
-- ============================================================================

-- Tabla para registrar todos los cambios
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Quién hizo el cambio
    user_id UUID NOT NULL REFERENCES auth.users(id),
    owner_id UUID REFERENCES public.owners(id),
    user_email TEXT NOT NULL,
    user_role TEXT NOT NULL,
    
    -- Qué se cambió
    action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('bicycle', 'owner', 'maintenance', 'work_order')),
    entity_id UUID NOT NULL,
    
    -- Detalles del cambio
    changes JSONB NOT NULL, -- { "field": { "old": "value", "new": "value" } }
    description TEXT, -- Descripción legible del cambio
    
    -- Metadata
    ip_address TEXT,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Índices para búsquedas eficientes
CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_owner_id_idx ON public.audit_logs(owner_id);
CREATE INDEX IF NOT EXISTS audit_logs_entity_idx ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON public.audit_logs(action);

-- RLS: Solo admin puede ver logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_logs_select_policy" ON public.audit_logs;
CREATE POLICY "audit_logs_select_policy" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.owners 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Solo el sistema puede insertar logs (via service role o función)
DROP POLICY IF EXISTS "audit_logs_insert_policy" ON public.audit_logs;
CREATE POLICY "audit_logs_insert_policy" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- Función auxiliar para crear log
CREATE OR REPLACE FUNCTION public.create_audit_log(
    p_action TEXT,
    p_entity_type TEXT,
    p_entity_id UUID,
    p_changes JSONB,
    p_description TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
    v_owner_id UUID;
    v_user_email TEXT;
    v_user_role TEXT;
    v_log_id UUID;
BEGIN
    -- Obtener información del usuario actual
    v_user_id := auth.uid();
    
    SELECT id, email, role INTO v_owner_id, v_user_email, v_user_role
    FROM public.owners
    WHERE user_id = v_user_id;
    
    -- Insertar log
    INSERT INTO public.audit_logs (
        user_id,
        owner_id,
        user_email,
        user_role,
        action,
        entity_type,
        entity_id,
        changes,
        description
    ) VALUES (
        v_user_id,
        v_owner_id,
        COALESCE(v_user_email, 'unknown'),
        COALESCE(v_user_role, 'unknown'),
        p_action,
        p_entity_type,
        p_entity_id,
        p_changes,
        p_description
    ) RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS AUTOMÁTICOS PARA AUDIT LOGS
-- ============================================================================

-- Trigger para bicycles
CREATE OR REPLACE FUNCTION public.log_bicycle_changes()
RETURNS TRIGGER AS $$
DECLARE
    changes JSONB := '{}'::jsonb;
    description TEXT;
BEGIN
    IF TG_OP = 'INSERT' THEN
        changes := jsonb_build_object('new', to_jsonb(NEW));
        description := 'Bicicleta creada: ' || NEW.name;
        
        PERFORM public.create_audit_log(
            'create',
            'bicycle',
            NEW.id,
            changes,
            description
        );
        
    ELSIF TG_OP = 'UPDATE' THEN
        -- Comparar campos importantes
        IF OLD.name != NEW.name THEN
            changes := changes || jsonb_build_object('name', jsonb_build_object('old', OLD.name, 'new', NEW.name));
        END IF;
        
        IF OLD.owner_id IS DISTINCT FROM NEW.owner_id THEN
            changes := changes || jsonb_build_object('owner_id', jsonb_build_object('old', OLD.owner_id, 'new', NEW.owner_id));
        END IF;
        
        IF OLD.current_status != NEW.current_status THEN
            changes := changes || jsonb_build_object('current_status', jsonb_build_object('old', OLD.current_status, 'new', NEW.current_status));
        END IF;
        
        IF OLD.maintenance_history::text != NEW.maintenance_history::text THEN
            changes := changes || jsonb_build_object('maintenance_history', jsonb_build_object('old', OLD.maintenance_history, 'new', NEW.maintenance_history));
        END IF;
        
        -- Solo log si hubo cambios
        IF changes != '{}'::jsonb THEN
            description := 'Bicicleta modificada: ' || NEW.name;
            
            PERFORM public.create_audit_log(
                'update',
                'bicycle',
                NEW.id,
                changes,
                description
            );
        END IF;
        
    ELSIF TG_OP = 'DELETE' THEN
        changes := jsonb_build_object('deleted', to_jsonb(OLD));
        description := 'Bicicleta eliminada: ' || OLD.name;
        
        PERFORM public.create_audit_log(
            'delete',
            'bicycle',
            OLD.id,
            changes,
            description
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS bicycle_audit_trigger ON public.bicycles;
CREATE TRIGGER bicycle_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.bicycles
    FOR EACH ROW
    EXECUTE FUNCTION public.log_bicycle_changes();

-- Trigger para owners
CREATE OR REPLACE FUNCTION public.log_owner_changes()
RETURNS TRIGGER AS $$
DECLARE
    changes JSONB := '{}'::jsonb;
    description TEXT;
BEGIN
    IF TG_OP = 'INSERT' THEN
        changes := jsonb_build_object('new', to_jsonb(NEW));
        description := 'Propietario creado: ' || NEW.name;
        
        PERFORM public.create_audit_log(
            'create',
            'owner',
            NEW.id,
            changes,
            description
        );
        
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.role != NEW.role THEN
            changes := changes || jsonb_build_object('role', jsonb_build_object('old', OLD.role, 'new', NEW.role));
        END IF;
        
        IF OLD.phone != NEW.phone THEN
            changes := changes || jsonb_build_object('phone', jsonb_build_object('old', OLD.phone, 'new', NEW.phone));
        END IF;
        
        IF changes != '{}'::jsonb THEN
            description := 'Propietario modificado: ' || NEW.name;
            
            PERFORM public.create_audit_log(
                'update',
                'owner',
                NEW.id,
                changes,
                description
            );
        END IF;
        
    ELSIF TG_OP = 'DELETE' THEN
        changes := jsonb_build_object('deleted', to_jsonb(OLD));
        description := 'Propietario eliminado: ' || OLD.name;
        
        PERFORM public.create_audit_log(
            'delete',
            'owner',
            OLD.id,
            changes,
            description
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS owner_audit_trigger ON public.owners;
CREATE TRIGGER owner_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.owners
    FOR EACH ROW
    EXECUTE FUNCTION public.log_owner_changes();

-- ============================================================================
-- VISTA PARA CONSULTAR LOGS
-- ============================================================================

CREATE OR REPLACE VIEW public.audit_logs_readable AS
SELECT 
    al.id,
    al.created_at,
    al.user_email,
    al.user_role,
    al.action,
    al.entity_type,
    al.entity_id,
    al.description,
    al.changes,
    o.name as user_name
FROM public.audit_logs al
LEFT JOIN public.owners o ON al.owner_id = o.id
ORDER BY al.created_at DESC;

GRANT SELECT ON public.audit_logs_readable TO authenticated;

-- ============================================================================
SELECT '✅ Sistema de Audit Logs creado exitosamente' as resultado;
