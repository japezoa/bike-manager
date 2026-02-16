import { supabase, BIKE_IMAGES_BUCKET } from './supabase';
import { Bicycle } from '@/types/bicycle';

export const bicycleService = {
  // Create
  async create(bicycle: Omit<Bicycle, 'id' | 'created_at' | 'updated_at'>): Promise<Bicycle> {
    const { data, error } = await supabase
      .from('bicycles')
      .insert([bicycle])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Read all
  async getAll(): Promise<Bicycle[]> {
    const { data, error } = await supabase
      .from('bicycles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Read one
  async getById(id: string): Promise<Bicycle> {
    const { data, error } = await supabase
      .from('bicycles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Update
  async update(id: string, bicycle: Partial<Bicycle>): Promise<Bicycle> {
    const { data, error } = await supabase
      .from('bicycles')
      .update(bicycle)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('bicycles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Upload image
  async uploadImage(file: File, bicycleId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${bicycleId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BIKE_IMAGES_BUCKET)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from(BIKE_IMAGES_BUCKET)
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  // Delete image
  async deleteImage(imageUrl: string): Promise<void> {
    if (!imageUrl) return;
    
    const fileName = imageUrl.split('/').pop();
    if (!fileName) return;

    const { error } = await supabase.storage
      .from(BIKE_IMAGES_BUCKET)
      .remove([fileName]);

    if (error) console.error('Error deleting image:', error);
  }
};
