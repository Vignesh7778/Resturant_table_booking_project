import axios from 'axios';

const API_BASE_URL = import.meta.env.PROD 
  ? '/api' 
  : 'http://localhost:5000/api'; // Or http://localhost:8000 depending on which backend you run locally

const API = axios.create({ baseURL: API_BASE_URL });

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
