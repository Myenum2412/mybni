import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { getServerChapters } from "@/lib/supabase/server-data"
import ClientSettings from "./components/ClientSettings"

export const metadata: Metadata = {
  title: "Settings",
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  const chapters = await getServerChapters()

  let profile = null
  if (authUser) {
    const { data } = await supabase
      .from("users")
      .select("id, email, role, chapter_id")
      .eq("id", authUser.id)
      .single()
    profile = data
  }

  // Redirect non-admins could be done here, but keeping consistent with client version
  void profile

  return <ClientSettings chapters={chapters} userRole={profile?.role ?? null} />
}
