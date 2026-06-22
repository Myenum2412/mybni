import type { Metadata } from "next"
import { getServerChapters } from "@/lib/supabase/server-data"
import ClientAttendance from "./components/ClientAttendance"

export const metadata: Metadata = {
  title: "Attendance",
}

export default async function AttendancePage() {
  const chapters = await getServerChapters()
  return <ClientAttendance chapters={chapters} />
}
