export interface Reward {
  id: number;
  title: string;
  points_required: number;
  assigned_to_id?: number;
  assigned_to?: string;
  completed: boolean;
  date_completed?: string;
  redeemed_by_id?: number;
  redeemed_at?: string;
  fulfilled: boolean;
  fulfilled_at?: string;
  is_one_time: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateRewardRequest {
  title: string;
  points_required: number;
  assigned_to_id?: number;
  assigned_to?: string;
  is_one_time?: boolean;
}

export interface UpdateRewardRequest {
  title?: string;
  points_required?: number;
  assigned_to_id?: number;
  assigned_to?: string;
  completed?: boolean;
  fulfilled?: boolean;
  is_one_time?: boolean;
}
