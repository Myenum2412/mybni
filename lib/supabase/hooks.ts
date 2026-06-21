"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type {
  Chapter,
  Tyfcb,
  Referral,
  OneAndOne,
  TyfcbInsert,
  ReferralInsert,
  OneAndOneInsert,
  ChapterInsert,
} from "@/lib/supabase/database.types"

// ── Chapters ──────────────────────────────────────────────

export function useChapters() {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchChapters = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("chapters")
      .select("*")
      .order("id", { ascending: true })
    if (!error && data) setChapters(data)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchChapters()
  }, [fetchChapters])

  const addChapter = async (chapter: ChapterInsert) => {
    const { data, error } = await supabase
      .from("chapters")
      .insert(chapter)
      .select()
      .single()
    if (!error && data) {
      setChapters((prev) => [...prev, data])
    }
    return { data, error }
  }

  const updateChapter = async (id: number, updates: Partial<ChapterInsert>) => {
    const { data, error } = await supabase
      .from("chapters")
      .update(updates)
      .eq("id", id)
      .select()
      .single()
    if (!error && data) {
      setChapters((prev) => prev.map((c) => (c.id === id ? data : c)))
    }
    return { data, error }
  }

  const deleteChapter = async (id: number) => {
    const { error } = await supabase.from("chapters").delete().eq("id", id)
    if (!error) {
      setChapters((prev) => prev.filter((c) => c.id !== id))
    }
    return { error }
  }

  return { chapters, loading, addChapter, updateChapter, deleteChapter, refetch: fetchChapters }
}

// ── TYFCBs ────────────────────────────────────────────────

export function useTyfcbs() {
  const [tyfcbs, setTyfcbs] = useState<Tyfcb[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchTyfcbs = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("tyfcbs")
      .select("*, chapters(name)")
      .order("created_at", { ascending: false })
    if (!error && data) setTyfcbs(data as Tyfcb[])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchTyfcbs()
  }, [fetchTyfcbs])

  const addTyfcb = async (tyfcb: TyfcbInsert) => {
    const { data, error } = await supabase
      .from("tyfcbs")
      .insert(tyfcb)
      .select()
      .single()
    if (!error && data) {
      setTyfcbs((prev) => [data, ...prev])
    }
    return { data, error }
  }

  const updateTyfcb = async (id: number, updates: Partial<TyfcbInsert>) => {
    const { data, error } = await supabase
      .from("tyfcbs")
      .update(updates)
      .eq("id", id)
      .select()
      .single()
    if (!error && data) {
      setTyfcbs((prev) => prev.map((t) => (t.id === id ? data : t)))
    }
    return { data, error }
  }

  const deleteTyfcb = async (id: number) => {
    const { error } = await supabase.from("tyfcbs").delete().eq("id", id)
    if (!error) {
      setTyfcbs((prev) => prev.filter((t) => t.id !== id))
    }
    return { error }
  }

  return { tyfcbs, loading, addTyfcb, updateTyfcb, deleteTyfcb, refetch: fetchTyfcbs }
}

// ── Referrals ─────────────────────────────────────────────

export function useReferrals() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchReferrals = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("referrals")
      .select("*, chapters(name)")
      .order("created_at", { ascending: false })
    if (!error && data) setReferrals(data as Referral[])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchReferrals()
  }, [fetchReferrals])

  const addReferral = async (referral: ReferralInsert) => {
    const { data, error } = await supabase
      .from("referrals")
      .insert(referral)
      .select()
      .single()
    if (!error && data) {
      setReferrals((prev) => [data, ...prev])
    }
    return { data, error }
  }

  const updateReferral = async (id: number, updates: Partial<ReferralInsert>) => {
    const { data, error } = await supabase
      .from("referrals")
      .update(updates)
      .eq("id", id)
      .select()
      .single()
    if (!error && data) {
      setReferrals((prev) => prev.map((r) => (r.id === id ? data : r)))
    }
    return { data, error }
  }

  const deleteReferral = async (id: number) => {
    const { error } = await supabase.from("referrals").delete().eq("id", id)
    if (!error) {
      setReferrals((prev) => prev.filter((r) => r.id !== id))
    }
    return { error }
  }

  return { referrals, loading, addReferral, updateReferral, deleteReferral, refetch: fetchReferrals }
}

// ── 1 & 1s ────────────────────────────────────────────────

export function useOneAndOnes() {
  const [oneAndOnes, setOneAndOnes] = useState<OneAndOne[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchOneAndOnes = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("one_and_ones")
      .select("*, chapters(name)")
      .order("created_at", { ascending: false })
    if (!error && data) setOneAndOnes(data as OneAndOne[])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchOneAndOnes()
  }, [fetchOneAndOnes])

  const addOneAndOne = async (oneAndOne: OneAndOneInsert) => {
    const { data, error } = await supabase
      .from("one_and_ones")
      .insert(oneAndOne)
      .select()
      .single()
    if (!error && data) {
      setOneAndOnes((prev) => [data, ...prev])
    }
    return { data, error }
  }

  const updateOneAndOne = async (id: number, updates: Partial<OneAndOneInsert>) => {
    const { data, error } = await supabase
      .from("one_and_ones")
      .update(updates)
      .eq("id", id)
      .select()
      .single()
    if (!error && data) {
      setOneAndOnes((prev) => prev.map((o) => (o.id === id ? data : o)))
    }
    return { data, error }
  }

  const deleteOneAndOne = async (id: number) => {
    const { error } = await supabase.from("one_and_ones").delete().eq("id", id)
    if (!error) {
      setOneAndOnes((prev) => prev.filter((o) => o.id !== id))
    }
    return { error }
  }

  return { oneAndOnes, loading, addOneAndOne, updateOneAndOne, deleteOneAndOne, refetch: fetchOneAndOnes }
}

// ── Dashboard Stats ──────────────────────────────────────

export function useDashboardStats() {
  const [stats, setStats] = useState({
    totalTyfcbs: 0,
    activeReferrals: 0,
    totalMeetings: 0,
    totalRevenue: "$0",
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchStats = useCallback(async () => {
    setLoading(true)

    const [tyfcbsResult, referralsResult, meetingsResult] = await Promise.all([
      supabase.from("tyfcbs").select("amount", { count: "exact" }),
      supabase.from("referrals").select("id", { count: "exact", head: true }).neq("referral_status", "Closed"),
      supabase.from("one_and_ones").select("id", { count: "exact", head: true }),
    ])

    // Calculate total revenue from TYFCBs
    let totalRevenue = 0
    if (tyfcbsResult.data) {
      tyfcbsResult.data.forEach((t) => {
        const amount = parseFloat((t.amount || "0").replace(/[$,]/g, ""))
        if (!isNaN(amount)) totalRevenue += amount
      })
    }

    setStats({
      totalTyfcbs: tyfcbsResult.count || 0,
      activeReferrals: referralsResult.count || 0,
      totalMeetings: meetingsResult.count || 0,
      totalRevenue: `$${totalRevenue.toLocaleString()}`,
    })
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, refetch: fetchStats }
}

// ── Recent Activity ───────────────────────────────────────

export function useRecentActivity() {
  const [activities, setActivities] = useState<
    { id: number; type: string; member: string; detail: string; status: string; date: string }[]
  >([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchActivity = useCallback(async () => {
    setLoading(true)

    const [tyfcbsResult, referralsResult, oneAndOnesResult] = await Promise.all([
      supabase.from("tyfcbs").select("*").order("created_at", { ascending: false }).limit(5),
      supabase.from("referrals").select("*").order("created_at", { ascending: false }).limit(5),
      supabase.from("one_and_ones").select("*").order("created_at", { ascending: false }).limit(5),
    ])

    const allActivities: { id: number; type: string; member: string; detail: string; status: string; date: string; created_at: string }[] = []

    if (tyfcbsResult.data) {
      tyfcbsResult.data.forEach((t) => {
        allActivities.push({
          id: t.id,
          type: "TYFCB",
          member: t.user_name,
          detail: `Closed ${t.amount} ${t.business_type} deal`,
          status: "Closed",
          date: new Date(t.created_at).toISOString().split("T")[0],
          created_at: t.created_at,
        })
      })
    }

    if (referralsResult.data) {
      referralsResult.data.forEach((r) => {
        allActivities.push({
          id: r.id + 1000,
          type: "Referral",
          member: r.user_name,
          detail: `Referred to ${r.to}`,
          status: r.referral_status,
          date: new Date(r.created_at).toISOString().split("T")[0],
          created_at: r.created_at,
        })
      })
    }

    if (oneAndOnesResult.data) {
      oneAndOnesResult.data.forEach((o) => {
        allActivities.push({
          id: o.id + 2000,
          type: "1 & 1",
          member: o.user_name,
          detail: `Met ${o.met_with} at ${o.where_did_you_meet}`,
          status: "Completed",
          date: o.date,
          created_at: o.created_at,
        })
      })
    }

    allActivities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    setActivities(allActivities.slice(0, 10))
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchActivity()
  }, [fetchActivity])

  return { activities, loading, refetch: fetchActivity }
}
