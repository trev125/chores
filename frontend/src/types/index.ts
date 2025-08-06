export interface Person {
  id: number;
  name: string;
  points: number;
  bonus_points: number;
  last_reset: string;
  last_daily_chores_added: string;
  avatar: string;
  color: string;
  order_index: number;
  pin?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Chore {
  id: number;
  title: string;
  assigned_to_id?: number;
  assigned_to?: string;
  points: number;
  completed: boolean;
  date_completed?: string;
  is_daily: boolean;
  due_date?: string;
  deleted: boolean;
  created_at: string;
  updated_at: string;
  person_name?: string;
}

export interface Reward {
  id: number;
  title: string;
  points_required: number;
  assigned_to_id?: number;
  assigned_to?: string;
  completed: boolean;
  date_completed?: string;
  created_at: string;
  updated_at: string;
  person_name?: string;
}

export interface ActivityLog {
  id: number;
  date: string;
  type: string;
  description: string;
  user_name?: string;
  created_at: string;
}

export interface AppSettings {
  [key: string]: string;
}

export interface AuthUser {
  id: number;
  name: string;
  is_admin: boolean;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: AuthUser;
  error?: string;
}

// API Request types
export interface CreateChoreRequest {
  title: string;
  assigned_to_id?: number;
  assigned_to?: string;
  points?: number;
  is_daily?: boolean;
  due_date?: string;
}

export interface CreatePersonRequest {
  name: string;
  avatar?: string;
  color?: string;
  pin?: string;
  is_admin?: boolean;
}

export interface CreateRewardRequest {
  title: string;
  points_required: number;
  assigned_to_id?: number;
  assigned_to?: string;
}
