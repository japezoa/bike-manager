-- ============================================================================
-- BIKE MANAGER v2.0 - Complete Schema with Owner Management & Anti-Theft
-- ============================================================================

-- Create the owners table
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

-- Create index on RUT for faster lookups
CREATE INDEX IF NOT EXISTS owners_rut_idx ON public.owners(rut);

-- Create the bicycles table (updated with owner and anti-theft fields)
CREATE TABLE IF NOT EXISTS public.bicycles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
    
    -- Owner information
    owner_id UUID REFERENCES public.owners(id) ON DELETE SET NULL,
    
    -- Anti-theft / Identification
    serial_number TEXT,
    purchase_proof JSONB DEFAULT '{
        "receiptNumber": null,
        "barcode": null,
        "receiptImageUrl": null,
        "purchaseMethod": null,
        "sellerInfo": null,
        "evidenceImageUrls": []
    }'::jsonb,
    identification_photos JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS bicycles_created_at_idx ON public.bicycles(created_at DESC);
CREATE INDEX IF NOT EXISTS bicycles_display_order_idx ON public.bicycles(display_order ASC);
CREATE INDEX IF NOT EXISTS bicycles_owner_id_idx ON public.bicycles(owner_id);
CREATE INDEX IF NOT EXISTS bicycles_serial_number_idx ON public.bicycles(serial_number) WHERE serial_number IS NOT NULL;

-- Enable Row Level Security (RLS)
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bicycles ENABLE ROW LEVEL SECURITY;

-- Create policies that allow all operations (adjust based on your auth needs)
CREATE POLICY "Enable all operations for all users on owners" ON public.owners
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable all operations for all users on bicycles" ON public.bicycles
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create functions to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to call the function
CREATE TRIGGER set_owners_updated_at
    BEFORE UPDATE ON public.owners
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_bicycles_updated_at
    BEFORE UPDATE ON public.bicycles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create storage bucket for bike images (main photo)
INSERT INTO storage.buckets (id, name, public)
VALUES ('bike-images', 'bike-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for purchase proof documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('purchase-proofs', 'purchase-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for identification photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('identification-photos', 'identification-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies to allow all operations
CREATE POLICY "Allow all operations on bike images" ON storage.objects
    FOR ALL
    USING (bucket_id = 'bike-images')
    WITH CHECK (bucket_id = 'bike-images');

CREATE POLICY "Allow all operations on purchase proofs" ON storage.objects
    FOR ALL
    USING (bucket_id = 'purchase-proofs')
    WITH CHECK (bucket_id = 'purchase-proofs');

CREATE POLICY "Allow all operations on identification photos" ON storage.objects
    FOR ALL
    USING (bucket_id = 'identification-photos')
    WITH CHECK (bucket_id = 'identification-photos');

-- Create a view for bicycle with owner information
CREATE OR REPLACE VIEW public.bicycles_with_owner AS
SELECT 
    b.*,
    row_to_json(o.*) as owner_data
FROM public.bicycles b
LEFT JOIN public.owners o ON b.owner_id = o.id;

-- Grant permissions on the view
GRANT SELECT ON public.bicycles_with_owner TO authenticated, anon;

-- ============================================================================
-- Sample Data Insertions (Optional - Remove if not needed)
-- ============================================================================

-- You can add your existing bicycles here after creating owners
-- Example:
-- INSERT INTO public.owners (rut, name, age, gender, email, phone)
-- VALUES ('12.345.678-9', 'Juan Pérez', 35, 'male', 'juan@example.com', '+56912345678');
