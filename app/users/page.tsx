import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { getServerUser, getServerProfile, getServerChapters, getServerUsersWithJoinedData } from "@/lib/supabase/server-data"
import ClientUsers from "./components/ClientUsers"

export const metadata: Metadata = {
  title: "Users",
}

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  // Get current user role
  const currentUser = await getServerUser()
  let userRole: string | null = null
  let userChapterId: number | null = null
  if (currentUser) {
    const profile = await getServerProfile(currentUser.id)
    userRole = profile?.role ?? null
    userChapterId = profile?.chapter_id ?? null
  }

  // DC: only see users from their chapter. Org: see all.
  const chapterScope = userRole === "dc" ? userChapterId : null
  const users = await getServerUsersWithJoinedData(chapterScope)

  const chapters = await getServerChapters()

  return (
    <ClientUsers
      users={users}
      chapters={chapters}
      currentUser={authUser ? { id: authUser.id, email: authUser.email ?? "", role: userRole ?? "", chapter_id: userChapterId } : null}
    />
  )
}
