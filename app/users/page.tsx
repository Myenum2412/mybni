import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { getServerUser, getServerProfile, getServerChapters } from "@/lib/supabase/server-data"
import ClientUsers from "./components/ClientUsers"

export const metadata: Metadata = {
  title: "Users",
}

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  // Get current user role
  const currentUser = await getServerUser()
  let userRole: string | null = null
  let userChapterId: number | null = null
  if (currentUser) {
    const profile = await getServerProfile(currentUser.id)
    userRole = profile?.role ?? null
    userChapterId = profile?.chapter_id ?? null
  }

  // Admin: only see users from their chapter. Superadmin: see all.
  let usersQuery = supabase
    .from("users")
    .select("*, chapters(name)")
    .order("created_at", { ascending: false })

  if (userRole === "admin" && userChapterId) {
    usersQuery = usersQuery.eq("chapter_id", userChapterId)
  }

  const { data: users } = await usersQuery

  // Only fetch chapters for superadmin (admin doesn't need chapter selector)
  let chapters: Awaited<ReturnType<typeof getServerChapters>> = []
  if (userRole === "superadmin") {
    chapters = await getServerChapters()
  }

  return (
    <ClientUsers
      users={users ?? []}
      chapters={chapters}
      currentUser={session?.user ? { id: session.user.id, email: session.user.email ?? "", role: userRole ?? "", chapter_id: userChapterId } : null}
    />
  )
}
