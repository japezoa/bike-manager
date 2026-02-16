'use client';

import { useState } from 'react';
import { Bicycle } from '@/types/bicycle';
import { Check } from 'lucide-react';

interface BikeComparisonProps {
  bicycles: Bicycle[];
}

export default function BikeComparison({ bicycles }: BikeComparisonProps) {
  const [selectedBikes, setSelectedBikes] = useState<string[]>([]);

  const toggleBike = (id: string) => {
    setSelectedBikes(prev =>
      prev.includes(id)
        ? prev.filter(b => b !== id)
        : prev.length < 3
        ? [...prev, id]
        : prev
    );
  };

  const bikesToCompare = selectedBikes
    .map(id => bicycles.find(b => b.id === id))
    .filter(Boolean) as Bicycle[];

  const comparisonData = [
    {
      category: 'Información Básica',
      rows: [
        { label: 'Modelo', getValue: (b: Bicycle) => b.model },
        { label: 'Cuadro', getValue: (b: Bicycle) => b.frame },
        { label: 'Geometría', getValue: (b: Bicycle) => b.geometry },
        { label: 'Horquilla', getValue: (b: Bicycle) => b.fork },
      ],
    },
    {
      category: 'Transmisión',
      rows: [
        { label: 'Velocidades', getValue: (b: Bicycle) => b.transmission.speeds },
        { label: 'Shifter', getValue: (b: Bicycle) => b.transmission.shifter },
        { label: 'Cadena', getValue: (b: Bicycle) => b.transmission.chain },
        { label: 'Bielas / Plato', getValue: (b: Bicycle) => b.transmission.crankset },
        { label: 'Cambio Trasero', getValue: (b: Bicycle) => b.transmission.rearDerailleur },
        { label: 'Cambio Delantero', getValue: (b: Bicycle) => b.transmission.frontDerailleur || 'N/A' },
        { label: 'Piñón / Cassette', getValue: (b: Bicycle) => b.transmission.cassette },
      ],
    },
    {
      category: 'Frenos',
      rows: [
        { label: 'Tipo', getValue: (b: Bicycle) => b.brakes.type },
        { label: 'Modelo', getValue: (b: Bicycle) => b.brakes.model || 'N/A' },
        { label: 'Tamaño de rotor', getValue: (b: Bicycle) => b.brakes.rotorSize || 'N/A' },
      ],
    },
    {
      category: 'Ruedas',
      rows: [
        { label: 'Tamaño', getValue: (b: Bicycle) => b.wheels.wheelSize },
        { label: 'Neumáticos', getValue: (b: Bicycle) => b.wheels.tires },
        { label: 'Llanta Delantera', getValue: (b: Bicycle) => b.wheels.frontRim },
        { label: 'Maza Delantera', getValue: (b: Bicycle) => b.wheels.frontHub },
        { label: 'Llanta Trasera', getValue: (b: Bicycle) => b.wheels.rearRim },
        { label: 'Maza Trasera', getValue: (b: Bicycle) => b.wheels.rearHub },
      ],
    },
    {
      category: 'Componentes',
      rows: [
        { label: 'Manubrio', getValue: (b: Bicycle) => b.components.handlebar },
        { label: 'Potencia', getValue: (b: Bicycle) => b.components.stem },
        { label: 'Tija', getValue: (b: Bicycle) => b.components.seatpost },
        { label: 'Sillín', getValue: (b: Bicycle) => b.components.saddle },
        { label: 'Pedales', getValue: (b: Bicycle) => b.components.pedals || 'N/A' },
      ],
    },
    {
      category: 'Datos de Compra',
      rows: [
        { label: 'Precio', getValue: (b: Bicycle) => `$${b.purchasePrice.toLocaleString()} CLP` },
        { label: 'Condición', getValue: (b: Bicycle) => b.purchaseCondition === 'new' ? 'Nueva' : 'Usada' },
        { label: 'Kilómetros', getValue: (b: Bicycle) => b.totalKilometers ? `${b.totalKilometers} km` : 'N/A' },
        { label: 'Mantenciones', getValue: (b: Bicycle) => b.maintenanceHistory.length.toString() },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Bike Selection */}
      <div className="card">
        <h3 className="text-xl font-display font-bold text-cyan-400 mb-4">
          SELECCIONA BICICLETAS (máximo 3)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {bicycles.map(bike => (
            <button
              key={bike.id}
              onClick={() => bike.id && toggleBike(bike.id)}
              className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
                selectedBikes.includes(bike.id || '')
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
              }`}
            >
              {selectedBikes.includes(bike.id || '') && (
                <div className="absolute top-2 right-2 bg-cyan-500 rounded-full p-1">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
              <div className="text-left">
                <h4 className="font-display font-bold text-lg mb-1">{bike.name}</h4>
                <p className="text-sm text-zinc-400">{bike.model}</p>
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-xs font-bold rounded">
                    {bike.wheels.wheelSize}
                  </span>
                  <span className="px-2 py-1 bg-orange-500/10 text-orange-400 text-xs font-bold rounded">
                    {bike.transmission.speeds}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      {bikesToCompare.length > 0 ? (
        <div className="card overflow-x-auto">
          <h3 className="text-2xl font-display font-bold text-gradient mb-6">
            COMPARACIÓN DE COMPONENTES
          </h3>

          {comparisonData.map((section, sectionIdx) => (
            <div key={sectionIdx} className="mb-8 last:mb-0">
              <h4 className="text-lg font-display font-bold text-orange-400 mb-4 uppercase tracking-wide">
                {section.category}
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-700">
                      <th className="text-left py-3 px-4 text-zinc-400 font-semibold text-sm">
                        Componente
                      </th>
                      {bikesToCompare.map(bike => (
                        <th
                          key={bike.id}
                          className="text-left py-3 px-4 font-display font-bold text-cyan-400"
                        >
                          {bike.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.rows.map((row, rowIdx) => (
                      <tr
                        key={rowIdx}
                        className="border-b border-zinc-800 hover:bg-zinc-800/30 transition-colors"
                      >
                        <td className="py-3 px-4 text-zinc-300 font-semibold text-sm">
                          {row.label}
                        </td>
                        {bikesToCompare.map(bike => {
                          const value = row.getValue(bike);
                          const allValues = bikesToCompare.map(b => row.getValue(b));
                          const isDifferent = allValues.some(v => v !== value);
                          
                          return (
                            <td
                              key={bike.id}
                              className={`py-3 px-4 ${
                                isDifferent
                                  ? 'text-cyan-300 font-semibold'
                                  : 'text-zinc-400'
                              }`}
                            >
                              {value}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* Images */}
          <div className="mt-8 pt-8 border-t border-zinc-800">
            <h4 className="text-lg font-display font-bold text-orange-400 mb-4 uppercase tracking-wide">
              Imágenes
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {bikesToCompare.map(bike => (
                <div key={bike.id} className="space-y-2">
                  <p className="font-display font-bold text-cyan-400">{bike.name}</p>
                  <div className="h-48 bg-zinc-800 rounded-lg overflow-hidden">
                    {bike.imageUrl ? (
                      <img
                        src={bike.imageUrl}
                        alt={bike.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        Sin imagen
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="card text-center py-16">
          <p className="text-zinc-400 text-lg">
            Selecciona al menos una bicicleta para comenzar la comparación
          </p>
        </div>
      )}
    </div>
  );
}
