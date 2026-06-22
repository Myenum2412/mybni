import type { Metadata } from "next"
import { getServerTyfcbs, getServerReferrals, getServerOneAndOnes, getServerChapters } from "@/lib/supabase/server-data"
import ClientMembers from "./components/ClientMembers"

export const metadata: Metadata = {
  title: "Members",
}

export default async function MembersPage() {
  const [tyfcbs, referrals, oneAndOnes, chapters] = await Promise.all([
    getServerTyfcbs(),
    getServerReferrals(),
    getServerOneAndOnes(),
    getServerChapters(),
  ])

  return (
    <ClientMembers
      tyfcbs={tyfcbs}
      referrals={referrals}
      oneAndOnes={oneAndOnes}
      chapters={chapters}
    />
  )
}
