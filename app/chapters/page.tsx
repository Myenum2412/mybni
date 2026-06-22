import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { getServerChapters } from "@/lib/supabase/server-data"
import ClientChapters from "./components/ClientChapters"

export const metadata: Metadata = {
  title: "Chapters",
}

export default async function ChaptersPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const chapters = await getServerChapters()

  let userRole: string | null = null
  if (session?.user) {
    const { data } = await supabase.from("users").select("role").eq("id", session.user.id).single()
    userRole = data?.role ?? null
  }

  return <ClientChapters chapters={chapters} userRole={userRole} />
}
