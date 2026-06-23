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

  // DC: only see their chapter. Org: all chapters.
  const chapters = userRole === "dc" && userChapterId
    ? allChapters.filter((c) => c.id === userChapterId)
    : allChapters

  return (
    <ClientAttendance
      chapters={chapters}
      userRole={userRole}
      defaultChapterId={userRole === "dc" ? userChapterId : null}
    />
  )
}
