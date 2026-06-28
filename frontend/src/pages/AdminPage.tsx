import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Shield, ParkingSquare, Users, CalendarDays, BarChart3, Settings, Wrench, Activity, CheckCircle, XCircle, UserCheck, Clock } from "lucide-react"
import { getAdminStats, getAllUsers, getPendingBookings, approveBooking, rejectBooking } from "@/lib/api"
import { useToast } from "@/context/ToastContext"
import { formatDate } from "@/lib/utils"
import type { Booking } from "@/types"

const adminCards = [
  { title: "Manage Slots", icon: ParkingSquare, color: "from-blue-500 to-cyan-500", desc: "Configure parking slots" },
  { title: "Manage Vehicles", icon: Users, color: "from-emerald-500 to-teal-500", desc: "View all vehicles" },
  { title: "Manage Bookings", icon: CalendarDays, color: "from-amber-500 to-orange-500", desc: "All reservations" },
  { title: "View Reports", icon: BarChart3, color: "from-violet-500 to-purple-500", desc: "Generate reports" },
  { title: "System Settings", icon: Settings, color: "from-rose-500 to-pink-500", desc: "Configure system" },
  { title: "Maintenance", icon: Wrench, color: "from-slate-500 to-gray-500", desc: "Slot maintenance" },
]

export function AdminPage() {
  const [stats, setStats] = useState({
    total_users: 0,
    total_customers: 0,
    total_bookings: 0,
    pending_bookings: 0,
    active_vehicles: 0,
  })
  const [users, setUsers] = useState<any[]>([])
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, bookingsRes] = await Promise.all([
        getAdminStats(),
        getAllUsers(),
        getPendingBookings(),
      ])
      setStats(statsRes.data)
      setUsers(usersRes.data)
      setPendingBookings(bookingsRes.data)
    } catch {
      showToast("Failed to load admin data", "error")
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleApprove = async (id: number) => {
    setLoading(true)
    try {
      await approveBooking(id)
      showToast("Booking approved!", "success")
      fetchData()
    } catch {
      showToast("Approval failed", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async (id: number) => {
    setLoading(true)
    try {
      await rejectBooking(id)
      showToast("Booking rejected", "success")
      fetchData()
    } catch {
      showToast("Rejection failed", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">Admin Panel</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">System administration, live insights, and operational control.</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {[
          { label: "Total Users", value: stats.total_users, icon: Users, color: "from-blue-500 to-cyan-500" },
          { label: "Customers", value: stats.total_customers, icon: UserCheck, color: "from-emerald-500 to-teal-500" },
          { label: "Total Bookings", value: stats.total_bookings, icon: CalendarDays, color: "from-amber-500 to-orange-500" },
          { label: "Pending", value: stats.pending_bookings, icon: Clock, color: "from-red-500 to-rose-500" },
          { label: "Active Vehicles", value: stats.active_vehicles, icon: Activity, color: "from-cyan-500 to-blue-500" },
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-[1.5rem] border border-slate-200/80 bg-white/90 p-5 shadow-xl shadow-slate-900/5 dark:border-slate-800/70 dark:bg-slate-950/85"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br ${stat.color} text-white`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">{stat.label}</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Admin Cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {adminCards.map((card, index) => {
          const Icon = card.icon
          return (
            <motion.button
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group rounded-[1.5rem] border border-slate-200/80 bg-white/90 p-6 text-left shadow-xl shadow-slate-900/5 transition-all hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800/70 dark:bg-slate-950/85 dark:hover:bg-slate-900"
            >
              <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br ${card.color} text-white shadow-lg`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-950 dark:text-white">{card.title}</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{card.desc}</p>
            </motion.button>
          )
        })}
      </div>

      {/* Pending Bookings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-[1.5rem] border border-slate-200/80 bg-white/90 p-6 shadow-xl shadow-slate-900/5 dark:border-slate-800/70 dark:bg-slate-950/85"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Pending Bookings</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Approval required for new requests</p>
          </div>
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{pendingBookings.length} pending</span>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="text-left py-3 px-2">ID</th>
                <th className="text-left py-3 px-2">Customer</th>
                <th className="text-left py-3 px-2">Vehicle</th>
                <th className="text-left py-3 px-2">Slot</th>
                <th className="text-left py-3 px-2">Date</th>
                <th className="text-left py-3 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingBookings.map((booking) => (
                <motion.tr
                  key={booking.booking_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-slate-200/70 transition-colors hover:bg-slate-50 dark:border-slate-800/70 dark:hover:bg-slate-900"
                >
                  <td className="py-3 px-2 text-slate-950 dark:text-slate-100">#{booking.booking_id}</td>
                  <td className="py-3 px-2 text-slate-950 dark:text-slate-100">{booking.customer_name}</td>
                  <td className="py-3 px-2 text-slate-950 dark:text-slate-100">{booking.vehicle_number}</td>
                  <td className="py-3 px-2 text-slate-950 dark:text-slate-100">{booking.slot_number}</td>
                  <td className="py-3 px-2 text-slate-500 dark:text-slate-400">{formatDate(booking.booking_date)}</td>
                  <td className="py-3 px-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleApprove(booking.booking_id)}
                        disabled={loading}
                        className="inline-flex items-center gap-1 rounded-2xl bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-500 transition hover:bg-emerald-500/20 disabled:opacity-50"
                      >
                        <CheckCircle className="h-3 w-3" /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(booking.booking_id)}
                        disabled={loading}
                        className="inline-flex items-center gap-1 rounded-2xl bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-500/20 disabled:opacity-50"
                      >
                        <XCircle className="h-3 w-3" /> Reject
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {pendingBookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 dark:text-slate-400">
                    No pending bookings
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Users List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-[1.5rem] border border-slate-200/80 bg-white/90 p-6 shadow-xl shadow-slate-900/5 dark:border-slate-800/70 dark:bg-slate-950/85"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-100">All Users</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Track active users and roles.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {users.length} users
          </span>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="text-left py-3 px-2">ID</th>
                <th className="text-left py-3 px-2">Name</th>
                <th className="text-left py-3 px-2">Email</th>
                <th className="text-left py-3 px-2">Phone</th>
                <th className="text-left py-3 px-2">Role</th>
                <th className="text-left py-3 px-2">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <motion.tr
                  key={user.user_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-slate-200/70 transition-colors hover:bg-slate-50 dark:border-slate-800/70 dark:hover:bg-slate-900"
                >
                  <td className="py-3 px-2 text-slate-950 dark:text-slate-100">#{user.user_id}</td>
                  <td className="py-3 px-2 text-slate-950 dark:text-slate-100 font-medium">{user.full_name}</td>
                  <td className="py-3 px-2 text-slate-500 dark:text-slate-400">{user.email}</td>
                  <td className="py-3 px-2 text-slate-500 dark:text-slate-400">{user.phone || "N/A"}</td>
                  <td className="py-3 px-2">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      user.role === "admin"
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300"
                        : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-slate-500 dark:text-slate-400">{formatDate(user.created_at)}</td>
                </motion.tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 dark:text-slate-400">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-[1.5rem] border border-slate-200/80 bg-white/90 p-6 shadow-xl shadow-slate-900/5 dark:border-slate-800/70 dark:bg-slate-950/85"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-100">System Status</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Live health indicators for the platform.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            All systems nominal
          </span>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Database", status: "Connected", color: "text-emerald-400" },
            { label: "IoT Simulator", status: "Running", color: "text-emerald-400" },
            { label: "API Server", status: "Online", color: "text-emerald-400" },
            { label: "Dashboard", status: "Active", color: "text-emerald-400" },
          ].map((item) => (
            <div key={item.label} className="rounded-3xl border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800/70 dark:bg-slate-900">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{item.label}</p>
              <div className="mt-3 flex items-center gap-3">
                <Activity className={`h-5 w-5 ${item.color}`} />
                <p className={`text-sm font-semibold ${item.color}`}>{item.status}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
