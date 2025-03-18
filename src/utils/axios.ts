import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // Get baseURL from environment
  timeout: 10000, // Optional: Set timeout (in milliseconds)
})

// Interceptor to add token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('session') // Get token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}` // Add token to Authorization header
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Interceptor to handle responses (optional)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access (e.g., logout or refresh token)
      console.error('Unauthorized, please log in again')
    }
    return Promise.reject(error)
  },
)

export default api
