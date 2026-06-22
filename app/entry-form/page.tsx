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

  // Admin: only fetch their chapter. Public/superadmin: fetch all.
  const chapters = await getServerChapters()
  const filteredChapters = userRole === "admin" && userChapterId
    ? chapters.filter((c) => c.id === userChapterId)
    : chapters

  return (
    <ClientEntryForm
      chapters={filteredChapters}
      userRole={userRole}
      defaultChapterId={userRole === "admin" ? userChapterId : null}
      currentUser={currentUser ? { id: currentUser.id, email: currentUser.email ?? "", name: (currentUser.user_metadata as any)?.name ?? "" } : null}
    />
  )
}
