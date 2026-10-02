// Sanitize literal quotes or empty strings passed from build environments (e.g., Docker, Vercel)
const rawBase =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  '';
export const BASE_URL = rawBase.replace(/^["']|["']$/g, '').trim();

// Canonical time slots formatted precisely as expected by the backend Reservation model
export const TIME_SLOTS = [
  '12:00 - 13:30',
  '13:30 - 15:00',
  '18:00 - 19:30',
  '19:30 - 21:00',
  '21:00 - 22:30',
];

/**
 * Central fetch wrapper:
 * - Attaches the Bearer token automatically from localStorage or explicit argument.
 * - Handles JSON payload serialization and safe parsing.
 * - Uniformly catches and extracts detailed error messages.
 */
async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  const authToken = token || localStorage.getItem('token');
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const url = `${BASE_URL}${path}`;

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new Error('Network error: Unable to reach the reservation server. Please verify your connection.');
  }

  let data = {};
  try {
    data = await res.json();
  } catch {
    // Non-JSON response (e.g. 204 No Content, HTML error page)
    data = {};
  }

  if (!res.ok) {
    const errorMsg = data.message || `Request failed with status ${res.status}`;
    const error = new Error(errorMsg);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  register: (payload) => request('/api/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/api/auth/login', { method: 'POST', body: payload }),
  getProfile: (token) => request('/api/auth/me', { token }),

  // Customer Reservations
  getReservations: (token) => request('/api/reservations/my', { token }),
  createReservation: (payload, token) => request('/api/reservations', { method: 'POST', body: payload, token }),
  
  // Resilient cancellation: tries DELETE /api/reservations/:id, fallbacks to PATCH /api/reservations/:id/cancel
  cancelReservation: async (id, token) => {
    try {
      return await request(`/api/reservations/${id}`, { method: 'DELETE', token });
    } catch (err) {
      if (err.status === 404 || err.status === 405) {
        return await request(`/api/reservations/${id}/cancel`, { method: 'PATCH', token });
      }
      throw err;
    }
  },

  // Tables & Availability
  getTables: (token) => request('/api/tables', { token }),
  getAvailableTables: (date, timeSlot, token) =>
    request(`/api/tables/availability?date=${encodeURIComponent(date)}&timeSlot=${encodeURIComponent(timeSlot)}`, { token }),

  // Admin Endpoints
  getAllReservations: (token, queryString = '') => request(`/api/admin/reservations${queryString}`, { token }),
  updateReservation: (id, payload, token) => request(`/api/admin/reservations/${id}`, { method: 'PUT', body: payload, token }),
};

export default api;