const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  middleInitial?: string;
  role: 'STUDENT' | 'TUTOR' | 'ADMIN';
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: {
      id: number;
      email: string;
      firstName: string;
      lastName: string;
      middleInitial?: string;
      role: 'STUDENT' | 'TUTOR' | 'ADMIN';
    };
    token: string;
    refreshToken: string;
    tokenType: string;
  };
  error?: {
    code: string;
    message: string;
  } | string;
  timestamp?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Extract a human-readable message from various error shapes. */
function extractErrorMessage(data: AuthResponse, fallback: string): string {
  if (!data) return fallback;
  if (typeof data.error === 'string') return data.error;
  if (data.error && typeof data.error === 'object') return data.error.message || fallback;
  return fallback;
}

// ─── Domain validation (mirrors backend) ────────────────────────────────────

export const CIT_DOMAIN   = '@cit.edu';
export const ADMIN_DOMAIN = '@tutortime.com';

/** Returns true if the email is acceptable for login. */
export function isValidLoginEmail(email: string): boolean {
  const lower = email.toLowerCase();
  return lower.endsWith(CIT_DOMAIN) || lower.endsWith(ADMIN_DOMAIN);
}

/** Returns true if the email is acceptable for registration. */
export function isValidRegisterEmail(email: string): boolean {
  return email.toLowerCase().endsWith(CIT_DOMAIN);
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const authService = {

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      }),
    });

    const data: AuthResponse = await response.json();

    if (!response.ok || !data.success) {
      const msg = extractErrorMessage(data, 'Login failed. Please check your credentials.');
      throw new Error(msg);
    }

    return data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        email: data.email.trim().toLowerCase(),
      }),
    });

    const result: AuthResponse = await response.json();

    if (!response.ok || !result.success) {
      const msg = extractErrorMessage(result, 'Registration failed. Please try again.');
      throw new Error(msg);
    }

    return result;
  },

  async logout(): Promise<void> {
    const token = this.getToken();
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch {
        // Logout call is best-effort; always clear local state
      }
    }
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  setToken(token: string): void {
    localStorage.setItem('token', token);
  },

  removeToken(): void {
    localStorage.removeItem('token');
  },
};