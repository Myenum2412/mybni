import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const { name, email, password, chapterId, role } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // Create user profile
    if (authData?.user) {
      const { error: profileError } = await supabase
        .from("users")
        .insert({
          id: authData.user.id,
          email,
          role: role || "member",
          chapter_id: chapterId ? Number(chapterId) : null,
        })

      if (profileError) {
        return NextResponse.json({ error: `Auth user created but profile failed: ${profileError.message}` }, { status: 400 })
      }
    }

    return NextResponse.json({ success: true, message: "User created successfully" })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
