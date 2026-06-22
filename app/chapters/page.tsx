import type { Metadata } from "next"
import { getServerChapters } from "@/lib/supabase/server-data"
import ClientChapters from "./components/ClientChapters"

export const metadata: Metadata = {
  title: "Chapters",
}

export default async function ChaptersPage() {
  const chapters = await getServerChapters()
  return <ClientChapters chapters={chapters} />
}
