import { supabase } from './supabase';

export interface AuditLog {
  id: string;
  created_at: string;
  user_email: string;
  user_name: string;
  user_role: 'admin' | 'mechanic' | 'customer';
  action: 'create' | 'update' | 'delete';
  entity_type: 'bicycle' | 'owner' | 'maintenance' | 'work_order';
  entity_id: string;
  description: string;
  changes: any;
}

export const auditLogService = {
  // Get all logs (admin only)
  async getAll(limit: number = 100): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs_readable')
      .select('*')
      .limit(limit)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get logs by entity
  async getByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs_readable')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get logs by user
  async getByUser(userEmail: string): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs_readable')
      .select('*')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get logs by action
  async getByAction(action: 'create' | 'update' | 'delete'): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs_readable')
      .select('*')
      .eq('action', action)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get recent logs
  async getRecent(hours: number = 24): Promise<AuditLog[]> {
    const since = new Date();
    since.setHours(since.getHours() - hours);

    const { data, error } = await supabase
      .from('audit_logs_readable')
      .select('*')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get logs with filters
  async getFiltered(filters: {
    action?: string;
    entityType?: string;
    userRole?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AuditLog[]> {
    let query = supabase
      .from('audit_logs_readable')
      .select('*');

    if (filters.action) {
      query = query.eq('action', filters.action);
    }

    if (filters.entityType) {
      query = query.eq('entity_type', filters.entityType);
    }

    if (filters.userRole) {
      query = query.eq('user_role', filters.userRole);
    }

    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  // Format change description
  formatChanges(changes: any): string {
    if (!changes) return '';

    const formatted: string[] = [];

    Object.keys(changes).forEach(key => {
      const change = changes[key];
      if (change.old !== undefined && change.new !== undefined) {
        formatted.push(`${key}: "${change.old}" → "${change.new}"`);
      }
    });

    return formatted.join(', ');
  },

  // Get action label
  getActionLabel(action: string): string {
    const labels = {
      create: 'Creó',
      update: 'Modificó',
      delete: 'Eliminó'
    };
    return labels[action as keyof typeof labels] || action;
  },

  // Get entity label
  getEntityLabel(entityType: string): string {
    const labels = {
      bicycle: 'Bicicleta',
      owner: 'Propietario',
      maintenance: 'Mantención',
      work_order: 'Orden de Trabajo'
    };
    return labels[entityType as keyof typeof labels] || entityType;
  }
};
