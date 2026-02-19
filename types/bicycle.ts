export interface MaintenanceRecord {
  id?: string;
  date: string;
  description: string;
  cost?: number;
  kilometersAtMaintenance?: number;
  nextMaintenanceKilometers?: number;
}

export interface Owner {
  id?: string;
  rut: string; // Chilean RUT (unique identifier)
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  email: string;
  phone: string;
  created_at?: string;
  updated_at?: string;
}

export interface PurchaseProof {
  id?: string;
  receiptNumber?: string; // Número de boleta
  barcode?: string; // Código de barras
  receiptImageUrl?: string; // Foto de la boleta
  purchaseMethod?: 'store' | 'online' | 'used_marketplace' | 'private' | 'other'; // Medio de compra
  sellerInfo?: string; // Información del vendedor (si es usada)
  evidenceImageUrls: string[]; // Múltiples fotos de evidencia
}

export interface Transmission {
  speeds: string;
  shifter: string;
  chain: string;
  crankset: string;
  bottomBracket: string;
  rearDerailleur: string;
  frontDerailleur?: string;
  cassette: string;
}

export interface Brakes {
  type: string;
  rotorSize?: string;
  model?: string;
}

export interface Wheels {
  frontRim: string;
  frontHub: string;
  rearRim: string;
  rearHub: string;
  tires: string;
  wheelSize: string;
}

export interface Components {
  handlebar: string;
  stem: string;
  seatpost: string;
  saddle: string;
  pedals?: string;
}

export interface Bicycle {
  id?: string;
  name: string;
  model: string;
  frame: string;
  geometry: string;
  fork: string;
  transmission: Transmission;
  brakes: Brakes;
  wheels: Wheels;
  components: Components;
  maintenanceHistory: MaintenanceRecord[];
  purchaseDate: string;
  purchasePrice: number;
  purchaseCondition: 'new' | 'used';
  imageUrl?: string;
  totalKilometers?: number;
  displayOrder?: number;
  
  // Owner information
  ownerId?: string; // Foreign key to Owner
  owner?: Owner; // Populated owner data
  
  // Anti-theft / Identification
  serialNumber?: string; // Número de serie del cuadro
  purchaseProof?: PurchaseProof;
  identificationPhotos: string[]; // Fotos para identificación (ángulos específicos, detalles únicos)
  
  created_at?: string;
  updated_at?: string;
}

export interface ComparisonResult {
  component: string;
  bikes: {
    name: string;
    value: string;
  }[];
}
