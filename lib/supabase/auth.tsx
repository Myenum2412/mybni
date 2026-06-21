"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"

interface AuthUser {
  id: string
  email: string
  role: string
  chapter_id: number | null
}

interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  refreshUser: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchUserProfile = useCallback(async (userId: string, userEmail: string) => {
    const { data: profile } = await supabase
      .from("users")
      .select("id, email, role, chapter_id")
      .eq("id", userId)
      .single()

    if (profile) {
      setUser({
        id: profile.id,
        email: profile.email,
        role: profile.role || "member",
        chapter_id: profile.chapter_id,
      })
    } else {
      // Create user profile if doesn't exist
      const { data: newProfile } = await supabase
        .from("users")
        .insert({ id: userId, email: userEmail, role: "member" })
        .select("id, email, role, chapter_id")
        .single()

      if (newProfile) {
        setUser({
          id: newProfile.id,
          email: newProfile.email,
          role: newProfile.role || "member",
          chapter_id: newProfile.chapter_id,
        })
      }
    }
  }, [supabase])

  const refreshUser = useCallback(async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession()
    setSession(currentSession ?? null)

    if (currentSession?.user) {
      await fetchUserProfile(currentSession.user.id, currentSession.user.email ?? "")
    } else {
      setUser(null)
    }
    setLoading(false)
  }, [supabase, fetchUserProfile])

  useEffect(() => {
    refreshUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession ?? null)
      if (newSession?.user) {
        await fetchUserProfile(newSession.user.id, newSession.user.email ?? "")
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase, refreshUser, fetchUserProfile])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      return { error: error.message }
    }
    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export function useRequireAuth() {
  const { user, loading } = useAuth()
  return { user, loading, isAuthenticated: !!user }
}
