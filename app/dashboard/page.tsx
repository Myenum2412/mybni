import type { Metadata } from "next"
import { getServerDashboardStats, getServerRecentActivity, getServerUser, getServerProfile } from "@/lib/supabase/server-data"
import ClientDashboard from "./components/ClientDashboard"

export const metadata: Metadata = {
  title: "Dashboard",
}

export default async function DashboardPage() {
  const currentUser = await getServerUser()
  let userRole: string | null = null
  let userChapterId: number | null = null

  if (currentUser) {
    const profile = await getServerProfile(currentUser.id)
    userRole = profile?.role ?? null
    userChapterId = profile?.chapter_id ?? null
  }

  // Chapter-admin scoped data
  const chapterScope = userRole === "admin" ? userChapterId : null

  const [stats, activities] = await Promise.all([
    getServerDashboardStats(chapterScope),
    getServerRecentActivity(chapterScope),
  ])

  return (
    <ClientDashboard
      stats={stats}
      activities={activities}
      userRole={userRole}
    />
  )
}
