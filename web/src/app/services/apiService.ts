const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// ─── extract human-readable error from ApiResponse ────────────────────────
function extractMsg(data: any, fallback: string): string {
  if (!data) return fallback;
  if (typeof data.error === 'string') return data.error;
  if (data.error?.message) return data.error.message;
  return fallback;
}

// ─── base request ─────────────────────────────────────────────────────────
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Only set JSON content-type when not sending FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  // Handle 204 No Content
  if (response.status === 204) return undefined as unknown as T;

  const data = await response.json();

  if (!response.ok || data.success === false) {
    throw new Error(extractMsg(data, `Request failed (${response.status})`));
  }

  return (data.data !== undefined ? data.data : data) as T;
}

// ─── public API object ────────────────────────────────────────────────────
export const api = {
  get:    <T>(path: string)                         => request<T>(path),
  post:   <T>(path: string, body: unknown)          => request<T>(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown)          => request<T>(path, { method: 'PUT',    body: JSON.stringify(body) }),
  patch:  <T>(path: string, body?: unknown)         => request<T>(path, { method: 'PATCH',  body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string)                         => request<T>(path, { method: 'DELETE' }),
  upload: <T>(path: string, formData: FormData)     => request<T>(path, { method: 'POST',   body: formData }),
};

export { API_URL };