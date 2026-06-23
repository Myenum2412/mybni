import type { Metadata } from "next"
import { getServerChapters, getServerUser, getServerProfile } from "@/lib/supabase/server-data"
import ClientEntryForm from "./components/ClientEntryForm"

export const metadata: Metadata = {
  title: "Entry Form",
}

export default async function EntryFormPage() {
  const currentUser = await getServerUser()
  let userRole: string | null = null
  let userChapterId: number | null = null

  if (currentUser) {
    const profile = await getServerProfile(currentUser.id)
    userRole = profile?.role ?? null
    userChapterId = profile?.chapter_id ?? null
  }

  // DC: only fetch their chapter. Org: fetch all.
  const chapters = await getServerChapters()
  const filteredChapters = userRole === "dc" && userChapterId
    ? chapters.filter((c) => c.id === userChapterId)
    : chapters

  return (
    <ClientEntryForm
      chapters={filteredChapters}
      userRole={userRole}
      defaultChapterId={userRole === "dc" ? userChapterId : null}
      currentUser={currentUser ? { id: currentUser.id, email: currentUser.email ?? "", name: (currentUser.user_metadata as any)?.name ?? "" } : null}
    />
  )
}
