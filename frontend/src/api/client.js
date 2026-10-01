// Sanitize literal quotes or empty strings passed from build environments
const rawBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '';
const BASE_URL = rawBase.replace(/^"|"$/g, '').trim();

// Central fetch wrapper: attaches the JWT automatically, parses JSON,
// and handles error responses consistently.
async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  // Attach token from explicit argument or localStorage
  const authToken = token || localStorage.getItem('token');
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const url = `${BASE_URL}${path}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }

  return data;
}

export const api = {
  register: (payload) => request('/api/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/api/auth/login', { method: 'POST', body: payload }),
  getProfile: () => request('/api/auth/me'),
  getReservations: () => request('/api/reservations/my'),
  getTables: () => request('/api/tables'),
  createReservation: (payload) => request('/api/reservations', { method: 'POST', body: payload }),
};

export default api;