import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket names
export const BIKE_IMAGES_BUCKET = 'bike-images';
export const PURCHASE_PROOFS_BUCKET = 'purchase-proofs';
export const IDENTIFICATION_PHOTOS_BUCKET = 'identification-photos';
