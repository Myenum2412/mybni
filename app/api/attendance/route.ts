import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const chapterId = request.nextUrl.searchParams.get("chapter_id")
  const date = request.nextUrl.searchParams.get("date")

  if (!chapterId || !date) {
    return NextResponse.json(
      { error: "chapter_id and date required" },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("chapter_id", Number(chapterId))
    .eq("date", date)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ attendance: data ?? [] })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { chapter_id, member_name, date, status } = body

    if (!chapter_id || !member_name || !date || !status) {
      return NextResponse.json(
        { error: "Missing required fields: chapter_id, member_name, date, status" },
        { status: 400 }
      )
    }

    if (!["present", "absent"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be 'present' or 'absent'" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("attendance")
      .upsert(
        { chapter_id, member_name, date, status },
        { onConflict: "chapter_id,member_name,date" }
      )
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }
}
