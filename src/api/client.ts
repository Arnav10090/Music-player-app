import axios from 'axios';

// Base URL exactly as specified in assignment document
const BASE_URL = 'https://saavn.sumit.co';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for uniform error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const message = error.response.data?.message || 'API error';
      return Promise.reject(new Error(`[${error.response.status}] ${message}`));
    }
    if (error.request) {
      return Promise.reject(new Error('Network error — check your connection'));
    }
    return Promise.reject(error);
  }
);

export default apiClient;