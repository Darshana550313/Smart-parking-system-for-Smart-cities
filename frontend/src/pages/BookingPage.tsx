import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CalendarPlus, User, Car, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { createBooking, getMyBookings, getParkingSlots } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/context/ToastContext"
import { useParkingSlots } from "@/hooks/useParkingSlots"
import { formatDate } from "@/lib/utils"
import type { Booking } from "@/types"

export function BookingPage() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    customer_name: user?.full_name || "",
    vehicle_number: "",
    slot_number: "",
    booking_date: "",
  })
  const [myBookings, setMyBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()
  const { slots, refetch } = useParkingSlots()

  const availableSlots = slots.filter((s) => s.status === "available")

  const fetchMyBookings = async () => {
    if (!user) return
    try {
      const res = await getMyBookings(user.email)
      setMyBookings(res.data)
    } catch {
      // handle error
    }
  }

  useEffect(() => {
    fetchMyBookings()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.customer_name || !formData.vehicle_number || !formData.slot_number || !formData.booking_date) {
      showToast("Please fill all fields", "error")
      return
    }

    setLoading(true)
    try {
      await createBooking(formData)
      showToast("Booking request submitted! Waiting for admin approval.", "success")
      setFormData({ customer_name: user?.full_name || "", vehicle_number: "", slot_number: "", booking_date: "" })
      refetch()
      fetchMyBookings()
    } catch {
      showToast("Booking failed", "error")
    } finally {
      setLoading(false)
    }
  }

  const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
    pending: { color: "bg-amber-500/10 text-amber-400 border-amber-500/30", icon: Clock, label: "Pending Approval" },
    active: { color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30", icon: CheckCircle, label: "Approved" },
    rejected: { color: "bg-red-500/10 text-red-400 border-red-500/30", icon: XCircle, label: "Rejected" },
    cancelled: { color: "bg-slate-500/10 text-slate-400 border-slate-500/30", icon: AlertCircle, label: "Cancelled" },
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">New Booking</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Reserve a parking slot with real-time availability and approval tracking.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-8 shadow-xl shadow-slate-900/5 backdrop-blur-sm dark:border-slate-800/70 dark:bg-slate-950/85"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Customer Name</label>
              <div className="relative">
                <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  placeholder="Enter customer name"
                  className="input-frost pl-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Vehicle Number</label>
              <div className="relative">
                <Car className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  value={formData.vehicle_number}
                  onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value.toUpperCase() })}
                  placeholder="e.g. MH12AB1234"
                  className="input-frost pl-12"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Select Slot</label>
              <select
                value={formData.slot_number}
                onChange={(e) => setFormData({ ...formData, slot_number: e.target.value })}
                className="input-frost"
              >
                <option value="">Select a slot</option>
                {availableSlots.map((slot) => (
                  <option key={slot.slot_id} value={slot.slot_number}>
                    {slot.slot_number} - Available
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Booking Date</label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="datetime-local"
                  value={formData.booking_date}
                  onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                  className="input-frost pl-12"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="frosted-button w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CalendarPlus className="h-4 w-4" />
            {loading ? "Processing..." : "Submit Booking Request"}
          </button>
        </form>
      </motion.div>

      {/* My Bookings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-6 shadow-xl shadow-slate-900/5 dark:border-slate-800/70 dark:bg-slate-950/85"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-100">My Bookings</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Track the status of your reservations.</p>
          </div>
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {myBookings.length} bookings
          </span>
        </div>
        <div className="mt-6 space-y-3">
          {myBookings.map((booking) => {
            const config = statusConfig[booking.booking_status]
            const Icon = config?.icon || Clock
            return (
              <motion.div
                key={booking.booking_id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`flex flex-col gap-4 rounded-[1.5rem] border ${config?.color || "border-slate-200 bg-slate-50"} p-5 sm:flex-row sm:items-center sm:justify-between`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-950 dark:text-slate-100">Slot {booking.slot_number}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{booking.vehicle_number}</p>
                  </div>
                </div>
                <div className="text-sm text-right">
                  <p className="font-semibold text-slate-950 dark:text-slate-100">{config?.label || booking.booking_status}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{formatDate(booking.booking_date)}</p>
                </div>
              </motion.div>
            )
          })}
          {myBookings.length === 0 && (
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              No bookings yet
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
