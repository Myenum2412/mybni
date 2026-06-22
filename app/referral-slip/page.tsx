import type { Metadata } from "next"
import { getServerReferrals } from "@/lib/supabase/server-data"
import ClientReferralSlip from "./components/ClientReferralSlip"

export const metadata: Metadata = {
  title: "Referral Slip",
}

export default async function ReferralSlipPage() {
  const referrals = await getServerReferrals()
  return <ClientReferralSlip referrals={referrals} />
}
