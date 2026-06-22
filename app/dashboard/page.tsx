import type { Metadata } from "next"
import { getServerDashboardStats, getServerRecentActivity } from "@/lib/supabase/server-data"
import ClientDashboard from "./components/ClientDashboard"

export const metadata: Metadata = {
  title: "Dashboard",
}

export default async function DashboardPage() {
  const [stats, activities] = await Promise.all([
    getServerDashboardStats(),
    getServerRecentActivity(),
  ])
  return <ClientDashboard stats={stats} activities={activities} />
}
