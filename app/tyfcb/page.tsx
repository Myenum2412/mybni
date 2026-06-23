import type { Metadata } from "next"
import { getServerTyfcbs, getServerUser, getServerProfile } from "@/lib/supabase/server-data"
import ClientTyfcb from "./components/ClientTyfcb"

export const metadata: Metadata = {
  title: "TYFCB",
}

export default async function TYFCBPage() {
  const currentUser = await getServerUser()
  let chapterId: number | null = null
  let userRole: string | null = null

  if (currentUser) {
    const profile = await getServerProfile(currentUser.id)
    userRole = profile?.role ?? null
    chapterId = profile?.chapter_id ?? null
  }

  // DC sees only their chapter; org and others see all
  const scope = userRole === "dc" ? chapterId : null
  const tyfcbs = await getServerTyfcbs(scope)

  return <ClientTyfcb tyfcbs={tyfcbs} userRole={userRole} />
}
