import { motion } from "framer-motion"
import { type LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  color: string
  delay?: number
}

export function StatCard({ title, value, icon: Icon, color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="relative overflow-hidden rounded-[1.5rem] border border-slate-200/70 bg-white/90 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/80"
    >
      <div className={`absolute -right-6 -top-6 h-28 w-28 rounded-full opacity-10 ${color}`} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-4 text-3xl font-bold text-slate-950 dark:text-white">{value}</p>
        </div>
        <div className={`flex h-14 w-14 items-center justify-center rounded-3xl ${color} bg-opacity-20`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      <div className="mt-6 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
        Real-time sensor feed
      </div>
    </motion.div>
  )
}
