import { AccountSession } from "../storage";

export const SUPABASE_URL = "https://yulxgmedlgalnivtgvyx.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_GtUu0OeGBsnm5zktdygvww_hVQw0lrY";

interface SupabaseAuthResponse {
  access_token?: string
  refresh_token?: string
  expires_in?: number
  expires_at?: number
  user?: {
    id?: string
    email?: string
  }
  id?: string
  email?: string
  msg?: string
  error_description?: string
  error?: string
  message?: string
}

export type AuthResult =
  | { ok: true; status: "SIGNED_IN"; session: AccountSession }
  | { ok: true; status: "CONFIRM_EMAIL"; email: string }
  | { ok: false; error: string };

const extractError = (data: SupabaseAuthResponse, fallback: string): string =>
  data.msg || data.error_description || data.message || data.error || fallback;

const parseSession = (data: SupabaseAuthResponse, fallbackEmail: string): AccountSession | null => {
  if (!data.access_token || !data.refresh_token) {
    return null;
  }
  const expiresAt = typeof data.expires_at === "number"
    ? data.expires_at * 1000
    : Date.now() + (data.expires_in || 3600) * 1000;
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt,
    user: {
      id: data.user?.id || data.id || "",
      email: data.user?.email || data.email || fallbackEmail,
    },
  };
};

const authHeaders = (accessToken?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    apikey: SUPABASE_PUBLISHABLE_KEY,
    "Content-Type": "application/json",
  };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return headers;
};

export const signInWithPassword = async (
  email: string,
  password: string,
): Promise<AuthResult> => {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const data = (await res.json()) as SupabaseAuthResponse;
    if (!res.ok) {
      return { ok: false, error: extractError(data, `HTTP ${res.status}`) };
    }
    const session = parseSession(data, email);
    if (!session) {
      return { ok: false, error: "Missing session token from server." };
    }
    return { ok: true, status: "SIGNED_IN", session };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Network error" };
  }
};

export const signUpWithPassword = async (
  email: string,
  password: string,
): Promise<AuthResult> => {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const data = (await res.json()) as SupabaseAuthResponse;
    if (!res.ok) {
      return { ok: false, error: extractError(data, `HTTP ${res.status}`) };
    }
    const session = parseSession(data, email);
    if (session) {
      return { ok: true, status: "SIGNED_IN", session };
    }
    return { ok: true, status: "CONFIRM_EMAIL", email: data.email || email };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Network error" };
  }
};

export const refreshSession = async (refreshToken: string): Promise<AccountSession | null> => {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) {
      return null;
    }
    const data = (await res.json()) as SupabaseAuthResponse;
    return parseSession(data, "");
  } catch {
    return null;
  }
};

export const signOut = async (accessToken: string): Promise<void> => {
  try {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: "POST",
      headers: authHeaders(accessToken),
    });
  } catch {
    // Local session is still cleared even if offline.
  }
};
