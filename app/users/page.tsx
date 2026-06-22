import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import ClientUsers from "./components/ClientUsers"

export const metadata: Metadata = {
  title: "Users",
}

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  // Fetch all created user accounts
  const { data: users } = await supabase
    .from("users")
    .select("*, chapters(name)")
    .order("created_at", { ascending: false })

  // Fetch chapters for the create form
  const { data: chapters } = await supabase
    .from("chapters")
    .select("*")
    .order("id", { ascending: true })

  let currentUser = null
  if (session?.user) {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, role, chapter_id")
      .eq("id", session.user.id)
      .single()
    if (!error && data) {
      currentUser = data
    }
  }

  return (
    <ClientUsers
      users={users ?? []}
      chapters={chapters ?? []}
      currentUser={currentUser}
    />
  )
}
