'use client';

import { useState, useEffect } from 'react';
import { Bicycle, Owner } from '@/types/bicycle';
import { bicycleService } from '@/lib/bicycleService';
import { ownerService } from '@/lib/ownerService';
import { Save, X, Upload, User } from 'lucide-react';
import Link from 'next/link';
import { usePermissions } from './RoleGuard';

interface BikeFormProps {
  bicycle: Bicycle | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function BikeForm({ bicycle, onSave, onCancel }: BikeFormProps) {
  const { canAssignOwners } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [owners, setOwners] = useState<Owner[]>([]);

  const [formData, setFormData] = useState<Omit<Bicycle, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    brand: '',
    model: '',
    bikeType: 'MTB',
    status: 'in_use',
    frame: '',
    fork: '',
    transmission: {
      speeds: '',
      shifter: '',
      chain: '',
      crankset: '',
      bottomBracket: '',
      rearDerailleur: '',
      frontDerailleur: '',
      cassette: '',
    },
    brakes: {
      type: '',
      rotorSize: '',
      model: '',
    },
    wheels: {
      frontRim: '',
      frontHub: '',
      rearRim: '',
      rearHub: '',
      tires: '',
      wheelSize: '',
    },
    components: {
      handlebar: '',
      stem: '',
      seatpost: '',
      saddle: '',
      pedals: '',
    },
    purchaseDate: new Date().toISOString().split('T')[0],
    purchasePrice: 0,
    totalKilometers: 0,
    currentStatus: 'with_owner',
    ownerId: undefined,
    imageUrl: undefined,
  });

  useEffect(() => {
    loadOwners();
  }, []);

  useEffect(() => {
    if (bicycle) {
      setFormData(bicycle);
      if (bicycle.imageUrl) {
        setImagePreview(bicycle.imageUrl);
      }
    }
  }, [bicycle]);

  const loadOwners = async () => {
    try {
      const data = await ownerService.getAll();
      const customersOnly = data.filter(owner => owner.role === 'customer');
      setOwners(customersOnly);
    } catch (error) {
      console.error('Error loading owners:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof typeof prev] as any),
        [field]: value,
      },
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = formData.imageUrl;

      if (bicycle?.id) {
        if (imageFile) {
          if (bicycle.imageUrl) {
            await bicycleService.deleteImage(bicycle.imageUrl);
          }
          imageUrl = await bicycleService.uploadImage(imageFile, bicycle.id);
        }
        await bicycleService.update(bicycle.id, { ...formData, imageUrl });
      } else {
        const newBike = await bicycleService.create(formData);
        if (imageFile && newBike.id) {
          imageUrl = await bicycleService.uploadImage(imageFile, newBike.id);
          await bicycleService.update(newBike.id, { imageUrl });
        }
      }

      onSave();
    } catch (error) {
      console.error('Error saving bicycle:', error);
      alert('Error al guardar la bicicleta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-display font-bold text-gradient">
          {bicycle ? 'EDITAR BICICLETA' : 'NUEVA BICICLETA'}
        </h2>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="btn-secondary flex items-center gap-2">
            <X className="w-5 h-5" />
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            <Save className="w-5 h-5" />
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-display font-bold text-cyan-400 mb-4">FOTO</h3>
        <div className="flex flex-col items-center gap-4">
          {imagePreview && (
            <div className="w-full h-64 rounded-lg overflow-hidden bg-zinc-800">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
          <label className="w-full cursor-pointer">
            <div className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold py-3 px-6 rounded-lg transition-all duration-200 border border-zinc-700">
              <Upload className="w-5 h-5" />
              Seleccionar imagen
            </div>
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
        </div>
      </div>

      {canAssignOwners && (
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-6 h-6 text-orange-500" />
            <h3 className="text-xl font-display font-bold text-orange-400">PROPIETARIO</h3>
          </div>

          <label className="label">Seleccionar Propietario</label>
          <select
            value={formData.ownerId || ''}
            onChange={(e) => handleInputChange('ownerId', e.target.value || undefined)}
            className="input-field"
          >
            <option value="">Sin propietario asignado</option>
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name} - {owner.rut}
              </option>
            ))}
          </select>

          {owners.length === 0 && (
            <p className="text-sm text-zinc-500 mt-2">
              No hay propietarios registrados.
              <Link href="/owners" target="_blank" className="text-orange-400 hover:text-orange-300 ml-1">
                Crear uno aquí
              </Link>
            </p>
          )}
        </div>
      )}
    </form>
  );
}