import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: { email: string; username: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
};

export const userAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data: { username?: string; avatar?: string }) =>
    api.put('/users/me', data),
  getOnlineUsers: () => api.get('/users/online'),
};

export const messageAPI = {
  getMessages: (chatId: string, page = 1, limit = 50) =>
    api.get(`/messages/${chatId}?page=${page}&limit=${limit}`),
};

export default api;
