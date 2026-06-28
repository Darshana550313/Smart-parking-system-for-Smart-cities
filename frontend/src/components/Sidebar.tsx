import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  LogIn,
  LogOut,
  CalendarPlus,
  CalendarDays,
  Car,
  BarChart3,
  Shield,
  ChevronLeft,
  ChevronRight,
  ParkingSquare,
  Settings,
  Cpu,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"

const navItems = [
  { path: "/dashboard", label: "Overview", icon: LayoutDashboard, roles: ["user", "admin"] },
  { path: "/entry", label: "Vehicle Entry", icon: LogIn, roles: ["admin"] },
  { path: "/exit", label: "Vehicle Exit", icon: LogOut, roles: ["admin"] },
  { path: "/booking", label: "New Booking", icon: CalendarPlus, roles: ["user", "admin"] },
  { path: "/bookings", label: "Bookings", icon: CalendarDays, roles: ["user", "admin"] },
  { path: "/vehicles", label: "Vehicles", icon: Car, roles: ["admin"] },
  { path: "/analytics", label: "Analytics", icon: BarChart3, roles: ["admin"] },
  { path: "/admin", label: "Admin", icon: Shield, roles: ["admin"] },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const { isAdmin } = useAuth()

  const filteredItems = navItems.filter((item) =>
    item.roles.includes(isAdmin ? "admin" : "user")
  )

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 88 : 280 }}
      transition={{ duration: 0.28, ease: "easeInOut" }}
      className="relative flex min-h-screen flex-col border-r border-slate-200/70 bg-white/85 shadow-xl shadow-slate-900/5 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/95"
    >
      <div className="flex min-h-[88px] items-center gap-3 border-b border-slate-200/70 px-5 py-4 dark:border-slate-800/70">
        <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20">
          <ParkingSquare className="h-6 w-6" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="overflow-hidden"
            >
              <p className="text-base font-semibold text-slate-900 dark:text-slate-100">Smart Parking</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">City Mobility Hub</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "group flex items-center gap-4 rounded-3xl px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10 dark:bg-slate-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              )}
            >
              <span className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", isActive ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300")}> 
                <Icon className="h-5 w-5" />
              </span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-slate-200/70 px-4 py-4 dark:border-slate-800/70">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="group flex w-full items-center justify-center gap-2 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </span>
          {!collapsed && "Collapse sidebar"}
        </button>

        {!collapsed && (
          <div className="mt-4 rounded-3xl border border-slate-200/70 bg-slate-50 p-4 text-sm text-slate-700 shadow-sm dark:border-slate-800/70 dark:bg-slate-900 dark:text-slate-300">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">IoT Sensor Hub</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Live parking status & analytics</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  )
}
