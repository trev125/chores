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
}

export interface CreateChoreRequest {
  title: string;
  assigned_to_id?: number;
  assigned_to?: string;
  points?: number;
  is_daily?: boolean;
  due_date?: string;
}

export interface UpdateChoreRequest {
  title?: string;
  assigned_to_id?: number;
  assigned_to?: string;
  points?: number;
  completed?: boolean;
  is_daily?: boolean;
  due_date?: string;
  deleted?: boolean;
}
