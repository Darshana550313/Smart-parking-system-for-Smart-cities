import { useState } from "react"
import { motion } from "framer-motion"
import { LogOut, Search, Clock } from "lucide-react"
import { vehicleExit, searchVehicles } from "@/lib/api"
import { useToast } from "@/context/ToastContext"
import { formatDuration } from "@/lib/utils"
import type { Vehicle } from "@/types"

export function VehicleExitPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    try {
      const res = await searchVehicles(searchQuery)
      const active = res.data.find((v: Vehicle) => v.status === "active")
      if (active) {
        setVehicle(active)
      } else {
        showToast("No active vehicle found", "error")
        setVehicle(null)
      }
    } catch {
      showToast("Search failed", "error")
    }
  }

  const handleExit = async () => {
    if (!vehicle) return
    setLoading(true)
    try {
      const res = await vehicleExit({ vehicle_number: vehicle.vehicle_number })
      showToast(
        `Vehicle ${vehicle.vehicle_number} exited. Duration: ${formatDuration(res.data.duration)}`,
        "success"
      )
      setVehicle(null)
      setSearchQuery("")
    } catch {
      showToast("Exit failed", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">Vehicle Exit</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Process vehicle exit with smart lookup and streamlined checkout.</p>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6 rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-8 shadow-xl shadow-slate-900/5 backdrop-blur-sm dark:border-slate-800/70 dark:bg-slate-950/85"
      >
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vehicle number..."
              className="input-frost pl-12 pr-4"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <button
            onClick={handleSearch}
            className="frosted-button w-full sm:w-auto"
          >
            Search
          </button>
        </div>

        {vehicle && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-[1.5rem] border border-slate-200/70 bg-slate-50/90 p-6 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/85"
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Vehicle Number</p>
                <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{vehicle.vehicle_number}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Slot</p>
                <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{vehicle.slot_number}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Entry Time</p>
                <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{new Date(vehicle.entry_time).toLocaleTimeString()}</p>
              </div>
            </div>
            <button
              onClick={handleExit}
              disabled={loading}
              className="mt-6 frosted-button justify-center bg-red-500 hover:bg-red-600"
            >
              <LogOut className="h-4 w-4" />
              {loading ? "Processing..." : "Process Exit"}
            </button>
          </motion.div>
        )}
      </motion.section>
    </div>
  )
}
