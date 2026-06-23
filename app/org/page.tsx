import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { getServerChapters, getServerTyfcbs, getServerReferrals, getServerOneAndOnes } from "@/lib/supabase/server-data"
import ClientAdmin from "./components/ClientAdmin"

export const metadata: Metadata = {
  title: "Org",
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  const [chapters, tyfcbs, referrals, oneAndOnes] = await Promise.all([
    getServerChapters(),
    getServerTyfcbs(),
    getServerReferrals(),
    getServerOneAndOnes(),
  ])

  let userRole: string | null = null
  if (authUser) {
    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", authUser.id)
      .single()
    if (!error) userRole = data?.role ?? null
  }

  return (
    <ClientAdmin
      chaptersCount={chapters.length}
      tyfcbsCount={tyfcbs.length}
      referralsCount={referrals.length}
      oneAndOnesCount={oneAndOnes.length}
      userRole={userRole}
    />
  )
}
