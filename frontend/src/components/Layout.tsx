import { Outlet } from "react-router-dom"
import { motion } from "framer-motion"
import { Sidebar } from "./Sidebar"
import { TopBar } from "./TopBar"

export function Layout() {
  return (
    <div className="flex min-h-screen bg-background text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col overflow-hidden">
        <TopBar />
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.32 }}
          className="flex-1 overflow-auto bg-background/70 dark:bg-slate-950/90 p-5 sm:p-6 lg:p-8"
        >
          <div className="mx-auto w-full max-w-[1700px]">
            <Outlet />
          </div>
        </motion.main>
      </div>
    </div>
  )
}
