import type { Metadata } from "next"
import { getServerChapters, getServerAttendance, getServerChapterMembers } from "@/lib/supabase/server-data"
import ClientAttendanceOnly from "./components/ClientAttendanceOnly"

export const metadata: Metadata = {
  title: "Attendance",
}

export default async function AttendanceOnlyPage() {
  const chapters = await getServerChapters()

  // Pre-fetch all attendance + members for today for all chapters
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
    />
  )
}
