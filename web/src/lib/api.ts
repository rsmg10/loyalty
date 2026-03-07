const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string;
};

async function parseResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;
  const headers = { Accept: 'application/json' };

  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await parseResponse(response);
  if (!response.ok) {
    const message = (data as { detail?: string; message?: string })?.detail
      || (data as { detail?: string; message?: string })?.message
      || response.statusText;
    throw new Error(message || 'Request failed');
  }

  return data as T;
}

export function apiGet<T>(path: string, token?: string): Promise<T> {
  return request<T>(path, { token });
}

export function apiPost<T>(path: string, body: unknown, token?: string): Promise<T> {
  return request<T>(path, { method: 'POST', body, token });
}

export function apiPut<T>(path: string, body: unknown, token?: string): Promise<T> {
  return request<T>(path, { method: 'PUT', body, token });
}

export async function apiPostForm<T>(path: string, formData: FormData, token?: string): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: formData
  });

  const data = await parseResponse(response);
  if (!response.ok) {
    const message = (data as { detail?: string; message?: string })?.detail
      || (data as { detail?: string; message?: string })?.message
      || response.statusText;
    throw new Error(message || 'Request failed');
  }

  return data as T;
}
