import type { Metadata } from "next"
import { getServerReferrals, getServerUser, getServerProfile } from "@/lib/supabase/server-data"
import ClientReferralSlip from "./components/ClientReferralSlip"

export const metadata: Metadata = {
  title: "Referral Slip",
}

export default async function ReferralSlipPage() {
  const currentUser = await getServerUser()
  let chapterId: number | null = null
  let userRole: string | null = null

  if (currentUser) {
    const profile = await getServerProfile(currentUser.id)
    userRole = profile?.role ?? null
    chapterId = profile?.chapter_id ?? null
  }

  const scope = userRole === "dc" ? chapterId : null
  const referrals = await getServerReferrals(scope)

  return <ClientReferralSlip referrals={referrals} userRole={userRole} />
}
