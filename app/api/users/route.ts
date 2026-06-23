import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error("Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  }
  return createClient(url, key)
}

// ── CREATE user ──
export async function POST(request: Request) {
  try {
    const { name, email, password, chapterId, role } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (authData?.user) {
      const { error: profileError } = await supabase
        .from("users")
        .insert({
          id: authData.user.id,
          email,
          name,
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

// ── UPDATE user ──
export async function PUT(request: Request) {
  try {
    const { id, name, email, password, chapterId, role } = await request.json()

    if (!id || !name || !email) {
      return NextResponse.json({ error: "ID, name, and email are required" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // Update auth user
    const authUpdates: Record<string, string> = { email }
    if (password) authUpdates.password = password

    const { error: authError } = await supabase.auth.admin.updateUserById(id, authUpdates)
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // Update profile
    const { error: profileError } = await supabase
      .from("users")
      .update({
        name,
        email,
        role: role || "member",
        chapter_id: chapterId ? Number(chapterId) : null,
      })
      .eq("id", id)

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: "User updated successfully" })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// ── DELETE user ──
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // Delete auth user (also cascades to users table via FK, but we do it explicitly too)
    const { error: authError } = await supabase.auth.admin.deleteUser(id)
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // Explicitly delete profile (in case FK isn't set up yet)
    await supabase.from("users").delete().eq("id", id)

    return NextResponse.json({ success: true, message: "User deleted successfully" })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
