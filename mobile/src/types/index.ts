export type Role = 'admin' | 'gerant' | 'employe';

export interface AppUser {
  id?: number;
  name: string;
  role: Role;
  pin_hash: string;
  is_active: number;
  last_login?: string;
  failed_attempts: number;
  locked_until?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ActivityLog {
  id?: number;
  user_id?: number;
  user_name?: string;
  action: string;
  entity_type?: string;
  entity_id?: number;
  details?: string;
  created_at?: string;
}

export interface Couple {
  id?: number;
  nest_number: string;
  male_ring?: string;
  female_ring?: string;
  race?: string;
  formation_date?: string;
  status: 'actif' | 'inactif';
  observations?: string;
  synced?: number;
  server_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Egg {
  id?: number;
  couple_id: number;
  couple_nest?: string;
  egg1_date?: string;
  egg2_date?: string;
  hatch_date?: string;
  success1?: number;
  success2?: number;
  observations?: string;
  synced?: number;
  server_id?: number;
  created_at?: string;
}

export interface Pigeonneau {
  id?: number;
  couple_id: number;
  couple_nest?: string;
  egg_record_id?: number;
  birth_date?: string;
  sex?: 'male' | 'femelle' | 'inconnu';
  weight?: number;
  ring_number?: string;
  status: 'vivant' | 'vendu' | 'decede';
  weaning_date?: string;
  sale_price?: number;
  sale_date?: string;
  buyer_name?: string;
  observations?: string;
  synced?: number;
  server_id?: number;
  created_at?: string;
}

export interface HealthRecord {
  id?: number;
  type: 'vaccination' | 'traitement' | 'prevention' | 'suivi';
  target_type?: 'couple' | 'pigeonneau' | 'tous';
  target_id?: number;
  date: string;
  product?: string;
  dose?: string;
  next_due?: string;
  notes?: string;
  synced?: number;
  server_id?: number;
  created_at?: string;
}

export interface Sale {
  id?: number;
  target_type: 'pigeonneau' | 'couple' | 'oeuf' | 'male' | 'femelle';
  target_id?: string;
  date: string;
  quantity: number;
  unit_price: number;
  amount: number;
  buyer_name?: string;
  payment_method: 'especes' | 'cheque' | 'mobile_money' | 'virement' | 'credit' | 'autre';
  notes?: string;
  synced?: number;
  server_id?: number;
  created_at?: string;
}

export interface AppStats {
  totalCouples: number;
  activeCouples: number;
  totalEggs: number;
  totalPigeonneaux: number;
  pigeonneauxVivants: number;
  totalSales: number;
  totalRevenue: number;
  pendingSync: number;
}
