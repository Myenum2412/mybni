import { createServerClient } from "@supabase/ssr"
import { NextResponse, NextRequest } from "next/server"

const publicPaths = ["/login", "/auth", "/api/migrate", "/api/users", "/entry-form"]
const authPaths = ["/login", "/auth/callback"]

// Paths admin role cannot access (superadmin-only)
const adminBlockedPaths = ["/users", "/admin", "/settings", "/members"]

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  const isPublic = publicPaths.some((p) => pathname.startsWith(p))
  const isAuthPath = authPaths.some((p) => pathname.startsWith(p))

  // Unauthenticated → login
  if (!user && !isPublic) {
    const redirectUrl = new URL("/login", request.url)
    redirectUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Authenticated on auth pages → dashboard
  if (user && isAuthPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Role-based route protection
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    const role = profile?.role ?? null

    // Admin: block superadmin-only paths
    if (role === "admin") {
      if (adminBlockedPaths.some((p) => pathname.startsWith(p))) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }

    // Member: only allow specific paths
    if (role === "member") {
      const allowedPaths = ["/dashboard", "/members", "/attendance", "/tyfcb", "/referral-slip", "/one-and-one", "/entry-form", "/api", "/settings"]
      const isAllowed = allowedPaths.some((p) => pathname.startsWith(p))
      if (!isAllowed) {
        return NextResponse.redirect(new URL("/members", request.url))
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
