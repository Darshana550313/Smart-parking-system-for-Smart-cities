import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CalendarDays, Search, X, RefreshCw } from "lucide-react"
import { getBookings, cancelBooking, searchBookings } from "@/lib/api"
import { useToast } from "@/context/ToastContext"
import { formatDate } from "@/lib/utils"
import type { Booking } from "@/types"

export function BookingManagementPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  const fetchBookings = async () => {
    try {
      const res = await getBookings()
      setBookings(res.data)
    } catch {
      showToast("Failed to load bookings", "error")
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchBookings()
      return
    }
    try {
      const res = await searchBookings(searchQuery)
      setBookings(res.data)
    } catch {
      showToast("Search failed", "error")
    }
  }

  const handleCancel = async (id: number) => {
    setLoading(true)
    try {
      await cancelBooking(id)
      showToast("Booking cancelled", "success")
      fetchBookings()
    } catch {
      showToast("Cancel failed", "error")
    } finally {
      setLoading(false)
    }
  }

  const statusColors: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    completed: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/30",
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">Booking Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">View and control all bookings from a polished management console.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-8 shadow-xl shadow-slate-900/5 backdrop-blur-sm dark:border-slate-800/70 dark:bg-slate-950/85"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bookings..."
                className="input-frost pl-12"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSearch}
              className="frosted-button"
            >
              Search
            </button>
            <button
              onClick={fetchBookings}
              className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
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
                <th className="text-left py-3 px-2">Status</th>
                <th className="text-left py-3 px-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
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
                    <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${statusColors[booking.booking_status] || "border-slate-200 bg-slate-100 text-slate-700"}`}>
                      {booking.booking_status}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    {booking.booking_status === "pending" && (
                      <button
                        onClick={() => handleCancel(booking.booking_id)}
                        disabled={loading}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-3xl border border-red-200 bg-red-50 text-red-500 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 dark:text-slate-400">
                    No bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
