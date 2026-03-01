import { supabase } from './supabase';

export interface Maintenance {
  id?: string;
  bicycleId: string;
  date: string;
  maintenanceType: 'repuesto' | 'mano_de_obra';
  description: string;
  cost?: number;
  kilometersAtMaintenance?: number;
  nextMaintenanceKilometers?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

// Convert camelCase to snake_case
const toSnakeCase = (obj: any): any => {
  if (!obj) return obj;
  const newObj: any = {};
  Object.keys(obj).forEach(key => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    newObj[snakeKey] = obj[key];
  });
  return newObj;
};

// Convert snake_case to camelCase
const toCamelCase = (obj: any): any => {
  if (!obj) return obj;
  const newObj: any = {};
  Object.keys(obj).forEach(key => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    newObj[camelKey] = obj[key];
  });
  return newObj;
};

export const maintenanceService = {
  // Get all maintenances for a bicycle
  async getByBicycleId(bicycleId: string): Promise<Maintenance[]> {
    const { data, error } = await supabase
      .from('maintenances')
      .select('*')
      .eq('bicycle_id', bicycleId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data ? data.map(toCamelCase) : [];
  },

  // Get single maintenance
  async getById(id: string): Promise<Maintenance | null> {
    const { data, error } = await supabase
      .from('maintenances')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return toCamelCase(data);
  },

  // Create maintenance
  async create(maintenance: Omit<Maintenance, 'id' | 'createdAt' | 'updatedAt'>): Promise<Maintenance> {
    const snakeCaseData = toSnakeCase(maintenance);
    
    const { data, error } = await supabase
      .from('maintenances')
      .insert([{
        ...snakeCaseData,
        created_by: (await supabase.auth.getUser()).data.user?.id
      }])
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data);
  },

  // Update maintenance
  async update(id: string, maintenance: Partial<Maintenance>): Promise<Maintenance> {
    const snakeCaseData = toSnakeCase(maintenance);
    
    const { data, error } = await supabase
      .from('maintenances')
      .update(snakeCaseData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data);
  },

  // Delete maintenance
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('maintenances')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get total cost of maintenances for a bicycle
  async getTotalCost(bicycleId: string): Promise<number> {
    const { data, error } = await supabase
      .from('maintenances')
      .select('cost')
      .eq('bicycle_id', bicycleId);

    if (error) throw error;
    
    return data.reduce((total, m) => total + (m.cost || 0), 0);
  },

  // Get last maintenance date for a bicycle
  async getLastMaintenanceDate(bicycleId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('maintenances')
      .select('date')
      .eq('bicycle_id', bicycleId)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    return data?.date || null;
  }
};
