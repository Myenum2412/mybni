import type { Metadata } from "next"
import { getServerDashboardStats, getServerRecentActivity, getServerUser, getServerProfile, getServerChapters } from "@/lib/supabase/server-data"
import ClientDashboard from "./components/ClientDashboard"

export const metadata: Metadata = {
  title: "Dashboard",
}

export default async function DashboardPage() {
  const [stats, activities, currentUser] = await Promise.all([
    getServerDashboardStats(),
    getServerRecentActivity(),
    getServerUser(),
  ])

  let userRole: string | null = null
  let userChapterId: number | null = null
  if (currentUser) {
    const profile = await getServerProfile(currentUser.id)
    userRole = profile?.role ?? null
    userChapterId = profile?.chapter_id ?? null
  }

  // Filter activities for admin role — show only their chapter
  let filteredActivities = activities
  if (userRole === "admin" && userChapterId) {
    const chapters = await getServerChapters()
    const chapter = chapters.find((c) => c.id === userChapterId)
    if (chapter) {
      filteredActivities = activities.filter((a) => a.detail?.includes(chapter.name))
    }
  }

  return (
    <ClientDashboard
      stats={stats}
      activities={filteredActivities}
      userRole={userRole}
    />
  )
}
