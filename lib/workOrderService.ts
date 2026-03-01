import { supabase } from './supabase';
import { WorkOrder, WorkItem } from '@/types/bicycle';

// Helper functions para conversión snake_case <-> camelCase
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

export const workOrderService = {
  // Generate work order number
  async generateWorkOrderNumber(): Promise<string> {
    const { data, error } = await supabase.rpc('generate_work_order_number');
    if (error) throw error;
    return data;
  },

  // Create
  async create(workOrder: Omit<WorkOrder, 'id' | 'created_at' | 'updated_at'>): Promise<WorkOrder> {
    const snakeCaseData = toSnakeCase(workOrder);
    
    const { data, error } = await supabase
      .from('work_orders')
      .insert([snakeCaseData])
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data);
  },

  // Read all (filtered by user role via RLS)
  async getAll(): Promise<WorkOrder[]> {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        bicycle:bicycles(*),
        assigned_to:owners!work_orders_assigned_to_id_fkey(*)
      `)
      .order('entry_date', { ascending: false });

    if (error) throw error;
    return data ? data.map(toCamelCase) : [];
  },

  // Read by status
  async getByStatus(status: string): Promise<WorkOrder[]> {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        bicycle:bicycles(*),
        assigned_to:owners!work_orders_assigned_to_id_fkey(*)
      `)
      .eq('status', status)
      .order('entry_date', { ascending: false });

    if (error) throw error;
    return data ? data.map(toCamelCase) : [];
  },

  // Read by bicycle
  async getByBicycle(bicycleId: string): Promise<WorkOrder[]> {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        bicycle:bicycles(*),
        assigned_to:owners!work_orders_assigned_to_id_fkey(*)
      `)
      .eq('bicycle_id', bicycleId)
      .order('entry_date', { ascending: false });

    if (error) throw error;
    return data ? data.map(toCamelCase) : [];
  },

  // Read one
  async getById(id: string): Promise<WorkOrder> {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        bicycle:bicycles(
          *,
          owner:owners(*)
        ),
        assigned_to:owners!work_orders_assigned_to_id_fkey(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return toCamelCase(data);
  },

  // Update
  async update(id: string, workOrder: Partial<WorkOrder>): Promise<WorkOrder> {
    const snakeCaseData = toSnakeCase(workOrder);
    
    const { data, error } = await supabase
      .from('work_orders')
      .update(snakeCaseData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data);
  },

  // Update status
  async updateStatus(id: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('work_orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    // Create notification if status is 'completed' or 'ready_for_pickup'
    if (status === 'completed') {
      await this.createNotification(id, 'order_ready', 'Tu bicicleta está lista para retirar');
    }
  },

  // Delete
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('work_orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Calculate totals from items
  calculateTotals(items: WorkItem[]): { subtotal: number; iva: number; total: number } {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const iva = Math.round(subtotal * 0.19); // 19% IVA en Chile
    const total = subtotal + iva;
    
    return { subtotal, iva, total };
  },

  // Create notification
  async createNotification(workOrderId: string, type: string, message: string): Promise<void> {
    // Get the work order to find the owner
    const workOrder = await this.getById(workOrderId);
    
    if (workOrder.bicycle?.owner?.user_id) {
      const { error } = await supabase
        .from('notifications')
        .insert([{
          user_id: workOrder.bicycle.owner.user_id,
          work_order_id: workOrderId,
          type,
          message,
          read: false
        }]);

      if (error) console.error('Error creating notification:', error);
    }
  },

  // Get workshop statistics
  async getStats(): Promise<any> {
    const { data: pending } = await supabase
      .from('work_orders')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { data: inProgress } = await supabase
      .from('work_orders')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'in_progress');

    const { data: completed } = await supabase
      .from('work_orders')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'completed');

    const { data: bicycles } = await supabase
      .from('bicycles')
      .select('id', { count: 'exact', head: true });

    const { data: customers } = await supabase
      .from('owners')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'customer');

    return {
      pendingOrders: pending || 0,
      inProgressOrders: inProgress || 0,
      readyForPickup: completed || 0,
      totalBicycles: bicycles || 0,
      totalCustomers: customers || 0
    };
  },

  // Upload reception photo
  async uploadReceptionPhoto(file: File, workOrderId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${workOrderId}-reception-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('work-order-photos')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('work-order-photos')
      .getPublicUrl(fileName);

    return data.publicUrl;
  },

  // Upload work photo
  async uploadWorkPhoto(file: File, workOrderId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${workOrderId}-work-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('work-order-photos')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('work-order-photos')
      .getPublicUrl(fileName);

    return data.publicUrl;
  }
};
