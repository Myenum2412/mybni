import type { Metadata } from "next"
import { getServerOneAndOnes, getServerUser, getServerProfile } from "@/lib/supabase/server-data"
import ClientOneAndOne from "./components/ClientOneAndOne"

export const metadata: Metadata = {
  title: "1 & 1",
}

export default async function OneAndOnePage() {
  const currentUser = await getServerUser()
  let chapterId: number | null = null
  let userRole: string | null = null

  if (currentUser) {
    const profile = await getServerProfile(currentUser.id)
    userRole = profile?.role ?? null
    chapterId = profile?.chapter_id ?? null
  }

  const scope = userRole === "dc" ? chapterId : null
  const oneAndOnes = await getServerOneAndOnes(scope)

  return <ClientOneAndOne oneAndOnes={oneAndOnes} userRole={userRole} />
}
