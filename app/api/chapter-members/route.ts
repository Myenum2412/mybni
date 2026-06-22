import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const chapterId = request.nextUrl.searchParams.get("chapter_id")

  if (!chapterId) {
    return NextResponse.json({ error: "chapter_id required" }, { status: 400 })
  }

  const supabase = await createClient()

  // Get distinct member names from TYFCBs for this chapter
  const { data } = await supabase
    .from("tyfcbs")
    .select("user_name")
    .eq("chapter_id", Number(chapterId))

  const names = new Set<string>()
  if (data) {
    data.forEach((r) => {
      if (r.user_name) names.add(r.user_name)
    })
  }

  // Fallback: include chapter president
  if (names.size === 0) {
    const { data: chapter } = await supabase
      .from("chapters")
      .select("president")
      .eq("id", Number(chapterId))
      .single()
    if (chapter?.president) names.add(chapter.president)
  }

  return NextResponse.json({ members: Array.from(names).sort() })
}
