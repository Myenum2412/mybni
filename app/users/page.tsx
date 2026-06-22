import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { getServerChapters, getServerTyfcbs, getServerReferrals, getServerOneAndOnes } from "@/lib/supabase/server-data"
import ClientUsers from "./components/ClientUsers"

export const metadata: Metadata = {
  title: "Users",
}

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  const [chapters, tyfcbs, referrals, oneAndOnes] = await Promise.all([
    getServerChapters(),
    getServerTyfcbs(),
    getServerReferrals(),
    getServerOneAndOnes(),
  ])

  const currentUser = session?.user
    ? {
        id: session.user.id,
        email: session.user.email ?? "",
        role: (session.user.user_metadata as Record<string, string>)?.role ?? "member",
        chapter_id: null as number | null,
      }
    : null

  // Fetch profile for role/chapter_id if user is logged in
  let profile = null
  if (currentUser) {
    const { data } = await supabase
      .from("users")
      .select("id, email, role, chapter_id")
      .eq("id", currentUser.id)
      .single()
    profile = data
  }

  return (
    <ClientUsers
      chapters={chapters}
      tyfcbs={tyfcbs}
      referrals={referrals}
      oneAndOnes={oneAndOnes}
      currentUser={profile ?? currentUser}
    />
  )
}
