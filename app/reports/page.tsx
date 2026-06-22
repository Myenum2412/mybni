import type { Metadata } from "next"
import { getServerUser, getServerProfile, getServerTyfcbs, getServerReferrals, getServerOneAndOnes, getServerChapters, getServerAttendance, getServerChapterMembers } from "@/lib/supabase/server-data"
import ClientReports from "./components/ClientReports"

export const metadata: Metadata = {
  title: "Reports",
}

export default async function ReportsPage() {
  const currentUser = await getServerUser()
  const profile = currentUser ? await getServerProfile(currentUser.id) : null
  const userRole = profile?.role ?? null
  const userChapterId = profile?.chapter_id ?? null

  const [tyfcbs, referrals, oneAndOnes, chapters] = await Promise.all([
    getServerTyfcbs(),
    getServerReferrals(),
    getServerOneAndOnes(),
    getServerChapters(),
  ])

  // Resolve admin's chapter name
  let chapterName: string | null = null
  let chapterTyfcbs = tyfcbs
  let chapterReferrals = referrals
  let chapterOneAndOnes = oneAndOnes

  if (userRole === "admin" && userChapterId) {
    const chapter = chapters.find((c) => c.id === userChapterId)
    if (chapter) {
      chapterName = chapter.name
      chapterTyfcbs = tyfcbs.filter((t) => t.chapter_id === userChapterId)
      chapterReferrals = referrals.filter((r) => r.chapter_id === userChapterId)
      chapterOneAndOnes = oneAndOnes.filter((o) => o.chapter_id === userChapterId)
    }
  }

  // Calculate attendance summary for admin chapter
  let attendanceSummary: { date: string; present: number; total: number }[] = []
  if (userRole === "admin" && userChapterId) {
    const members = await getServerChapterMembers(userChapterId)
    // Get last 7 days attendance
    const dates: string[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      dates.push(d.toISOString().split("T")[0])
    }
    const attendanceRecords = await Promise.all(
      dates.map((date) => getServerAttendance(userChapterId, date))
    )
    attendanceSummary = dates.map((date, idx) => {
      const records = attendanceRecords[idx]
      const present = records.filter((r) => r.status === "present").length
      return { date, present, total: members.length }
    })
  }

  // Summary stats
  let totalRevenue = 0
  chapterTyfcbs.forEach((t) => {
    const amount = parseFloat((t.amount || "0").replace(/[₹,]/g, ""))
    if (!isNaN(amount)) totalRevenue += amount
  })

  const activeReferrals = chapterReferrals.filter((r) => r.referral_status !== "Closed").length

  return (
    <ClientReports
      tyfcbs={chapterTyfcbs}
      referrals={chapterReferrals}
      oneAndOnes={chapterOneAndOnes}
      chapterName={chapterName}
      userRole={userRole}
      stats={{
        totalTyfcbs: chapterTyfcbs.length,
        activeReferrals,
        totalMeetings: chapterOneAndOnes.length,
        totalRevenue: `₹${totalRevenue.toLocaleString()}`,
      }}
      attendanceSummary={attendanceSummary}
    />
  )
}
