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
}

export interface CreateRewardRequest {
  title: string;
  points_required: number;
  assigned_to_id?: number;
  assigned_to?: string;
}

export interface UpdateRewardRequest {
  title?: string;
  points_required?: number;
  assigned_to_id?: number;
  assigned_to?: string;
  completed?: boolean;
}
