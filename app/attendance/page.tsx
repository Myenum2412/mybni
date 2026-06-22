import type { Metadata } from "next"
import { getServerChapters, getServerUser, getServerProfile } from "@/lib/supabase/server-data"
import ClientAttendance from "./components/ClientAttendance"

export const metadata: Metadata = {
  title: "Attendance",
}

export default async function AttendancePage() {
  const currentUser = await getServerUser()
  let userRole: string | null = null
  let userChapterId: number | null = null

  if (currentUser) {
    const profile = await getServerProfile(currentUser.id)
    userRole = profile?.role ?? null
    userChapterId = profile?.chapter_id ?? null
  }

  const allChapters = await getServerChapters()

  // Admin: only see their chapter. Superadmin/member: all chapters.
  const chapters = userRole === "admin" && userChapterId
    ? allChapters.filter((c) => c.id === userChapterId)
    : allChapters

  return (
    <ClientAttendance
      chapters={chapters}
      userRole={userRole}
      defaultChapterId={userRole === "admin" ? userChapterId : null}
    />
  )
}
