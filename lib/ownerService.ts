import { supabase } from './supabase';
import { Owner } from '@/types/bicycle';

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

export const ownerService = {
  // Create
  async create(owner: Omit<Owner, 'id' | 'created_at' | 'updated_at'>): Promise<Owner> {
    // Validate unique RUT
    const existingRut = await this.getByRut(owner.rut);
    if (existingRut) {
      throw new Error('Ya existe un propietario con este RUT');
    }

    // Validate unique email
    const allOwners = await this.getAll();
    const existingEmail = allOwners.find(o => o.email === owner.email);
    if (existingEmail) {
      throw new Error('Ya existe un propietario con este email');
    }

    const snakeCaseData = toSnakeCase(owner);
    
    const { data, error } = await supabase
      .from('owners')
      .insert([snakeCaseData])
      .select()
      .single();

    if (error) {
      // Handle unique constraint errors from database
      if (error.code === '23505') {
        if (error.message.includes('rut')) {
          throw new Error('Ya existe un propietario con este RUT');
        }
        if (error.message.includes('email')) {
          throw new Error('Ya existe un propietario con este email');
        }
      }
      throw error;
    }
    
    return toCamelCase(data);
  },

  // Read all
  async getAll(): Promise<Owner[]> {
    const { data, error } = await supabase
      .from('owners')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data ? data.map(toCamelCase) : [];
  },

  // Read one
  async getById(id: string): Promise<Owner> {
    const { data, error } = await supabase
      .from('owners')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return toCamelCase(data);
  },

  // Read by RUT
  async getByRut(rut: string): Promise<Owner | null> {
    const { data, error } = await supabase
      .from('owners')
      .select('*')
      .eq('rut', rut)
      .maybeSingle();

    if (error) throw error;
    return data ? toCamelCase(data) : null;
  },

  // Update
  async update(id: string, owner: Partial<Owner>): Promise<Owner> {
    const snakeCaseData = toSnakeCase(owner);
    
    const { data, error } = await supabase
      .from('owners')
      .update(snakeCaseData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data);
  },

  // Delete
  async delete(id: string): Promise<void> {
    // Check if owner has bicycles
    const { data: bicycles, error: checkError } = await supabase
      .from('bicycles')
      .select('id')
      .eq('owner_id', id)
      .limit(1);

    if (checkError) throw checkError;
    
    if (bicycles && bicycles.length > 0) {
      throw new Error('No se puede eliminar un propietario que tiene bicicletas registradas');
    }

    const { error } = await supabase
      .from('owners')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get bicycles by owner
  async getBicyclesByOwner(ownerId: string): Promise<number> {
    const { count, error } = await supabase
      .from('bicycles')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', ownerId);

    if (error) throw error;
    return count || 0;
  }
};
