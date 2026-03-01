-- ============================================================================
-- QUICK SETUP: Solo Tabla de Propietarios
-- Ejecuta esto si quieres probar SOLO la gestión de propietarios sin migrar todo
-- ============================================================================

-- Crear tabla de propietarios
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

-- Crear índice en RUT
CREATE INDEX IF NOT EXISTS owners_rut_idx ON public.owners(rut);

-- Habilitar RLS
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;

-- Crear política que permite todas las operaciones
CREATE POLICY "Enable all operations for all users on owners" ON public.owners
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Crear función para updated_at (si no existe)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger
DROP TRIGGER IF EXISTS set_owners_updated_at ON public.owners;
CREATE TRIGGER set_owners_updated_at
    BEFORE UPDATE ON public.owners
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Verificar
SELECT 'Tabla owners creada exitosamente!' as status;
SELECT COUNT(*) as total_owners FROM public.owners;
