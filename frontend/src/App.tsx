import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/context/AuthContext"
import { ThemeProvider } from "@/context/ThemeContext"
import { ToastProvider } from "@/context/ToastContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Layout } from "@/components/Layout"
import { LandingPage } from "@/pages/LandingPage"
import { LoginPage } from "@/pages/LoginPage"
import { RegisterPage } from "@/pages/RegisterPage"
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { VehicleEntryPage } from "@/pages/VehicleEntryPage"
import { VehicleExitPage } from "@/pages/VehicleExitPage"
import { BookingPage } from "@/pages/BookingPage"
import { BookingManagementPage } from "@/pages/BookingManagementPage"
import { VehicleManagementPage } from "@/pages/VehicleManagementPage"
import { AnalyticsPage } from "@/pages/AnalyticsPage"
import { AdminPage } from "@/pages/AdminPage"

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              <Route element={<Layout />}>
                <Route path="/dashboard" element={
                  <ProtectedRoute><DashboardPage /></ProtectedRoute>
                } />
                <Route path="/entry" element={
                  <ProtectedRoute><VehicleEntryPage /></ProtectedRoute>
                } />
                <Route path="/exit" element={
                  <ProtectedRoute><VehicleExitPage /></ProtectedRoute>
                } />
                <Route path="/booking" element={
                  <ProtectedRoute><BookingPage /></ProtectedRoute>
                } />
                <Route path="/bookings" element={
                  <ProtectedRoute><BookingManagementPage /></ProtectedRoute>
                } />
                <Route path="/vehicles" element={
                  <ProtectedRoute><VehicleManagementPage /></ProtectedRoute>
                } />
                <Route path="/analytics" element={
                  <ProtectedRoute><AnalyticsPage /></ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>
                } />
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
