import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export default api