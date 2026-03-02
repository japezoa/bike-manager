'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bicycle, Owner } from '@/types/bicycle';
import { bicycleService } from '@/lib/bicycleService';
import { ownerService } from '@/lib/ownerService';
import { 
  ArrowLeft, 
  Edit, 
  Calendar, 
  DollarSign, 
  Gauge,
  Settings,
  Disc,
  CircleDot,
  Box,
  Wrench,
  User,
  Bike,
  Mail,
  Phone,
  Hash,
  Users
} from 'lucide-react';
import { formatDate, formatLongDate, formatShortDate } from '@/lib/dateUtils';
import Link from 'next/link';
import { usePermissions } from '@/components/RoleGuard';
import { useAuth } from '@/components/AuthProvider';
import CustomerProfile from '@/components/CustomerProfile';
import UserMenu from '@/components/UserMenu';
import MaintenanceManager from '@/components/MaintenanceManager';
import AuditLogViewer from '@/components/AuditLogViewer';

export default function BikeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { canEditBikes } = usePermissions();
  const { owner: currentUser, role } = useAuth();
  const [bike, setBike] = useState<Bicycle | null>(null);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBike();
  }, [params.id]);

  const loadBike = async () => {
    try {
      setLoading(true);
      const data = await bicycleService.getById(params.id);
      setBike(data);
      
      // Load owner if bike has one
      if (data.ownerId) {
        try {
          const ownerData = await ownerService.getById(data.ownerId);
          setOwner(ownerData);
        } catch (error) {
          console.error('Error loading owner:', error);
        }
      }
    } catch (error) {
      console.error('Error loading bicycle:', error);
      alert('Error al cargar la bicicleta');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-400 font-semibold">Cargando bicicleta...</span>
        </div>
      </div>
    );
  }

  if (!bike) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header persistente */}
      <header className="relative z-50 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md sticky top-0 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Top row: Logo + UserMenu */}
          <div className="flex items-center justify-between mb-4">
            <Link href="/">
              <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-xl shadow-lg shadow-cyan-500/30">
                  <Bike className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-black text-gradient">BIKE MANAGER</h2>
                  <p className="text-zinc-500 text-xs font-semibold">Sistema de Gestión</p>
                </div>
              </div>
            </Link>
            <UserMenu />
          </div>

          {/* Bottom row: Bike info + Actions */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-black text-white tracking-tight">
                  {bike.name}
                </h1>
                <p className="text-zinc-400 mt-1 font-semibold tracking-wide text-sm">
                  {bike.brand ? `${bike.brand} ${bike.model}` : bike.model}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/">
                <button className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold py-2 px-4 rounded-lg transition-all duration-200">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">Volver</span>
                </button>
              </Link>
              {canEditBikes && (
                <button 
                  onClick={() => router.push(`/?edit=${bike.id}`)}
                  className="btn-primary flex items-center gap-2 py-2 px-4 text-sm"
                >
                  <Edit className="w-4 h-4" />
                  <span className="hidden sm:inline">Editar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Image and Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Image */}
            <div className="card">
              <div className="relative h-80 bg-zinc-800 rounded-lg overflow-hidden">
                {bike.imageUrl ? (
                  <img
                    src={bike.imageUrl}
                    alt={bike.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Gauge className="w-24 h-24 text-zinc-700" />
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="card space-y-4">
              <h3 className="text-xl font-display font-bold text-cyan-400">RESUMEN</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                  <span className="text-zinc-400 text-sm">Fecha de compra</span>
                  <span className="font-semibold">
                    {formatShortDate(bike.purchaseDate)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                  <span className="text-zinc-400 text-sm">Precio de compra</span>
                  <span className="font-semibold text-cyan-400">
                    ${bike.purchasePrice.toLocaleString()} CLP
                  </span>
                </div>

                {bike.totalKilometers && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-zinc-400 text-sm">Kilómetros totales</span>
                    <span className="font-semibold text-purple-400">
                      {bike.totalKilometers} km
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Detailed Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Frame & Geometry */}
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <Box className="w-6 h-6 text-cyan-400" />
                <h3 className="text-xl font-display font-bold text-cyan-400">CUADRO Y GEOMETRÍA</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-zinc-500 text-sm font-semibold">Cuadro</span>
                  <p className="text-zinc-200">{bike.frame}</p>
                </div>
                <div>
                  <span className="text-zinc-500 text-sm font-semibold">Tipo</span>
                  <p className="text-zinc-200">{bike.bikeType}</p>
                </div>
                <div>
                  <span className="text-zinc-500 text-sm font-semibold">Horquilla</span>
                  <p className="text-zinc-200">{bike.fork}</p>
                </div>
                <div>
                  <span className="text-zinc-500 text-sm font-semibold">Manubrio</span>
                  <p className="text-zinc-200">{bike.components.handlebar}</p>
                </div>
                <div>
                  <span className="text-zinc-500 text-sm font-semibold">Potencia / Tee</span>
                  <p className="text-zinc-200">{bike.components.stem}</p>
                </div>
                <div>
                  <span className="text-zinc-500 text-sm font-semibold">Tija</span>
                  <p className="text-zinc-200">{bike.components.seatpost}</p>
                </div>
                <div>
                  <span className="text-zinc-500 text-sm font-semibold">Sillín</span>
                  <p className="text-zinc-200">{bike.components.saddle}</p>
                </div>
                {bike.components.pedals && (
                  <div>
                    <span className="text-zinc-500 text-sm font-semibold">Pedales</span>
                    <p className="text-zinc-200">{bike.components.pedals}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Transmission */}
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <Settings className="w-6 h-6 text-cyan-400" />
                <h3 className="text-xl font-display font-bold text-cyan-400">TRANSMISIÓN</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-zinc-500 text-sm font-semibold">Velocidades</span>
                  <p className="text-zinc-200">{bike.transmission.speeds}</p>
                </div>
                <div>
                  <span className="text-zinc-500 text-sm font-semibold">Shifter</span>
                  <p className="text-zinc-200">{bike.transmission.shifter}</p>
                </div>
                <div>
                  <span className="text-zinc-500 text-sm font-semibold">Cadena</span>
                  <p className="text-zinc-200">{bike.transmission.chain}</p>
                </div>
                <div>
                  <span className="text-zinc-500 text-sm font-semibold">Bielas / Plato</span>
                  <p className="text-zinc-200">{bike.transmission.crankset}</p>
                </div>
                <div>
                  <span className="text-zinc-500 text-sm font-semibold">Eje</span>
                  <p className="text-zinc-200">{bike.transmission.bottomBracket}</p>
                </div>
                <div>
                  <span className="text-zinc-500 text-sm font-semibold">Cambio Trasero</span>
                  <p className="text-zinc-200">{bike.transmission.rearDerailleur}</p>
                </div>
                {bike.transmission.frontDerailleur && (
                  <div>
                    <span className="text-zinc-500 text-sm font-semibold">Cambio Delantero</span>
                    <p className="text-zinc-200">{bike.transmission.frontDerailleur}</p>
                  </div>
                )}
                <div>
                  <span className="text-zinc-500 text-sm font-semibold">Piñón / Cassette</span>
                  <p className="text-zinc-200">{bike.transmission.cassette}</p>
                </div>
              </div>
            </div>

            {/* Brakes */}
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <Disc className="w-6 h-6 text-cyan-400" />
                <h3 className="text-xl font-display font-bold text-cyan-400">FRENOS</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-zinc-500 text-sm font-semibold">Tipo</span>
                  <p className="text-zinc-200">{bike.brakes.type}</p>
                </div>
                {bike.brakes.model && (
                  <div>
                    <span className="text-zinc-500 text-sm font-semibold">Modelo</span>
                    <p className="text-zinc-200">{bike.brakes.model}</p>
                  </div>
                )}
                {bike.brakes.rotorSize && (
                  <div>
                    <span className="text-zinc-500 text-sm font-semibold">Tamaño de rotor</span>
                    <p className="text-zinc-200">{bike.brakes.rotorSize}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Wheels */}
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <CircleDot className="w-6 h-6 text-cyan-400" />
                <h3 className="text-xl font-display font-bold text-cyan-400">RUEDAS / NEUMÁTICOS</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-zinc-500 text-sm font-semibold">Tamaño</span>
                  <p className="text-zinc-200">{bike.wheels.wheelSize}</p>
                </div>
                <div>
                  <span className="text-zinc-500 text-sm font-semibold">Neumáticos</span>
                  <p className="text-zinc-200">{bike.wheels.tires}</p>
                </div>
                <div>
                  <span className="text-zinc-500 text-sm font-semibold">Llanta Delantera</span>
                  <p className="text-zinc-200">{bike.wheels.frontRim}</p>
                </div>
                <div>
                  <span className="text-zinc-500 text-sm font-semibold">Maza Delantera</span>
                  <p className="text-zinc-200">{bike.wheels.frontHub}</p>
                </div>
                <div>
                  <span className="text-zinc-500 text-sm font-semibold">Llanta Trasera</span>
                  <p className="text-zinc-200">{bike.wheels.rearRim}</p>
                </div>
                <div>
                  <span className="text-zinc-500 text-sm font-semibold">Maza Trasera</span>
                  <p className="text-zinc-200">{bike.wheels.rearHub}</p>
                </div>
              </div>
            </div>

            {/* Maintenance Management */}
            <MaintenanceManager bicycleId={bike.id!} />

            {/* Owner Information Card - Admin and Mechanic can see, only Admin can edit */}
            {owner && currentUser && currentUser.id !== owner.id && (
              <div className="card">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-br from-orange-500 to-red-600 p-3 rounded-xl">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-orange-400">PROPIETARIO</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-orange-400" />
                      <span className="text-zinc-500 text-sm font-semibold">Nombre Completo</span>
                    </div>
                    {canEditBikes && role === 'admin' ? (
                      <Link href="/owners" className="group">
                        <p className="text-zinc-100 text-lg font-semibold group-hover:text-orange-400 transition-colors">
                          {owner.name}
                        </p>
                      </Link>
                    ) : (
                      <p className="text-zinc-100 text-lg font-semibold">{owner.name}</p>
                    )}
                  </div>

                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Hash className="w-4 h-4 text-orange-400" />
                      <span className="text-zinc-500 text-sm font-semibold">RUT</span>
                    </div>
                    <p className="text-zinc-100 text-lg font-mono font-semibold">{owner.rut}</p>
                  </div>

                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-orange-400" />
                      <span className="text-zinc-500 text-sm font-semibold">Edad</span>
                    </div>
                    <p className="text-zinc-100 text-lg font-semibold">{owner.age} años</p>
                  </div>

                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4 text-orange-400" />
                      <span className="text-zinc-500 text-sm font-semibold">Email</span>
                    </div>
                    <p className="text-zinc-100 text-base font-semibold break-all">{owner.email}</p>
                  </div>

                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="w-4 h-4 text-orange-400" />
                      <span className="text-zinc-500 text-sm font-semibold">Teléfono</span>
                    </div>
                    <p className="text-zinc-100 text-lg font-semibold">{owner.phone}</p>
                  </div>

                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-orange-400" />
                      <span className="text-zinc-500 text-sm font-semibold">Género</span>
                    </div>
                    <p className="text-zinc-100 text-lg font-semibold">
                      {owner.gender === 'male' ? 'Masculino' : owner.gender === 'female' ? 'Femenino' : owner.gender === 'other' ? 'Otro' : 'Prefiero no decir'}
                    </p>
                  </div>
                </div>

                {role === 'admin' && (
                  <div className="mt-6 pt-6 border-t border-zinc-700">
                    <Link href="/owners">
                      <button className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 font-semibold py-3 px-6 rounded-lg transition-all duration-200 border border-orange-500/20 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Ver todos los propietarios
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Audit Log - Admin Only */}
            {role === 'admin' && bike.id && (
              <AuditLogViewer entityType="bicycle" entityId={bike.id} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
