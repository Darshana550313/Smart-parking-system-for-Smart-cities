import { useState } from "react"
import { motion } from "framer-motion"
import { LogIn, Car } from "lucide-react"
import { vehicleEntry, getParkingSlots } from "@/lib/api"
import { useToast } from "@/context/ToastContext"
import { useParkingSlots } from "@/hooks/useParkingSlots"

export function VehicleEntryPage() {
  const [vehicleNumber, setVehicleNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()
  const { slots, refetch } = useParkingSlots()

  const availableSlots = slots.filter((s) => s.status === "available")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vehicleNumber.trim()) {
      showToast("Please enter vehicle number", "error")
      return
    }
    if (availableSlots.length === 0) {
      showToast("No slots available", "error")
      return
    }

    setLoading(true)
    try {
      const slot = availableSlots[0]
      await vehicleEntry({
        vehicle_number: vehicleNumber.toUpperCase(),
        slot_number: slot.slot_number,
      })
      showToast(`Vehicle ${vehicleNumber.toUpperCase()} parked at ${slot.slot_number}`, "success")
      setVehicleNumber("")
      refetch()
    } catch {
      showToast("Entry failed", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">Vehicle Entry</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Register new vehicle entry and assign the next available slot.</p>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6 rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-8 shadow-xl shadow-slate-900/5 backdrop-blur-sm dark:border-slate-800/70 dark:bg-slate-950/85"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Vehicle Number</label>
            <div className="relative">
              <Car className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="e.g. MH12AB1234"
                className="input-frost pl-12 pr-4"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Available Slots</label>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {availableSlots.length} available
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {availableSlots.map((slot) => (
                <div
                  key={slot.slot_id}
                  className="rounded-3xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-center text-sm font-semibold text-emerald-700 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"
                >
                  {slot.slot_number}
                </div>
              ))}
              {availableSlots.length === 0 && (
                <div className="col-span-full rounded-3xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-center text-sm font-semibold text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                  No slots available
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="frosted-button w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogIn className="h-4 w-4" />
            {loading ? "Processing..." : "Record Entry"}
          </button>
        </form>
      </motion.section>
    </div>
  )
}
