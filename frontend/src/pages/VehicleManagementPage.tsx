import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Car, Search, History, Activity } from "lucide-react"
import { getActiveVehicles, getVehicleHistory, searchVehicles } from "@/lib/api"
import { useToast } from "@/context/ToastContext"
import { formatDate, formatDuration } from "@/lib/utils"
import type { Vehicle } from "@/types"

export function VehicleManagementPage() {
  const [activeTab, setActiveTab] = useState<"active" | "history">("active")
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const fetchVehicles = async () => {
    try {
      const res = activeTab === "active" ? await getActiveVehicles() : await getVehicleHistory()
      setVehicles(res.data)
    } catch {
      // handle error
    }
  }

  useEffect(() => {
    fetchVehicles()
  }, [activeTab])

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchVehicles()
      return
    }
    try {
      const res = await searchVehicles(searchQuery)
      setVehicles(res.data)
    } catch {
      // handle error
    }
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">Vehicle Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Track active vehicles and historical parking records in one place.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-8 shadow-xl shadow-slate-900/5 backdrop-blur-sm dark:border-slate-800/70 dark:bg-slate-950/85"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab("active")}
              className={`flex items-center gap-2 rounded-3xl px-4 py-3 text-sm font-semibold transition ${
                activeTab === "active"
                  ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <Activity className="h-4 w-4" /> Active
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 rounded-3xl px-4 py-3 text-sm font-semibold transition ${
                activeTab === "history"
                  ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <History className="h-4 w-4" /> History
            </button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-[220px]">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="input-frost pl-11"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              className="frosted-button"
            >
              Search
            </button>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="text-left py-3 px-2">ID</th>
                <th className="text-left py-3 px-2">Vehicle Number</th>
                <th className="text-left py-3 px-2">Slot</th>
                <th className="text-left py-3 px-2">Entry Time</th>
                {activeTab === "history" && (
                  <>
                    <th className="text-left py-3 px-2">Exit Time</th>
                    <th className="text-left py-3 px-2">Duration</th>
                  </>
                )}
                <th className="text-left py-3 px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <motion.tr
                  key={vehicle.vehicle_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-slate-200/70 transition-colors hover:bg-slate-50 dark:border-slate-800/70 dark:hover:bg-slate-900"
                >
                  <td className="py-3 px-2 text-slate-950 dark:text-slate-100">#{vehicle.vehicle_id}</td>
                  <td className="py-3 px-2 text-slate-950 dark:text-slate-100 font-medium">{vehicle.vehicle_number}</td>
                  <td className="py-3 px-2 text-slate-950 dark:text-slate-100">{vehicle.slot_number}</td>
                  <td className="py-3 px-2 text-slate-500 dark:text-slate-400">{formatDate(vehicle.entry_time)}</td>
                  {activeTab === "history" && (
                    <>
                      <td className="py-3 px-2 text-slate-500 dark:text-slate-400">{vehicle.exit_time ? formatDate(vehicle.exit_time) : "N/A"}</td>
                      <td className="py-3 px-2 text-slate-500 dark:text-slate-400">{formatDuration(vehicle.parking_duration)}</td>
                    </>
                  )}
                  <td className="py-3 px-2">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      vehicle.status === "active"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-blue-500/10 text-blue-500"
                    }`}>
                      {vehicle.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
              {vehicles.length === 0 && (
                <tr>
                  <td colSpan={activeTab === "history" ? 7 : 5} className="py-8 text-center text-slate-500 dark:text-slate-400">
                    No vehicles found
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
