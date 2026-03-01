-- Migración para agregar display_order a tablas existentes
-- Ejecuta este script SOLO si ya tenías la tabla bicycles creada

-- Agregar columna display_order si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bicycles' AND column_name = 'display_order'
    ) THEN
        ALTER TABLE public.bicycles ADD COLUMN display_order INTEGER DEFAULT 0;
        
        -- Crear índice para display_order
        CREATE INDEX bicycles_display_order_idx ON public.bicycles(display_order ASC);
        
        -- Inicializar display_order basado en created_at
        UPDATE public.bicycles 
        SET display_order = subquery.row_num - 1
        FROM (
            SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as row_num
            FROM public.bicycles
        ) AS subquery
        WHERE bicycles.id = subquery.id;
        
        RAISE NOTICE 'Columna display_order agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna display_order ya existe';
    END IF;
END $$;
