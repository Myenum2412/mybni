import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const ORG_EMAIL = "admin@bni.com"
const ORG_PASSWORD = "admin123"
const ORG_NAME = "Org Admin"

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error("Missing Supabase env vars")
  }
  return createClient(url, key)
}

// GET — check if org user exists
export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const { data } = await supabase
      .from("users")
      .select("id, email, role")
      .eq("role", "org")
      .limit(1)
      .single()

    return NextResponse.json({
      exists: !!data,
      user: data ?? null,
    })
  } catch {
    return NextResponse.json({ exists: false, user: null })
  }
}

// POST — create or promote org user
export async function POST() {
  try {
    const supabase = getSupabaseAdmin()

    // Check if profile already exists (auto-created by auth context as member)
    const { data: existingProfile } = await supabase
      .from("users")
      .select("id, role")
      .eq("email", ORG_EMAIL)
      .single()

    if (existingProfile) {
      // Already has a profile — promote to org if needed
      if (existingProfile.role === "org") {
        return NextResponse.json({
          success: true,
          message: "Org user already exists",
          credentials: { email: ORG_EMAIL, password: "***" },
        })
      }
      const { error: updateErr } = await supabase
        .from("users")
        .update({ role: "org", chapter_id: null, name: ORG_NAME })
        .eq("id", existingProfile.id)
      if (updateErr) {
        return NextResponse.json({ success: false, error: updateErr.message }, { status: 400 })
      }
      return NextResponse.json({
        success: true,
        message: "Existing user promoted to org",
        credentials: { email: ORG_EMAIL },
      })
    }

    // No profile — create auth user + org profile
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: ORG_EMAIL,
      password: ORG_PASSWORD,
      email_confirm: true,
      user_metadata: { name: ORG_NAME },
    })

    if (authError) {
      return NextResponse.json({ success: false, error: authError.message }, { status: 400 })
    }

    if (authData?.user) {
      const { data: newProfile, error: profileError } = await supabase
        .from("users")
        .insert({
          id: authData.user.id,
          email: ORG_EMAIL,
          name: ORG_NAME,
          role: "org",
          chapter_id: null,
        })
        .select("id, email, role")
        .single()

      if (profileError) {
        // Profile insert failed — try upsert as fallback
        if (profileError.code === "23503") {
          // FK issue: auth user not yet propagated, retry insert
          const { data: retryProfile, error: retryError } = await supabase
            .from("users")
            .insert({
              id: authData.user.id,
              email: ORG_EMAIL,
              name: ORG_NAME,
              role: "org",
              chapter_id: null,
            })
            .select("id, email, role")
            .single()
          if (retryError) {
            return NextResponse.json({ success: false, error: `Profile creation failed: ${retryError.message}` }, { status: 400 })
          }
          return NextResponse.json({
            success: true,
            message: "Org user created (retry)",
            credentials: { email: ORG_EMAIL, password: ORG_PASSWORD },
            user: retryProfile,
          })
        }
        return NextResponse.json({ success: false, error: `Auth user created but profile failed: ${profileError.message}` }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        message: "Org user created successfully",
        credentials: { email: ORG_EMAIL, password: ORG_PASSWORD },
        user: newProfile,
      })
    }

    return NextResponse.json({ success: false, error: "No auth user returned" }, { status: 500 })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
