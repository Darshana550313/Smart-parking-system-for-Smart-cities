import axios from "axios"

const API_BASE = "http://127.0.0.1:5000/api"

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api

// Auth
export const login = (data: { email: string; password: string }) =>
  api.post("/auth/login", data)
export const register = (data: { full_name: string; email: string; phone: string; password: string }) =>
  api.post("/auth/register", data)
export const forgotPassword = (data: { email: string; new_password: string }) =>
  api.post("/auth/forgot-password", data)
export const logout = () => api.post("/auth/logout")

// Dashboard
export const getDashboardStats = () => api.get("/dashboard/stats")

// Slots
export const getParkingSlots = () => api.get("/slots")
export const updateSlot = (id: number, status: string) =>
  api.put(`/slots/${id}`, { status })

// Vehicles
export const getVehicles = () => api.get("/vehicles")
export const getActiveVehicles = () => api.get("/vehicles/active")
export const getVehicleHistory = () => api.get("/vehicles/history")
export const searchVehicles = (query: string) =>
  api.get(`/vehicles/search?q=${query}`)
export const vehicleEntry = (data: { vehicle_number: string; slot_number: string }) =>
  api.post("/vehicles/entry", data)
export const vehicleExit = (data: { vehicle_number: string }) =>
  api.post("/vehicles/exit", data)

// Bookings
export const getBookings = () => api.get("/bookings")
export const getMyBookings = (email: string) =>
  api.get(`/bookings/my?email=${email}`)
export const createBooking = (data: {
  customer_name: string
  vehicle_number: string
  slot_number: string
  booking_date: string
}) => api.post("/bookings", data)
export const cancelBooking = (id: number) =>
  api.put(`/bookings/${id}/cancel`)
export const searchBookings = (query: string) =>
  api.get(`/bookings/search?q=${query}`)

// Admin
export const getAdminStats = () => api.get("/admin/stats")
export const getAllUsers = () => api.get("/admin/users")
export const getPendingBookings = () => api.get("/admin/bookings/pending")
export const approveBooking = (id: number) =>
  api.put(`/admin/bookings/${id}/approve`)
export const rejectBooking = (id: number) =>
  api.put(`/admin/bookings/${id}/reject`)

// Analytics
export const getAnalytics = () => api.get("/analytics")
export const simulateSensors = () => api.post("/simulate/sensors")
