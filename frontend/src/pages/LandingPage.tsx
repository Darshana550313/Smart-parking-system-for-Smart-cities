import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ParkingSquare, ArrowRight, Car, Wifi, Shield, BarChart3, MapPin } from "lucide-react"

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <ParkingSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Smart Parking</h1>
            <p className="text-[10px] text-white/50">Smart Cities</p>
          </div>
        </div>
        <Link
          to="/dashboard"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 text-sm font-medium hover:bg-blue-500/30 transition-colors"
        >
          Launch System <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
            <Wifi className="h-3 w-3" /> IoT Enabled Smart City Solution
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Smart Parking System
            <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              for Smart Cities
            </span>
          </h1>
          <p className="mt-6 text-lg text-white/60 max-w-2xl mx-auto">
            A complete IoT-based parking management solution featuring real-time slot monitoring,
            automated vehicle entry/exit, smart booking system, and comprehensive analytics.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
            >
              <Car className="h-5 w-5" /> Enter Dashboard
            </Link>
            <Link
              to="/booking"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all"
            >
              <ParkingSquare className="h-5 w-5" /> Book a Slot
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-20 max-w-5xl w-full"
        >
          {[
            { icon: Car, title: "Real-Time Monitoring", desc: "Live parking slot status updates" },
            { icon: Shield, title: "Automated Entry/Exit", desc: "Smart gate control system" },
            { icon: MapPin, title: "Slot Booking", desc: "Reserve parking in advance" },
            { icon: BarChart3, title: "Analytics", desc: "Comprehensive usage reports" },
          ].map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors"
              >
                <Icon className="h-8 w-8 text-blue-400 mb-4" />
                <h3 className="text-sm font-semibold text-white">{feature.title}</h3>
                <p className="text-xs text-white/50 mt-2">{feature.desc}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </main>

      <footer className="px-6 py-4 border-t border-white/5 text-center text-xs text-white/30">
        Smart Parking System for Smart Cities | SmartBridge Internship Project
      </footer>
    </div>
  )
}
