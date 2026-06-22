import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPERADMIN_EMAIL = "superadmin@bni.com"
const SUPERADMIN_PASSWORD = "SuperAdmin@123"
const SUPERADMIN_NAME = "Super Admin"

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if superadmin already exists
    const { data: existing } = await supabase
      .from("users")
      .select("id, email, role")
      .eq("email", SUPERADMIN_EMAIL)
      .single()

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Superadmin already exists",
        user: { email: existing.email, role: existing.role },
      })
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: SUPERADMIN_EMAIL,
      password: SUPERADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { name: SUPERADMIN_NAME },
    })

    if (authError) {
      // Check if auth user exists but profile doesn't
      if (authError.message?.includes("already been registered")) {
        // Try to find the auth user and create profile
        const { data: authUser } = await supabase.auth.admin.listUsers()
        const found = authUser?.users?.find((u: any) => u.email === SUPERADMIN_EMAIL)
        if (found) {
          await supabase.from("users").insert({
            id: found.id,
            email: SUPERADMIN_EMAIL,
            name: SUPERADMIN_NAME,
            role: "superadmin",
            chapter_id: null,
          })
          return NextResponse.json({
            success: true,
            message: "Superadmin profile created (auth user already existed)",
            user: { email: SUPERADMIN_EMAIL, role: "superadmin" },
          })
        }
      }
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // Create profile
    if (authData?.user) {
      const { error: profileError } = await supabase.from("users").insert({
        id: authData.user.id,
        email: SUPERADMIN_EMAIL,
        name: SUPERADMIN_NAME,
        role: "superadmin",
        chapter_id: null,
      })

      if (profileError) {
        return NextResponse.json({
          error: `Auth user created but profile failed: ${profileError.message}`,
        }, { status: 400 })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Superadmin created successfully",
      user: { email: SUPERADMIN_EMAIL, role: "superadmin" },
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: existing } = await supabase
      .from("users")
      .select("id, email, name, role")
      .eq("email", SUPERADMIN_EMAIL)
      .single()

    return NextResponse.json({
      exists: !!existing,
      user: existing ?? null,
    })
  } catch {
    return NextResponse.json({ exists: false, user: null })
  }
}
