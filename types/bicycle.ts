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
  rut: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  email: string;
  phone: string;
  
  // Auth integration
  user_id?: string; // Supabase Auth user ID
  role: 'admin' | 'mechanic' | 'customer';
  
  created_at?: string;
  updated_at?: string;
}

export interface WorkItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category: 'labor' | 'part' | 'adjustment';
}

export interface WorkOrder {
  id?: string;
  workOrderNumber: string;
  bicycleId: string;
  bicycle?: Bicycle;
  
  // Fechas
  entryDate: string;
  estimatedDeliveryDate: string;
  actualDeliveryDate?: string;
  
  // Estado
  status: 'pending' | 'in_progress' | 'waiting_parts' | 'completed' | 'delivered' | 'cancelled';
  
  // Descripción para cliente
  description: string;
  
  // Items de trabajo
  items: WorkItem[];
  
  // Totales
  subtotal: number;
  iva: number;
  total: number;
  
  // Notas internas (solo taller)
  internalNotes?: string;
  
  // Responsable
  assignedToId?: string;
  assignedTo?: Owner;
  
  // Fotos
  receptionPhotos: string[];
  workPhotos: string[];
  
  // Prioridad
  priority: 'normal' | 'urgent';
  
  created_at?: string;
  updated_at?: string;
}

export interface PurchaseProof {
  id?: string;
  receiptNumber?: string;
  barcode?: string;
  receiptImageUrl?: string;
  purchaseMethod?: 'store' | 'online' | 'used_marketplace' | 'private' | 'other';
  sellerInfo?: string;
  evidenceImageUrls: string[];
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
  brand: string; // Nueva: Marca de la bici
  model: string;
  bikeType: 'MTB' | 'Gravel' | 'Ruta'; // Nueva: Tipo de bici
  status: 'in_use' | 'sold' | 'stolen'; // Nueva: Estado de la bici
  frame: string;
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
  ownerId?: string;
  owner?: Owner;
  
  // Anti-theft / Identification
  serialNumber?: string;
  purchaseProof?: PurchaseProof;
  identificationPhotos?: string[];
  
  // Workshop info
  currentStatus: 'with_owner' | 'in_workshop' | 'ready_for_pickup';
  physicalLocation?: string;
  receptionNotes?: string;
  
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

export interface WorkshopStats {
  pendingOrders: number;
  inProgressOrders: number;
  readyForPickup: number;
  totalBicycles: number;
  totalCustomers: number;
}

export interface Notification {
  id?: string;
  userId: string;
  workOrderId: string;
  type: 'order_ready' | 'order_created' | 'status_changed';
  message: string;
  read: boolean;
  created_at?: string;
}
