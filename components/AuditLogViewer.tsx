'use client';

import { useState, useEffect } from 'react';
import { auditLogService, AuditLog } from '@/lib/auditLogService';
import { formatShortDate } from '@/lib/dateUtils';
import { FileText, User, Clock } from 'lucide-react';

interface AuditLogViewerProps {
  entityType: 'bicycle' | 'owner' | 'maintenance' | 'work_order';
  entityId: string;
}

export default function AuditLogViewer({ entityType, entityId }: AuditLogViewerProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, [entityType, entityId]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await auditLogService.getByEntity(entityType, entityId);
      setLogs(data);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'update': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      case 'delete': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'mechanic': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'customer': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-display font-bold text-purple-400">BITÁCORA DE CAMBIOS</h3>
        </div>
        <div className="text-center py-8">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-display font-bold text-purple-400">BITÁCORA DE CAMBIOS</h3>
        </div>
        <p className="text-zinc-500 text-center py-8">No hay cambios registrados</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-purple-400" />
        <h3 className="text-xl font-display font-bold text-purple-400">BITÁCORA DE CAMBIOS</h3>
      </div>

      <div className="space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getActionColor(log.action)}`}>
                  {auditLogService.getActionLabel(log.action)}
                </span>
                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getRoleBadgeColor(log.user_role)}`}>
                  {log.user_role.toUpperCase()}
                </span>
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <Clock className="w-4 h-4" />
                  {formatShortDate(log.created_at)}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-zinc-500" />
                <span className="text-zinc-300 font-semibold">{log.user_name || log.user_email}</span>
              </div>

              {log.description && (
                <p className="text-zinc-400 text-sm">{log.description}</p>
              )}

              {log.changes && Object.keys(log.changes).length > 0 && (
                <div className="mt-3 pt-3 border-t border-zinc-700">
                  <p className="text-xs text-zinc-500 font-semibold mb-2">Cambios:</p>
                  <div className="space-y-1">
                    {auditLogService.formatChanges(log.changes).split(', ').map((change, idx) => (
                      <div key={idx} className="text-xs text-zinc-400 font-mono bg-zinc-900/50 px-2 py-1 rounded">
                        {change}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
