export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginTokenResponse {
  access_token: string;
  token_type: string;
}

export interface CurrentUserResponse {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
}

export type ActionResult<T = void> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string };
