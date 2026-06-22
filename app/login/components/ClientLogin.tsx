"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/lib/supabase/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2Icon, EyeIcon, EyeOffIcon, ShieldIcon, CopyIcon, CheckIcon } from "lucide-react"

const SUPERADMIN_EMAIL = "superadmin@bni.com"
const SUPERADMIN_PASSWORD = "SuperAdmin@123"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [showCredentials, setShowCredentials] = useState(false)

  const redirectTo = searchParams.get("redirect") || "/dashboard"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!email || !password) {
      setError("Email and password are required")
      setLoading(false)
      return
    }

    const { error: signInError } = await signIn(email, password)

    if (signInError) {
      setError(signInError)
      setLoading(false)
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  const handleQuickLogin = async () => {
    setError(null)
    setLoading(true)
    setEmail(SUPERADMIN_EMAIL)
    setPassword(SUPERADMIN_PASSWORD)

    // First, try to create superadmin if it doesn't exist
    try {
      await fetch("/api/setup", { method: "POST" })
    } catch {
      // ignore setup errors, try login anyway
    }

    const { error: signInError } = await signIn(SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD)

    if (signInError) {
      setError(signInError)
      setLoading(false)
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 bg-white p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex size-10 items-center justify-center">
              <Image src="/logo.png" alt="BNI Logo" width={40} height={40} priority />
            </div>
            <span className="text-xl font-bold text-red-600">BNI</span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Welcome to BNI</h1>
              <p className="text-sm text-gray-500">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="email" className="text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="border-gray-300 focus:border-red-500 focus:ring-red-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Super Admin Quick Access */}
            <div className="mt-6 pt-6 border-t">
              <button
                onClick={() => setShowCredentials(!showCredentials)}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 w-full justify-center"
              >
                <ShieldIcon className="size-4" />
                <span>Super Admin Access</span>
              </button>

              {showCredentials && (
                <div className="mt-3 rounded-lg border bg-gray-50 p-3 space-y-3">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Default Superadmin Credentials</div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-gray-400 uppercase">Email</div>
                        <div className="text-sm font-mono">{SUPERADMIN_EMAIL}</div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(SUPERADMIN_EMAIL, "email")}
                        className="p-1.5 rounded hover:bg-gray-200"
                        title="Copy email"
                      >
                        {copiedField === "email" ? <CheckIcon className="size-3.5 text-green-600" /> : <CopyIcon className="size-3.5 text-gray-400" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-gray-400 uppercase">Password</div>
                        <div className="text-sm font-mono">{SUPERADMIN_PASSWORD}</div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(SUPERADMIN_PASSWORD, "password")}
                        className="p-1.5 rounded hover:bg-gray-200"
                        title="Copy password"
                      >
                        {copiedField === "password" ? <CheckIcon className="size-3.5 text-green-600" /> : <CopyIcon className="size-3.5 text-gray-400" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    onClick={handleQuickLogin}
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white text-sm"
                  >
                    <ShieldIcon className="mr-2 size-4" />
                    Login as Super Admin
                  </Button>

                  <p className="text-[10px] text-gray-400 text-center">
                    Run migration 004_seed_superadmin.sql in Supabase first to create this account
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="relative hidden bg-red-600 lg:flex lg:items-center lg:justify-center">
        <div className="flex flex-col items-center gap-6 p-10 text-center">
          <Image src="/logo.png" alt="BNI Logo" width={120} height={120} priority className="drop-shadow-lg" />
          <div>
            <h2 className="text-3xl font-bold text-white">Business Network International</h2>
            <p className="mt-2 text-red-100">Grow your business through referrals</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ClientLogin() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2Icon className="size-8 animate-spin text-red-600" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
