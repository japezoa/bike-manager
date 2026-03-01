import { supabase, BIKE_IMAGES_BUCKET, PURCHASE_PROOFS_BUCKET, IDENTIFICATION_PHOTOS_BUCKET } from './supabase';
import { Bicycle } from '@/types/bicycle';

// Helper function to convert camelCase to snake_case
const toSnakeCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      acc[snakeKey] = toSnakeCase(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
};

// Helper function to convert snake_case to camelCase
const toCamelCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = toCamelCase(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
};

export const bicycleService = {
  // Create
  async create(bicycle: Omit<Bicycle, 'id' | 'created_at' | 'updated_at'>): Promise<Bicycle> {
    const snakeCaseData = toSnakeCase(bicycle);
    
    const { data, error } = await supabase
      .from('bicycles')
      .insert([snakeCaseData])
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data);
  },

  // Read all
  async getAll(): Promise<Bicycle[]> {
    const { data, error } = await supabase
      .from('bicycles')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data ? data.map(toCamelCase) : [];
  },

  // Read one
  async getById(id: string): Promise<Bicycle> {
    const { data, error } = await supabase
      .from('bicycles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return toCamelCase(data);
  },

  // Update
  async update(id: string, bicycle: Partial<Bicycle>): Promise<Bicycle> {
    const snakeCaseData = toSnakeCase(bicycle);
    
    const { data, error } = await supabase
      .from('bicycles')
      .update(snakeCaseData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data);
  },

  // Delete
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('bicycles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Update display order
  async updateOrder(updates: { id: string; displayOrder: number }[]): Promise<void> {
    const promises = updates.map(({ id, displayOrder }) =>
      supabase
        .from('bicycles')
        .update({ display_order: displayOrder })
        .eq('id', id)
    );

    const results = await Promise.all(promises);
    const errors = results.filter(r => r.error);
    if (errors.length > 0) throw errors[0].error;
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
  },

  // Upload identification photo
  async uploadIdentificationPhoto(file: File, bicycleId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${bicycleId}-id-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(IDENTIFICATION_PHOTOS_BUCKET)
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from(IDENTIFICATION_PHOTOS_BUCKET)
      .getPublicUrl(fileName);

    return data.publicUrl;
  },

  // Upload purchase proof image
  async uploadPurchaseProof(file: File, bicycleId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${bicycleId}-proof-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(PURCHASE_PROOFS_BUCKET)
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from(PURCHASE_PROOFS_BUCKET)
      .getPublicUrl(fileName);

    return data.publicUrl;
  },

  // Delete multiple images from a bucket
  async deleteImages(imageUrls: string[], bucket: string): Promise<void> {
    if (!imageUrls || imageUrls.length === 0) return;

    const fileNames = imageUrls
      .map(url => url.split('/').pop())
      .filter(Boolean) as string[];

    if (fileNames.length === 0) return;

    const { error } = await supabase.storage
      .from(bucket)
      .remove(fileNames);

    if (error) console.error('Error deleting images:', error);
  }
};
