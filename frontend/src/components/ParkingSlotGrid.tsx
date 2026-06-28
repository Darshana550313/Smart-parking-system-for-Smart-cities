import { motion } from "framer-motion"
import { Car, Clock, Wrench } from "lucide-react"
import type { ParkingSlot } from "@/types"

interface ParkingSlotGridProps {
  slots: ParkingSlot[]
}

const statusConfig = {
  available: {
    color: "from-emerald-500 to-emerald-400",
    ring: "border-emerald-500/30 bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-300",
    icon: null,
    label: "Available",
  },
  occupied: {
    color: "from-red-500 to-rose-500",
    ring: "border-red-500/30 bg-red-500/10",
    text: "text-red-600 dark:text-red-300",
    icon: Car,
    label: "Occupied",
  },
  reserved: {
    color: "from-amber-500 to-orange-400",
    ring: "border-amber-500/30 bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-300",
    icon: Clock,
    label: "Reserved",
  },
  maintenance: {
    color: "from-slate-500 to-slate-400",
    ring: "border-slate-500/30 bg-slate-500/10",
    text: "text-slate-600 dark:text-slate-300",
    icon: Wrench,
    label: "Maintenance",
  },
}

export function ParkingSlotGrid({ slots }: ParkingSlotGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {slots.map((slot, index) => {
        const config = statusConfig[slot.status]
        const Icon = config.icon

        return (
          <motion.div
            key={slot.slot_id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.35 }}
            whileHover={{ y: -6, scale: 1.02 }}
            className={`group relative overflow-hidden rounded-[1.5rem] border border-slate-200/70 bg-white/90 p-5 text-center shadow-xl shadow-slate-900/5 backdrop-blur-sm transition duration-200 hover:border-slate-300 dark:border-slate-800/70 dark:bg-slate-950/85`}
          >
            <div className={`absolute inset-x-6 top-0 h-2 rounded-full bg-gradient-to-r ${config.color}`} />
            <div className={`mx-auto mt-4 flex h-16 w-16 items-center justify-center rounded-full border ${config.ring} bg-gradient-to-br ${config.color} bg-opacity-20 text-white shadow-lg`}> 
              {Icon ? <Icon className="h-6 w-6" /> : <div className="h-3.5 w-3.5 rounded-full bg-white/90" />}
            </div>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Slot</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{slot.slot_number}</p>
            <p className={`mt-3 text-sm font-semibold ${config.text}`}>{config.label}</p>
            <div className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${config.ring} ${config.text}`}>Live</div>
          </motion.div>
        )
      })}
    </div>
  )
}
