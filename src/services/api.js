/**
 * RentEase Frontend API Service Client
 * Provides modular HTTP client methods for communicating with the backend API.
 * Coexists safely with client-side state and catalog fallbacks.
 */

export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return '/api';
};

export const buildApiUrl = (endpoint) => {
  const base = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  if (base.endsWith('/api') && cleanEndpoint.startsWith('/api')) {
    return `${base}${cleanEndpoint.slice(4)}`;
  }
  return `${base}${cleanEndpoint}`;
};

/**
 * Get stored JWT auth token from localStorage
 */
export const getAuthToken = () => {
  return localStorage.getItem('rentease_jwt') || localStorage.getItem('rentease_token');
};

/**
 * Store JWT auth token in localStorage
 */
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('rentease_jwt', token);
    localStorage.setItem('rentease_token', token);
  } else {
    localStorage.removeItem('rentease_jwt');
    localStorage.removeItem('rentease_token');
  }
};

/**
 * Base fetch wrapper with automatic JSON parsing and Bearer auth headers
 */
async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  const fullUrl = buildApiUrl(endpoint);

  try {
    const response = await fetch(fullUrl, config);
    const contentType = response.headers.get('content-type') || '';
    let data = null;

    if (contentType.includes('application/json')) {
      data = await response.json().catch(() => null);
    } else {
      const text = await response.text().catch(() => '');
      data = { message: text || `HTTP error ${response.status}` };
    }

    if (!response.ok) {
      const error = new Error(data?.message || `HTTP error ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.warn(`[RentEase API] Request to ${endpoint} failed:`, error.message);
    throw error;
  }
}

export const api = {
  // Health
  health: {
    check: () => request('/health'),
  },

  // Authentication
  auth: {
    register: (userData) => request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
    login: (credentials) => request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
    getMe: () => request('/auth/me'),
  },

  // Products
  products: {
    list: (params = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.append(key, value);
        }
      });
      const queryString = query.toString();
      return request(`/products${queryString ? `?${queryString}` : ''}`);
    },
    getById: (id) => request(`/products/${encodeURIComponent(id)}`),
  },
};

export default api;
