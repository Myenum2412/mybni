import type { Metadata } from "next"
import { getServerChapters } from "@/lib/supabase/server-data"
import ClientEntryForm from "./components/ClientEntryForm"

export const metadata: Metadata = {
  title: "Entry Form",
}

export default async function EntryFormPage() {
  const chapters = await getServerChapters()
  return <ClientEntryForm chapters={chapters} />
}
