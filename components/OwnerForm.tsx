'use client';

import { useState, useEffect } from 'react';
import { Owner } from '@/types/bicycle';
import { ownerService } from '@/lib/ownerService';
import { Save, X } from 'lucide-react';

interface OwnerFormProps {
  owner: Owner | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function OwnerForm({ owner, onSave, onCancel }: OwnerFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<Owner, 'id' | 'created_at' | 'updated_at'>>({
    rut: '',
    name: '',
    age: 18,
    gender: 'prefer_not_to_say',
    email: '',
    phone: '',
    role: 'customer',
  });

  useEffect(() => {
    if (owner) {
      setFormData(owner);
    }
  }, [owner]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatRut = (value: string) => {
    // Remove all non-numeric characters except K/k
    const cleaned = value.replace(/[^0-9kK]/g, '');
    
    if (cleaned.length <= 1) return cleaned;
    
    // Separate body and verifier
    const body = cleaned.slice(0, -1);
    const verifier = cleaned.slice(-1);
    
    // Format body with dots
    const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    return `${formattedBody}-${verifier}`;
  };

  const handleRutChange = (value: string) => {
    const formatted = formatRut(value);
    handleInputChange('rut', formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (owner?.id) {
        await ownerService.update(owner.id, formData);
      } else {
        // Check if RUT already exists
        const existing = await ownerService.getByRut(formData.rut);
        if (existing) {
          alert('Ya existe un propietario con este RUT');
          setLoading(false);
          return;
        }
        await ownerService.create(formData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving owner:', error);
      alert('Error al guardar el propietario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-display font-bold text-gradient">
          {owner ? 'EDITAR PROPIETARIO' : 'NUEVO PROPIETARIO'}
        </h2>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary flex items-center gap-2"
          >
            <X className="w-5 h-5" />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-display font-bold text-cyan-400 mb-4">INFORMACIÓN PERSONAL</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">RUT *</label>
            <input
              type="text"
              required
              value={formData.rut}
              onChange={(e) => handleRutChange(e.target.value)}
              className="input-field"
              placeholder="12.345.678-9"
              disabled={!!owner} // RUT cannot be changed after creation
            />
            {owner && (
              <p className="text-xs text-zinc-500 mt-1">El RUT no puede ser modificado</p>
            )}
          </div>

          <div>
            <label className="label">Nombre Completo *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="input-field"
              placeholder="Juan Pérez González"
            />
          </div>

          <div>
            <label className="label">Edad *</label>
            <input
              type="number"
              required
              min="0"
              max="150"
              value={formData.age}
              onChange={(e) => handleInputChange('age', Number(e.target.value))}
              className="input-field"
              placeholder="35"
            />
          </div>

          <div>
            <label className="label">Sexo *</label>
            <select
              value={formData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              className="input-field"
            >
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
              <option value="other">Otro</option>
              <option value="prefer_not_to_say">Prefiero no decir</option>
            </select>
          </div>

          <div>
            <label className="label">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="input-field"
              placeholder="juan@example.com"
            />
          </div>

          <div>
            <label className="label">Teléfono *</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="input-field"
              placeholder="+56912345678"
            />
          </div>

          <div>
            <label className="label">Rol *</label>
            <select
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className="input-field"
            >
              <option value="customer">Cliente</option>
              <option value="mechanic">Mecánico</option>
              <option value="admin">Administrador</option>
            </select>
            <p className="text-xs text-zinc-500 mt-1">
              Cliente: Solo ve sus bicis | Mecánico: Ve todo, edita OT | Admin: Control total
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
