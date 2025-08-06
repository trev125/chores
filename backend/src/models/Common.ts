export interface ActivityLog {
  id: number;
  date: string;
  type: string;
  description: string;
  user_name?: string;
  created_at: string;
}

export interface CreateActivityLogRequest {
  type: string;
  description: string;
  user_name?: string;
}

export interface AppSetting {
  id: number;
  key: string;
  value: string;
}

export interface AuthRequest {
  pin: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: number;
    name: string;
    is_admin: boolean;
  };
  error?: string;
}
