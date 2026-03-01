'use client';

import { useState } from 'react';
import { Bicycle } from '@/types/bicycle';
import { Edit, Trash2, Calendar, DollarSign, Gauge, GripVertical, Eye } from 'lucide-react';
import { formatDate, formatShortDate } from '@/lib/dateUtils';
import Link from 'next/link';
import { usePermissions } from './RoleGuard';

interface BikeListProps {
  bicycles: Bicycle[];
  onEdit: (bike: Bicycle) => void;
  onDelete: (id: string) => void;
  onReorder: (bikes: Bicycle[]) => void;
}

export default function BikeList({ bicycles, onEdit, onDelete, onReorder }: BikeListProps) {
  const { canEditBikes, canDeleteBikes } = usePermissions();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newBikes = [...bicycles];
    const [draggedBike] = newBikes.splice(draggedIndex, 1);
    newBikes.splice(dropIndex, 0, draggedBike);

    onReorder(newBikes);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const getTotalMaintenanceCost = (bike: Bicycle): number => {
    return bike.maintenanceHistory.reduce((total, maintenance) => {
      return total + (maintenance.cost || 0);
    }, 0);
  };

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
      {bicycles.map((bike, index) => {
        const totalMaintenanceCost = getTotalMaintenanceCost(bike);
        const isDragging = draggedIndex === index;
        const isDragOver = dragOverIndex === index;

        return (
          <div
            key={bike.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`card group hover:scale-105 transition-all duration-300 ${
              isDragging ? 'opacity-50 scale-95' : ''
            } ${isDragOver ? 'ring-2 ring-cyan-500' : ''}`}
            style={{
              animationDelay: `${index * 0.1}s`,
              animation: 'slideUp 0.5s ease-out backwards',
              cursor: 'grab'
            }}
          >
            {/* Drag Handle */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
              <GripVertical className="w-6 h-6 text-cyan-500" />
            </div>

            {/* Image */}
            <Link href={`/bike/${bike.id}`}>
              <div className="relative mb-4 h-48 bg-zinc-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-cyan-500 transition-all">
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
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                  <Eye className="w-12 h-12 text-cyan-400" />
                </div>
              </div>
            </Link>

            {/* Content */}
            <div className="space-y-3">
              <div>
                <Link href={`/bike/${bike.id}`}>
                  <h3 className="text-2xl font-display font-bold text-gradient mb-1 hover:text-cyan-300 transition-colors cursor-pointer">
                    {bike.name}
                  </h3>
                </Link>
                <p className="text-zinc-400 font-semibold">
                  {bike.brand ? `${bike.brand} ${bike.model}` : bike.model}
                </p>
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
                    {formatDate(bike.purchaseDate)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <DollarSign className="w-4 h-4 text-cyan-500" />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span>${bike.purchasePrice.toLocaleString()} CLP</span>
                      <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-xs rounded">
                        {bike.purchaseCondition === 'new' ? 'Nueva' : 'Usada'}
                      </span>
                    </div>
                    {totalMaintenanceCost > 0 && (
                      <span className="text-xs text-orange-400 mt-1">
                        + ${totalMaintenanceCost.toLocaleString()} en mantenciones
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {bike.maintenanceHistory.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs text-zinc-500 font-semibold">
                    Último mantenimiento: {formatShortDate(bike.maintenanceHistory[0].date)}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-zinc-800">
              <Link href={`/bike/${bike.id}`} className={canEditBikes ? "flex-1" : "w-full"}>
                <button className="w-full flex items-center justify-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-semibold py-2 px-4 rounded-lg transition-all duration-200 border border-cyan-500/20">
                  <Eye className="w-4 h-4" />
                  Ver
                </button>
              </Link>
              {canEditBikes && (
                <button
                  onClick={() => onEdit(bike)}
                  className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold py-2 px-4 rounded-lg transition-all duration-200"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              {canDeleteBikes && (
                <button
                  onClick={() => bike.id && onDelete(bike.id)}
                  className="flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 font-semibold py-2 px-4 rounded-lg transition-all duration-200 border border-red-600/20"
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
