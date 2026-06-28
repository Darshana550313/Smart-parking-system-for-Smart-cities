import { useState, useEffect } from "react"
import { getParkingSlots } from "@/lib/api"
import type { ParkingSlot } from "@/types"

export function useParkingSlots() {
  const [slots, setSlots] = useState<ParkingSlot[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSlots = async () => {
    try {
      const res = await getParkingSlots()
      setSlots(res.data)
    } catch (err) {
      console.error("Failed to fetch slots:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSlots()
    const interval = setInterval(fetchSlots, 3000)
    return () => clearInterval(interval)
  }, [])

  return { slots, loading, refetch: fetchSlots }
}
