import axios from 'axios';

const API_BASE = 'http://localhost:5260/api'; // Adjust for production

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
  getOrders: (status?: string) => api.get('/order' + (status ? `?status=${status}` : '')),
  updateStatus: (id: string, status: string) => api.patch(`/order/${id}/status?status=${status}`),
  assignDriver: (id: string, driverId: string) => api.patch(`/order/${id}/assign/${driverId}`),
  getAvailableDrivers: () => api.get('/driver/available'),
};


export const authService = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (email: string, password: string, fullName: string) => api.post('/auth/register', { email, password, fullName }),
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
};
