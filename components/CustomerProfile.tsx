'use client';

import { Owner } from '@/types/bicycle';
import { User, Mail, Phone, Hash, Calendar } from 'lucide-react';

interface CustomerProfileProps {
  owner: Owner;
}

export default function CustomerProfile({ owner }: CustomerProfileProps) {
  const getGenderLabel = (gender: string) => {
    const labels = {
      male: 'Masculino',
      female: 'Femenino',
      other: 'Otro',
      prefer_not_to_say: 'Prefiero no decir'
    };
    return labels[gender as keyof typeof labels] || gender;
  };

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-xl">
          <User className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-2xl font-display font-bold text-cyan-400">MIS DATOS</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-cyan-400" />
            <span className="text-zinc-500 text-sm font-semibold">Nombre Completo</span>
          </div>
          <p className="text-zinc-100 text-lg font-semibold">{owner.name}</p>
        </div>

        <div className="bg-zinc-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Hash className="w-4 h-4 text-cyan-400" />
            <span className="text-zinc-500 text-sm font-semibold">RUT</span>
          </div>
          <p className="text-zinc-100 text-lg font-semibold">{owner.rut}</p>
        </div>

        <div className="bg-zinc-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-cyan-400" />
            <span className="text-zinc-500 text-sm font-semibold">Email</span>
          </div>
          <p className="text-zinc-100 text-lg font-semibold break-all">{owner.email}</p>
        </div>

        <div className="bg-zinc-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="w-4 h-4 text-cyan-400" />
            <span className="text-zinc-500 text-sm font-semibold">Teléfono</span>
          </div>
          <p className="text-zinc-100 text-lg font-semibold">{owner.phone}</p>
        </div>

        <div className="bg-zinc-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span className="text-zinc-500 text-sm font-semibold">Edad</span>
          </div>
          <p className="text-zinc-100 text-lg font-semibold">{owner.age} años</p>
        </div>

        <div className="bg-zinc-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-cyan-400" />
            <span className="text-zinc-500 text-sm font-semibold">Género</span>
          </div>
          <p className="text-zinc-100 text-lg font-semibold">{getGenderLabel(owner.gender)}</p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
        <p className="text-cyan-400 text-sm">
          💡 <strong>Nota:</strong> Estos datos no pueden ser modificados. Si necesitas actualizar tu información, contacta al taller.
        </p>
      </div>
    </div>
  );
}
