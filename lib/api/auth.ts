import { apiClient } from "./client";
import {
  DecodedJwtPayload,
  LoginCredentials,
  LoginResponse,
  User,
  UserRole,
} from "@/types";

const ACCESS_TOKEN_KEY = "semesteria_access_token";
const REFRESH_TOKEN_KEY = "semesteria_refresh_token";
const USER_KEY = "semesteria_user";

/**
 * Safely decodes base64 payload from a JWT token.
 */
export function decodeJwt(token: string): DecodedJwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload) as DecodedJwtPayload;
  } catch {
    return null;
  }
}

/**
 * Stores tokens and user info in localStorage.
 */
export function saveAuthSession(loginResponse: LoginResponse): User {
  const decoded = decodeJwt(loginResponse.access) as (DecodedJwtPayload & { is_superuser?: boolean; is_staff?: boolean }) | null;
  if (!decoded) {
    throw new Error("Invalid JWT token received from backend.");
  }

  // Ensure admin user, superuser, staff, or recruiter is assigned recruiter role
  let role: UserRole = "candidate";
  const usernameLower = (decoded.username || "").toLowerCase();
  if (
    decoded.role === "recruiter" ||
    (decoded.role as string) === "admin" ||
    decoded.is_superuser ||
    decoded.is_staff ||
    usernameLower === "admin" ||
    usernameLower.startsWith("recruiter")
  ) {
    role = "recruiter";
  } else if (decoded.role === "candidate") {
    role = "candidate";
  }

  const user: User = {
    id: decoded.user_id,
    username: decoded.username,
    role,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(ACCESS_TOKEN_KEY, loginResponse.access);
    localStorage.setItem(REFRESH_TOKEN_KEY, loginResponse.refresh);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event("auth-change"));
  }

  return user;
}

/**
 * Removes auth tokens and user data.
 */
export function clearAuthSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event("auth-change"));
  }
}

/**
 * Retrieves the stored user object from localStorage.
 */
export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;
  try {
    return JSON.parse(userJson) as User;
  } catch {
    return null;
  }
}

/**
 * Retrieves the stored access token from localStorage.
 */
export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Performs login request to Django backend.
 */
export async function login(credentials: LoginCredentials): Promise<{ user: User; tokens: LoginResponse }> {
  const tokens = await apiClient.post<LoginResponse>("/auth/login/", credentials);
  const user = saveAuthSession(tokens);
  return { user, tokens };
}

/**
 * Logs out the current user and clears session.
 */
export function logout(): void {
  clearAuthSession();
}
