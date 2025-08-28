export interface User {
  id: number;
  username: string;
  password: string;
  role: 'admin' | 'user';
  email: string;
  // Propriétés supplémentaires utilisées dans les composants
  full_name?: string;
  created_at?: string;
}

export interface Couple {
  id: number;
  name: string;           // Nom du couple
  breed: string;          // Race
  date_formation?: string; // Date de formation
  male: string;           // Nom du mâle
  female: string;         // Nom de la femelle
  status: 'actif' | 'inactif' | 'reproduction';
  color?: string;         // Couleur (optionnel)
  notes?: string;         // Observations
  user_id: number;        // ID de l'utilisateur propriétaire
  created_at: string;
  updated_at: string;
}

export interface Egg {
  id: number;
  coupleId: number;
  egg1Date: string;
  egg2Date: string;
  hatchDate1?: string;
  hatchDate2?: string;
  success1: boolean;
  success2: boolean;
  observations: string;
  userId: number;
  createdAt: string;
}

export interface Pigeonneau {
  id: number;
  coupleId: number;
  eggRecordId: number;
  birthDate: string;
  sex: 'male' | 'female' | 'unknown';
  status: 'alive' | 'sold' | 'dead';
  salePrice?: number;
  saleDate?: string;
  buyer?: string;
  observations: string;
  race?: string; // Joint avec couples
  userId: number;
  createdAt: string;
}

export interface HealthRecord {
  id: number;
  type: 'vaccination' | 'treatment' | 'prevention' | 'checkup';
  product: string;
  targetType: 'couple' | 'pigeonneau';
  targetId: number;
  date: string;
  nextDue?: string;
  observations: string;
  coupleNest?: number; // Joint avec couples
  pigeonneauId?: number; // Joint avec pigeonneaux
  userId: number;
  createdAt: string;
}

export interface ActionLog {
  id: number;
  date: string;
  user: string;
  action: string;
  entity: string;
  details?: string;
  // Propriétés supplémentaires utilisées dans les composants
  timestamp?: string;
  entityId?: number;
  username?: string;
  userId?: number;
}

export interface AppData {
  couples: Couple[];
  eggs: Egg[];
  pigeonneaux: Pigeonneau[];
  healthRecords: HealthRecord[];
  users: User[];
  actionLogs?: ActionLog[];
}

// Types pour les statistiques
export interface Statistics {
  totalCouples: number;
  activeCouples: number;
  totalEggs: number;
  hatchedEggs: number;
  totalPigeonneaux: number;
  alivePigeonneaux: number;
  soldPigeonneaux: number;
  totalSales: number;
  monthlyStats: MonthlyStat[];
  // Propriétés supplémentaires utilisées dans les composants
  eggsLaid?: number;
  babiesBorn?: number;
  healthInterventions?: number;
  hatchingRate?: number;
  totalRevenue?: number;
  deadPigeonneaux?: number;
}

export interface MonthlyStat {
  month: string;
  couples: number;
  eggs: number;
  pigeonneaux: number;
  sales: number;
}

// Types pour les notifications supprimés

// Types pour les ventes
export interface Sale {
  id: number;
  pigeonneauId: number;
  price: number;
  date: string;
  buyer: string;
  notes?: string;
  // Propriétés supplémentaires utilisées dans les composants
  amount?: number;
  quantity?: number;
  unit_price?: number;
  client?: string;
  description?: string;
}

// Types pour les erreurs API
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Types pour les formulaires
export interface LoginForm {
  username: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordForm {
  email: string;
}

export interface ResetPasswordForm {
  email: string;
  code: string;
  newPassword: string;
}

// Types pour les réponses API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}