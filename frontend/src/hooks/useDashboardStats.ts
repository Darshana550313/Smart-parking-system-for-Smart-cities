import { useState, useEffect } from "react"
import { getDashboardStats } from "@/lib/api"
import type { DashboardStats } from "@/types"

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      const res = await getDashboardStats()
      setStats(res.data)
    } catch (err) {
      console.error("Failed to fetch stats:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 5000)
    return () => clearInterval(interval)
  }, [])

  return { stats, loading, refetch: fetchStats }
}
