'use client';

import { Bicycle } from '@/types/bicycle';
import { Edit, Trash2, Calendar, DollarSign, Gauge } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface BikeListProps {
  bicycles: Bicycle[];
  onEdit: (bike: Bicycle) => void;
  onDelete: (id: string) => void;
}

export default function BikeList({ bicycles, onEdit, onDelete }: BikeListProps) {
  if (bicycles.length === 0) {
    return (
      <div className="card text-center py-16">
        <p className="text-zinc-400 text-lg mb-4">No hay bicicletas registradas</p>
        <p className="text-zinc-500">Haz clic en "NUEVA BICI" para agregar tu primera bicicleta</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {bicycles.map((bike, index) => (
        <div
          key={bike.id}
          className="card group hover:scale-105"
          style={{
            animationDelay: `${index * 0.1}s`,
            animation: 'slideUp 0.5s ease-out backwards'
          }}
        >
          {/* Image */}
          <div className="relative mb-4 h-48 bg-zinc-800 rounded-lg overflow-hidden">
            {bike.imageUrl ? (
              <img
                src={bike.imageUrl}
                alt={bike.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Gauge className="w-16 h-16 text-zinc-700" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-60" />
          </div>

          {/* Content */}
          <div className="space-y-3">
            <div>
              <h3 className="text-2xl font-display font-bold text-gradient mb-1">
                {bike.name}
              </h3>
              <p className="text-zinc-400 font-semibold">{bike.model}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-xs font-bold rounded-full border border-cyan-500/20">
                {bike.wheels.wheelSize}
              </span>
              <span className="px-3 py-1 bg-orange-500/10 text-orange-400 text-xs font-bold rounded-full border border-orange-500/20">
                {bike.transmission.speeds}
              </span>
              {bike.totalKilometers && (
                <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-xs font-bold rounded-full border border-purple-500/20">
                  {bike.totalKilometers} km
                </span>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Calendar className="w-4 h-4 text-cyan-500" />
                <span>
                  {format(new Date(bike.purchaseDate), 'dd MMM yyyy', { locale: es })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <DollarSign className="w-4 h-4 text-cyan-500" />
                <span>${bike.purchasePrice.toLocaleString()} CLP</span>
                <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-xs rounded">
                  {bike.purchaseCondition === 'new' ? 'Nueva' : 'Usada'}
                </span>
              </div>
            </div>

            {bike.maintenanceHistory.length > 0 && (
              <div className="pt-2">
                <p className="text-xs text-zinc-500 font-semibold">
                  Último mantenimiento: {format(new Date(bike.maintenanceHistory[0].date), 'dd/MM/yyyy')}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-zinc-800">
            <button
              onClick={() => onEdit(bike)}
              className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold py-2 px-4 rounded-lg transition-all duration-200"
            >
              <Edit className="w-4 h-4" />
              Editar
            </button>
            <button
              onClick={() => bike.id && onDelete(bike.id)}
              className="flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 font-semibold py-2 px-4 rounded-lg transition-all duration-200 border border-red-600/20"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
