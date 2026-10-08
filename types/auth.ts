export type UserRole = "candidate" | "recruiter";

export interface User {
  id: string | number;
  username: string;
  email?: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface DecodedJwtPayload {
  user_id: string;
  username: string;
  role: UserRole;
  exp: number;
  iat?: number;
  jti?: string;
}
