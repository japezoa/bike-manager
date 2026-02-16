export interface MaintenanceRecord {
  id?: string;
  date: string;
  description: string;
  cost?: number;
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
