import { createClient } from "./server"

// ── Server-side data fetching functions ──

export async function getServerUser() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user ?? null
}

export async function getServerProfile(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("users")
    .select("id, email, role, chapter_id")
    .eq("id", userId)
    .single()
  return data
}

export async function getServerChapters() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("chapters")
    .select("*")
    .order("id", { ascending: true })
  return data ?? []
}

export async function getServerTyfcbs(chapterId?: number | null) {
  const supabase = await createClient()
  let query = supabase.from("tyfcbs").select("*, chapters(name)").order("created_at", { ascending: false })
  if (chapterId) query = query.eq("chapter_id", chapterId)
  const { data } = await query
  return data ?? []
}

export async function getServerReferrals(chapterId?: number | null) {
  const supabase = await createClient()
  let query = supabase.from("referrals").select("*, chapters(name)").order("created_at", { ascending: false })
  if (chapterId) query = query.eq("chapter_id", chapterId)
  const { data } = await query
  return data ?? []
}

export async function getServerOneAndOnes(chapterId?: number | null) {
  const supabase = await createClient()
  let query = supabase.from("one_and_ones").select("*, chapters(name)").order("created_at", { ascending: false })
  if (chapterId) query = query.eq("chapter_id", chapterId)
  const { data } = await query
  return data ?? []
}

export async function getServerRecentActivity(chapterId?: number | null) {
  const supabase = await createClient()

  let tyfcbsQ = supabase.from("tyfcbs").select("*").order("created_at", { ascending: false }).limit(5)
  let referralsQ = supabase.from("referrals").select("*").order("created_at", { ascending: false }).limit(5)
  let oneAndOnesQ = supabase.from("one_and_ones").select("*").order("created_at", { ascending: false }).limit(5)

  if (chapterId) {
    tyfcbsQ = tyfcbsQ.eq("chapter_id", chapterId)
    referralsQ = referralsQ.eq("chapter_id", chapterId)
    oneAndOnesQ = oneAndOnesQ.eq("chapter_id", chapterId)
  }

  const [tyfcbsResult, referralsResult, oneAndOnesResult] = await Promise.all([
    tyfcbsQ,
    referralsQ,
    oneAndOnesQ,
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
        detail: `Referred to ${r.referred_to}`,
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
  return allActivities.slice(0, 10).map(({ created_at: _created_at, ...rest }) => rest)
}

export async function getServerAttendance(chapterId: number, date: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("attendance")
    .select("*")
    .eq("chapter_id", chapterId)
    .eq("date", date)
  return data ?? []
}

export async function getServerChapterMembers(chapterId: number) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("tyfcbs")
    .select("user_name")
    .eq("chapter_id", chapterId)

  const names = new Set<string>()
  if (data) {
    data.forEach((r) => {
      if (r.user_name) names.add(r.user_name)
    })
  }

  // Fallback: include chapter president if no TYFCB entries
  if (names.size === 0) {
    const { data: chapter } = await supabase
      .from("chapters")
      .select("president")
      .eq("id", chapterId)
      .single()
    if (chapter?.president) names.add(chapter.president)
  }

  return Array.from(names).sort()
}

export async function getServerDashboardStats(chapterId?: number | null) {
  const supabase = await createClient()

  let tyfcbsQuery = supabase.from("tyfcbs").select("amount")
  let referralsQuery = supabase.from("referrals").select("id", { count: "exact", head: true }).neq("referral_status", "Closed")
  let meetingsQuery = supabase.from("one_and_ones").select("id", { count: "exact", head: true })

  if (chapterId) {
    tyfcbsQuery = tyfcbsQuery.eq("chapter_id", chapterId)
    referralsQuery = referralsQuery.eq("chapter_id", chapterId)
    meetingsQuery = meetingsQuery.eq("chapter_id", chapterId)
  }

  const [tyfcbsResult, referralsResult, meetingsResult] = await Promise.all([
    tyfcbsQuery,
    referralsQuery,
    meetingsQuery,
  ])

  let totalRevenue = 0
  if (tyfcbsResult.data) {
    tyfcbsResult.data.forEach((t) => {
      const amount = parseFloat((t.amount || "0").replace(/[₹,]/g, ""))
      if (!isNaN(amount)) totalRevenue += amount
    })
  }

  return {
    totalTyfcbs: tyfcbsResult.data?.length ?? 0,
    activeReferrals: referralsResult.count ?? 0,
    totalMeetings: meetingsResult.count ?? 0,
    totalRevenue: `₹${totalRevenue.toLocaleString()}`,
  }
}
