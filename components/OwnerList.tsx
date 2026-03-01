'use client';

import { Owner } from '@/types/bicycle';
import { Edit, Trash2, User, Mail, Phone, Bike } from 'lucide-react';
import { usePermissions } from './RoleGuard';

interface OwnerListProps {
  owners: Owner[];
  bicycleCounts: Map<string, number>;
  onEdit: (owner: Owner) => void;
  onDelete: (id: string) => void;
  onViewBikes: (ownerId: string) => void;
}

export default function OwnerList({ owners, bicycleCounts, onEdit, onDelete, onViewBikes }: OwnerListProps) {
  const { canEditOwners, canDeleteOwners } = usePermissions();
  
  const getGenderLabel = (gender: string): string => {
    const labels: Record<string, string> = {
      male: 'Masculino',
      female: 'Femenino',
      other: 'Otro',
      prefer_not_to_say: 'No especifica'
    };
    return labels[gender] || gender;
  };

  if (owners.length === 0) {
    return (
      <div className="card text-center py-16">
        <p className="text-zinc-400 text-lg mb-4">No hay propietarios registrados</p>
        <p className="text-zinc-500">Haz clic en "NUEVO PROPIETARIO" para agregar el primero</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {owners.map((owner, index) => {
        const bikeCount = bicycleCounts.get(owner.id || '') || 0;
        
        return (
          <div
            key={owner.id}
            className="card group hover:scale-105"
            style={{
              animationDelay: `${index * 0.1}s`,
              animation: 'slideUp 0.5s ease-out backwards'
            }}
          >
            {/* Header with icon */}
            <div className="flex items-start justify-between mb-4">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 p-3 rounded-xl">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-xs font-bold rounded-full border border-purple-500/20">
                  {bikeCount} {bikeCount === 1 ? 'bici' : 'bicis'}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3">
              <div>
                <h3 className="text-xl font-display font-bold text-gradient mb-1">
                  {owner.name}
                </h3>
                <p className="text-zinc-400 text-sm font-mono">{owner.rut}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-xs font-bold rounded-full border border-cyan-500/20">
                  {owner.age} años
                </span>
                <span className="px-3 py-1 bg-orange-500/10 text-orange-400 text-xs font-bold rounded-full border border-orange-500/20">
                  {getGenderLabel(owner.gender)}
                </span>
              </div>

              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Mail className="w-4 h-4 text-cyan-500" />
                  <span className="truncate">{owner.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Phone className="w-4 h-4 text-cyan-500" />
                  <span>{owner.phone}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-zinc-800">
              {bikeCount > 0 && (
                <button
                  onClick={() => owner.id && onViewBikes(owner.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-semibold py-2 px-4 rounded-lg transition-all duration-200 border border-purple-500/20"
                >
                  <Bike className="w-4 h-4" />
                  Ver bicis
                </button>
              )}
              {canEditOwners && (
                <button
                  onClick={() => onEdit(owner)}
                  className={`${bikeCount > 0 ? '' : 'flex-1'} flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold py-2 px-4 rounded-lg transition-all duration-200`}
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              {canDeleteOwners && (
                <button
                  onClick={() => owner.id && onDelete(owner.id)}
                  className="flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 font-semibold py-2 px-4 rounded-lg transition-all duration-200 border border-red-600/20"
                  title={bikeCount > 0 ? 'No se puede eliminar un propietario con bicicletas' : 'Eliminar propietario'}
                  disabled={bikeCount > 0}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
