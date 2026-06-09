import axios from 'axios';

function getApiOrigin(): string {
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:5260`;
  }
  return 'http://localhost:5260';
}

export const API_ORIGIN = getApiOrigin();
const API_BASE = `${API_ORIGIN}/api`;

/** Turn a relative /uploads/... path or localhost URL into a loadable image URL. */
export function resolveImageUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const parsed = new URL(url);
      if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
        return `${API_ORIGIN}${parsed.pathname}`;
      }
    } catch {
      /* use url as-is */
    }
    return url;
  }
  if (url.startsWith('/')) return `${API_ORIGIN}${url}`;
  return url;
}

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

export const orderService = {
  getOrders: (restaurantId?: string, status?: string) => {
    const params = new URLSearchParams();
    if (restaurantId) params.append('restaurantId', restaurantId);
    if (status) params.append('status', status);
    const query = params.toString();
    return api.get('/order' + (query ? `?${query}` : ''));
  },
  updateStatus: (id: string, status: string) => api.patch(`/order/${id}/status?status=${status}`),
  assignDriver: (id: string, driverId: string) => api.patch(`/order/${id}/assign/${driverId}`),
  getAvailableDrivers: () => api.get('/driver/available'),
};


export const authService = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (email: string, password: string, fullName: string, phoneNumber: string) => api.post('/auth/register', { email, password, fullName, phoneNumber }),
};

export const restaurantService = {
  getProfile: (email: string) => api.get(`/restaurant/by-email/${email}`),
  registerProfile: (data: any) => api.post('/restaurant/register', data),
  updateProfile: (id: string, data: any) => api.put(`/restaurant/${id}`, data),
  getMenu: (restaurantId: string) => api.get(`/restaurant/${restaurantId}/menu`),
  addMenuItem: (data: any) => api.post('/restaurant/menu', data),
  updateMenuItem: (id: string, data: any) => api.put(`/restaurant/menu/${id}`, data),
  deleteMenuItem: (id: string) => api.delete(`/restaurant/menu/${id}`),
  getAllRestaurants: () => api.get('/restaurant'),
  uploadImage: async (file: File): Promise<string> => {
    const form = new FormData();
    form.append('file', file);
    const token = localStorage.getItem('jwt');
    const res = await axios.post(`${API_BASE}/restaurant/upload-image`, form, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data.url as string;
  },
};
