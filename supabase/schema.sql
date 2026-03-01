-- Create the bicycles table
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create an index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS bicycles_created_at_idx ON public.bicycles(created_at DESC);

-- Create an index on display_order for custom sorting
CREATE INDEX IF NOT EXISTS bicycles_display_order_idx ON public.bicycles(display_order ASC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.bicycles ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (adjust based on your auth needs)
CREATE POLICY "Enable all operations for all users" ON public.bicycles
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.bicycles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create storage bucket for bike images
INSERT INTO storage.buckets (id, name, public)
VALUES ('bike-images', 'bike-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy to allow all operations
CREATE POLICY "Allow all operations on bike images" ON storage.objects
    FOR ALL
    USING (bucket_id = 'bike-images')
    WITH CHECK (bucket_id = 'bike-images');
