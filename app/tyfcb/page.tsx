import type { Metadata } from "next"
import { getServerTyfcbs } from "@/lib/supabase/server-data"
import ClientTyfcb from "./components/ClientTyfcb"

export const metadata: Metadata = {
  title: "TYFCB",
}

export default async function TYFCBPage() {
  const tyfcbs = await getServerTyfcbs()
  return <ClientTyfcb tyfcbs={tyfcbs} />
}
