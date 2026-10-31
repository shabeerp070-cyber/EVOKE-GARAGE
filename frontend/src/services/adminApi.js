const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'evoke_garage_admin_token';
const ADMIN_USER_KEY = 'evoke_garage_admin_user';

// ============================================================================
// TOKEN HELPERS
// ============================================================================
export const getAdminToken = () => localStorage.getItem(TOKEN_KEY);

export const setAdminAuth = (token, adminUser) => {
  localStorage.setItem(TOKEN_KEY, token);
  if (adminUser) {
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(adminUser));
  }
};

export const clearAdminAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
};

export const getStoredAdminUser = () => {
  try {
    const raw = localStorage.getItem(ADMIN_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const isAdminAuthenticated = () => {
  const token = getAdminToken();
  return Boolean(token);
};

/**
 * Common fetch wrapper with Authorization Bearer header
 */
async function authFetch(endpoint, options = {}) {
  const token = getAdminToken();
  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If payload is not FormData, ensure Content-Type is JSON
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => null);

  if (res.status === 401) {
    clearAdminAuth();
    throw new Error(data?.message || 'Administrative session expired. Please log in again.');
  }

  if (!res.ok || !data?.success) {
    throw new Error(data?.message || `Operation failed (Status: ${res.status})`);
  }

  return data;
}

// ============================================================================
// ADMIN AUTHENTICATION
// ============================================================================
export async function loginAdmin(usernameOrEmail, password) {
  const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usernameOrEmail, password }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || !data?.success) {
    throw new Error(data?.message || 'Invalid administrative credentials');
  }

  setAdminAuth(data.token, data.admin);
  return data;
}

export async function verifyAdminSession() {
  return await authFetch('/api/admin/me', { method: 'GET' });
}

// ============================================================================
// ADMIN PRODUCT MANAGEMENT (CRUD)
// ============================================================================
export async function fetchAdminProducts() {
  const data = await authFetch('/api/admin/products', { method: 'GET' });
  return data.products || [];
}

export async function createAdminProduct(formDataOrJson) {
  const isFormData = formDataOrJson instanceof FormData;
  return await authFetch('/api/admin/products', {
    method: 'POST',
    body: isFormData ? formDataOrJson : JSON.stringify(formDataOrJson),
  });
}

export async function updateAdminProduct(productId, formDataOrJson) {
  const isFormData = formDataOrJson instanceof FormData;
  return await authFetch(`/api/admin/products/${productId}`, {
    method: 'PUT',
    body: isFormData ? formDataOrJson : JSON.stringify(formDataOrJson),
  });
}

export async function deleteAdminProduct(productId) {
  return await authFetch(`/api/admin/products/${productId}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// ADMIN BOOKINGS MANAGEMENT
// ============================================================================
export async function fetchAdminBookings() {
  const data = await authFetch('/api/admin/bookings', { method: 'GET' });
  return data.bookings || [];
}

export async function updateBookingStatus(bookingId, status) {
  return await authFetch(`/api/admin/bookings/${bookingId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function deleteAdminBooking(bookingId) {
  return await authFetch(`/api/admin/bookings/${bookingId}`, {
    method: 'DELETE',
  });
}

