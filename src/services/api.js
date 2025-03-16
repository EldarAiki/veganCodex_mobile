import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://192.168.1.103:5000/api',
  timeout: 10000,
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Check if the request contains FormData
      if (config.data instanceof FormData) {
        config.headers['Content-Type'] = 'multipart/form-data';
        // Remove the transformRequest for FormData
        delete config.transformRequest;
      }

      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    const fullUrl = error.config ? `${error.config.baseURL}${error.config.url}` : 'URL not available';
    console.error('API Error for URL:', fullUrl);
    
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', fullUrl);
      throw new Error('Request timed out. Please try again.');
    }
    
    if (!error.response) {
      console.error('Network error:', fullUrl);
      throw new Error('Network error. Please check your connection.');
    }

    // Log the error response for debugging
    console.error('Error response:', {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers
    });
    
    // Handle specific error cases
    if (error.response.status === 401) {
      throw new Error('Authentication failed. Please check your credentials.');
    }
    
    throw error;
  }
);

// Auth endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  verifyEmail: (token) => api.get(`/auth/verify-email?token=${token}`),
  resendVerification: () => api.post('/auth/resend-verification'),
};

// Product endpoints
export const productAPI = {
  searchProducts: (query) => {
    const params = {};
    if (query.country) params.location = query.country;
    if (query.search) params.search = query.search;
    if (query.addedBy) params.addedBy = query.addedBy;
    return api.get('/products', { params });
  },
  getProductById: (id) => api.get(`/products/${id}`),
  addProduct: (productData) => {
    console.log('Sending product data:', productData);
    return api.post('/products', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json',
      },
      transformRequest: (data) => {
        return data; // Prevent axios from trying to transform FormData
      },
    });
  },
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  addComment: (productId, commentData) => api.post(`/products/${productId}/comments`, commentData),
  updateComment: (productId, commentId, commentData) => 
    api.put(`/products/${productId}/comments/${commentId}`, commentData),
  deleteComment: (productId, commentId) => 
    api.delete(`/products/${productId}/comments/${commentId}`),
  reportComment: (productId, commentId, reason) => 
    api.put(`/products/${productId}/comments/${commentId}/report`, { reason }),
};

export default api; 