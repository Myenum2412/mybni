import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { getServerChapters, getServerAttendance, getServerChapterMembers } from "@/lib/supabase/server-data"
import ClientAttendanceOnly from "./components/ClientAttendanceOnly"

export const metadata: Metadata = {
  title: "Attendance",
}

export default async function AttendanceOnlyPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  let userRole: string | null = null
  let userChapterId: number | null = null
  if (session?.user) {
    const { data } = await supabase.from("users").select("role, chapter_id").eq("id", session.user.id).single()
    userRole = data?.role ?? null
    userChapterId = data?.chapter_id ?? null
  }

  const allChapters = await getServerChapters()
  const chapters = userRole === "admin" && userChapterId
    ? allChapters.filter((c) => c.id === userChapterId)
    : allChapters

  const today = new Date().toISOString().split("T")[0]
  const allAttendance: Record<number, Awaited<ReturnType<typeof getServerAttendance>>> = {}
  const allMembers: Record<number, Awaited<ReturnType<typeof getServerChapterMembers>>> = {}

  await Promise.all(
    chapters.map(async (c) => {
      const [att, mem] = await Promise.all([
        getServerAttendance(c.id, today),
        getServerChapterMembers(c.id),
      ])
      allAttendance[c.id] = att
      allMembers[c.id] = mem
    })
  )

  return (
    <ClientAttendanceOnly
      chapters={chapters}
      initialAttendance={allAttendance}
      initialMembers={allMembers}
      initialDate={today}
      userRole={userRole}
    />
  )
}
