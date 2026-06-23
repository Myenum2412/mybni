import type { Metadata } from "next"
import { getServerTyfcbs, getServerReferrals, getServerOneAndOnes, getServerChapters, getServerUser, getServerProfile, getServerChapterMembers, getServerAttendance } from "@/lib/supabase/server-data"
import ClientMembers from "./components/ClientMembers"

export const metadata: Metadata = {
  title: "Member",
}

export default async function MembersPage() {
  const [tyfcbs, referrals, oneAndOnes, chapters] = await Promise.all([
    getServerTyfcbs(),
    getServerReferrals(),
    getServerOneAndOnes(),
    getServerChapters(),
  ])

  // Determine user role
  const currentUser = await getServerUser()
  const profile = currentUser ? await getServerProfile(currentUser.id) : null
  const userRole = profile?.role ?? null
  const userChapterId = profile?.chapter_id ?? null

  // Find member's chapter
  const memberChapter = userChapterId
    ? chapters.find((c) => c.id === userChapterId) ?? null
    : null

  // Pre-fetch attendance data if member role
  let memberMembers: string[] = []
  let memberAttendance: { id: number; chapter_id: number; user_id: string | null; member_name: string; date: string; status: string; created_at: string }[] = []
  if (userRole === "member" && userChapterId && memberChapter) {
    const today = new Date().toISOString().split("T")[0]
    const [members, attendance] = await Promise.all([
      getServerChapterMembers(userChapterId),
      getServerAttendance(userChapterId, today),
    ])
    memberMembers = members
    memberAttendance = attendance
  }

  return (
    <ClientMembers
      tyfcbs={tyfcbs}
      referrals={referrals}
      oneAndOnes={oneAndOnes}
      chapters={chapters}
      userRole={userRole}
      memberChapterId={memberChapter?.id ?? null}
      memberChapterName={memberChapter?.name ?? null}
      initialMembers={memberMembers}
      initialAttendance={memberAttendance}
    />
  )
}
