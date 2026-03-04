import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig } from 'axios'

type APIType = 'local' | 'remote'

// Helper function to get bearer token from cookies
const getBearerToken = (): string | null => {
  const cookieString = document.cookie
  const cookies = cookieString.split(';')
  
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'bearerToken' || name === 'token') {
      return decodeURIComponent(value)
    }
  }
  
  return null
}

// Create axios instance for API requests
const createAPIInstance = (type: APIType): AxiosInstance => {
  const baseURL = type === 'local' 
    ? import.meta.env.VITE_LOCAL_URL || 'http://localhost:8081'
    : import.meta.env.VITE_REMOTE_URL || 'http://localhost:8080'

  const instance = axios.create({
    baseURL,
    timeout: 100000000000,
  })

  // Add bearer token to request headers if it exists
  instance.interceptors.request.use(
    (config) => {
      const token = getBearerToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Handle response errors
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Handle unauthorized access
        console.error('Unauthorized - token may be expired')
      }
      return Promise.reject(error)
    }
  )

  return instance
}

// Export instances
export const apiLocal = createAPIInstance('local')
export const apiRemote = createAPIInstance('remote')

// Helper function to create service methods
const createService = (instance: AxiosInstance) => ({
  get: <T = any>(url: string, config?: AxiosRequestConfig) => 
    instance.get<T>(url, config),
  
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    instance.post<T>(url, data, config),
  
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    instance.put<T>(url, data, config),
  
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    instance.patch<T>(url, data, config),
  
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => 
    instance.delete<T>(url, config),
})

// Export services
export const apiLocalService = createService(apiLocal)
export const apiRemoteService = createService(apiRemote)

// Export a factory function for creating custom API instances
export const createAPI = (type: APIType) => {
  const instance = createAPIInstance(type)
  return createService(instance)
}
