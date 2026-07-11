const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Central fetch wrapper: attaches the JWT automatically, parses JSON,
// and throws a real Error with the server's message on failure so
// every page can just try/catch instead of repeating this logic.
async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
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

  getTables: () => request('/api/tables'),
  getAvailability: (date, timeSlot) =>
    request(`/api/tables/availability?date=${date}&timeSlot=${encodeURIComponent(timeSlot)}`),

  createReservation: (payload, token) =>
    request('/api/reservations', { method: 'POST', body: payload, token }),
  getMyReservations: (token) => request('/api/reservations/my', { token }),
  cancelReservation: (id, token) =>
    request(`/api/reservations/${id}`, { method: 'DELETE', token }),

  getAllReservations: (token, params = '') =>
    request(`/api/admin/reservations${params}`, { token }),
  updateReservation: (id, payload, token) =>
    request(`/api/admin/reservations/${id}`, { method: 'PUT', body: payload, token }),
};

export const TIME_SLOTS = ['12:00-13:30', '13:30-15:00', '19:00-20:30', '20:30-22:00'];
