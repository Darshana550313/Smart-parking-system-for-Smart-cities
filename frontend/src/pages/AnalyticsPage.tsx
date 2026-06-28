import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { BarChart3, TrendingUp, TrendingDown, PieChart } from "lucide-react"
import { getAnalytics, getDashboardStats } from "@/lib/api"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts"
import type { AnalyticsData, DashboardStats } from "@/types"

const COLORS = ["#10b981", "#ef4444", "#f59e0b", "#6366f1"]

export function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, statsRes] = await Promise.all([
          getAnalytics(),
          getDashboardStats(),
        ])
        setAnalytics(analyticsRes.data)
        setStats(statsRes.data)
      } catch {
        // handle error
      }
    }
    fetchData()
  }, [])

  const hourlyData = analytics?.hourly_entries.map((entry) => ({
    hour: `${entry.hour}:00`,
    entries: entry.count,
    exits: analytics.hourly_exits.find((e) => e.hour === entry.hour)?.count || 0,
  })) || []

  const slotUsageData = analytics?.slot_usage.map((item) => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: item.count,
  })) || []

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">Analytics Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Parking usage statistics and trends for better operations.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="dashboard-stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-3xl bg-blue-500/10 p-3 text-blue-500">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Entries Today</p>
              <p className="text-3xl font-semibold text-slate-950 dark:text-white">{stats?.vehicles_entered_today || 0}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="dashboard-stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-3xl bg-red-500/10 p-3 text-red-500">
              <TrendingDown className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Exits Today</p>
              <p className="text-3xl font-semibold text-slate-950 dark:text-white">{stats?.vehicles_exited_today || 0}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="dashboard-stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-3xl bg-amber-500/10 p-3 text-amber-500">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Occupancy Rate</p>
              <p className="text-3xl font-semibold text-slate-950 dark:text-white">{stats?.occupancy_percentage || 0}%</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="dashboard-card min-h-[360px]"
        >
          <h3 className="text-lg font-semibold text-slate-950 dark:text-white mb-4">Hourly Entry/Exit Trends</h3>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={hourlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="hour" stroke="#64748B" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
              <YAxis stroke="#64748B" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
              <Tooltip
                cursor={{ stroke: '#CBD5E1', strokeWidth: 1, strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.96)',
                  border: '1px solid rgba(226,232,240,0.75)',
                  borderRadius: '12px',
                }}
              />
              <Area type="monotone" dataKey="entries" stroke="#10b981" fill="#10b981" fillOpacity={0.25} name="Entries" />
              <Area type="monotone" dataKey="exits" stroke="#ef4444" fill="#ef4444" fillOpacity={0.25} name="Exits" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="dashboard-card min-h-[360px]"
        >
          <h3 className="text-lg font-semibold text-slate-950 dark:text-white mb-4">Slot Usage Distribution</h3>
          <ResponsiveContainer width="100%" height={320}>
            <RePieChart>
              <Pie
                data={slotUsageData}
                cx="50%"
                cy="50%"
                innerRadius={64}
                outerRadius={104}
                paddingAngle={5}
                dataKey="value"
              >
                {slotUsageData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.96)',
                  border: '1px solid rgba(226,232,240,0.75)',
                  borderRadius: '12px',
                }}
              />
            </RePieChart>
          </ResponsiveContainer>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {slotUsageData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-3 rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
