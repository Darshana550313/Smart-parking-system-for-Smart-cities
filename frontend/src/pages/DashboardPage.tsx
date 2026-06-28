import { motion } from "framer-motion"
import {
  ParkingSquare,
  Car,
  LogIn,
  LogOut,
  Users,
  Percent,
  Activity,
} from "lucide-react"
import { StatCard } from "@/components/StatCard"
import { ParkingSlotGrid } from "@/components/ParkingSlotGrid"
import { useDashboardStats } from "@/hooks/useDashboardStats"
import { useParkingSlots } from "@/hooks/useParkingSlots"
import { simulateSensors } from "@/lib/api"
import { useToast } from "@/context/ToastContext"

export function DashboardPage() {
  const { stats, loading } = useDashboardStats()
  const { slots, refetch } = useParkingSlots()
  const { showToast } = useToast()

  const handleSimulate = async () => {
    try {
      await simulateSensors()
      showToast("Sensors simulated successfully!", "success")
      refetch()
    } catch {
      showToast("Simulation failed", "error")
    }
  }

  const statItems = [
    { title: "Total Slots", value: stats?.total_slots ?? 0, icon: ParkingSquare, color: "bg-blue-500" },
    { title: "Available", value: stats?.available_slots ?? 0, icon: Car, color: "bg-emerald-500" },
    { title: "Occupied", value: stats?.occupied_slots ?? 0, icon: Users, color: "bg-red-500" },
    { title: "Reserved", value: stats?.reserved_slots ?? 0, icon: Activity, color: "bg-amber-500" },
    { title: "Entered Today", value: stats?.vehicles_entered_today ?? 0, icon: LogIn, color: "bg-cyan-500" },
    { title: "Exited Today", value: stats?.vehicles_exited_today ?? 0, icon: LogOut, color: "bg-violet-500" },
    { title: "Currently Parked", value: stats?.current_vehicles_parked ?? 0, icon: Car, color: "bg-orange-500" },
    { title: "Occupancy %", value: `${stats?.occupancy_percentage ?? 0}%`, icon: Percent, color: "bg-pink-500" },
  ]

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time parking monitoring</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((item, index) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={item.value}
            icon={item.icon}
            color={item.color}
            delay={index * 0.05}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl border border-border bg-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Parking Slot Grid</h2>
          <button
            onClick={handleSimulate}
            className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
          >
            Simulate Sensors
          </button>
        </div>
        <ParkingSlotGrid slots={slots} />
      </motion.div>
    </div>
  )
}
