import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const publicPaths = ["/login", "/auth", "/api/migrate"]
const authPaths = ["/login", "/auth/callback"]

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

  const { data: { session } } = await supabase.auth.getSession()
  const pathname = request.nextUrl.pathname

  // Allow public paths
  const isPublic = publicPaths.some((p) => pathname.startsWith(p))
  const isAuthPath = authPaths.some((p) => pathname.startsWith(p))

  // If user is not authenticated and trying to access protected route
  if (!session && !isPublic) {
    const redirectUrl = new URL("/login", request.url)
    redirectUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated and trying to access login/auth pages, redirect to dashboard
  if (session && isAuthPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Role-based access control for admin routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/settings")) {
    if (session?.user) {
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single()

      if (profile?.role !== "admin" && profile?.role !== "superadmin") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
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
