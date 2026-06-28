import { useEffect, useMemo, useState } from "react"
import { useTheme } from "@/context/ThemeContext"
import { useAuth } from "@/context/AuthContext"
import { Sun, Moon, Bell, LogOut, User, Search, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { useNavigate, useLocation } from "react-router-dom"
import { useToast } from "@/context/ToastContext"

const routeLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/entry": "Vehicle Entry",
  "/exit": "Vehicle Exit",
  "/booking": "New Booking",
  "/bookings": "My Bookings",
  "/vehicles": "Vehicle Management",
  "/analytics": "Analytics",
  "/admin": "Admin Panel",
}

export function TopBar() {
  const { theme, toggleTheme } = useTheme()
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000)
    return () => window.clearInterval(timer)
  }, [])

  const breadcrumb = useMemo(() => {
    return routeLabels[location.pathname] || "Overview"
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    showToast("Logged out successfully", "success")
    navigate("/login")
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl shadow-sm dark:border-slate-800/80 dark:bg-slate-950/95">
      <div className="mx-auto flex max-w-[1700px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {breadcrumb}
              </span>
              <span className="inline-flex items-center gap-1 text-slate-400">
                <ChevronRight className="h-3 w-3" />
                <span>{now.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</span>
              </span>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full max-w-xl">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  placeholder="Search slots, bookings, vehicles..."
                  className="input-frost pr-4 pl-11 dark:input-frost-dark"
                  aria-label="Search dashboard"
                />
              </div>
              <div className="rounded-3xl bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-200">
                {now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950" />
            </button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={toggleTheme}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-700" />}
            </motion.button>

            <div className="hidden items-center gap-3 rounded-3xl border border-slate-200 bg-white/90 px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-900/90 sm:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/10">
                <User className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{user?.full_name ?? "Guest User"}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{isAdmin ? "Administrator" : "Parking Operator"}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
