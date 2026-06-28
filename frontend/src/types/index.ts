export interface ParkingSlot {
  slot_id: number
  slot_number: string
  status: "available" | "occupied" | "reserved" | "maintenance"
  created_at: string
}

export interface Vehicle {
  vehicle_id: number
  vehicle_number: string
  slot_number: string
  entry_time: string
  exit_time: string | null
  status: "active" | "exited"
  parking_duration: number | null
}

export interface Booking {
  booking_id: number
  customer_name: string
  vehicle_number: string
  slot_number: string
  booking_date: string
  booking_status: "pending" | "active" | "completed" | "cancelled"
  created_at: string
}

export interface DashboardStats {
  total_slots: number
  available_slots: number
  occupied_slots: number
  reserved_slots: number
  vehicles_entered_today: number
  vehicles_exited_today: number
  current_vehicles_parked: number
  occupancy_percentage: number
}

export interface AnalyticsData {
  hourly_entries: { hour: string; count: number }[]
  hourly_exits: { hour: string; count: number }[]
  slot_usage: { status: string; count: number }[]
}
