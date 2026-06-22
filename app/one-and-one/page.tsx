import type { Metadata } from "next"
import { getServerOneAndOnes } from "@/lib/supabase/server-data"
import ClientOneAndOne from "./components/ClientOneAndOne"

export const metadata: Metadata = {
  title: "1 & 1",
}

export default async function OneAndOnePage() {
  const oneAndOnes = await getServerOneAndOnes()
  return <ClientOneAndOne oneAndOnes={oneAndOnes} />
}
