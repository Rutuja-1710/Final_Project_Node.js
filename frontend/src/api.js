import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Turn an axios error into a readable message (includes per-field validation errors)
export function errorMessage(err) {
  const data = err.response?.data;
  if (data?.errors?.length) return data.errors.map((e) => e.message).join(' · ');
  return data?.message || err.message || 'Something went wrong';
}

export default api;
