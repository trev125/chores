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

export interface CreatePersonRequest {
  name: string;
  avatar?: string;
  color?: string;
  pin?: string;
  is_admin?: boolean;
}

export interface UpdatePersonRequest {
  name?: string;
  avatar?: string;
  color?: string;
  pin?: string;
  is_admin?: boolean;
  points?: number;
  order_index?: number;
}
