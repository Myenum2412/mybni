"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { UsersIcon, CheckIcon, XIcon, CalendarCheckIcon, UserCheckIcon, UserXIcon } from "lucide-react"
import Calendar from "@/app/attendance/components/Calendar"
import type { Tyfcb, Referral, OneAndOne, Chapter, Attendance } from "@/lib/supabase/database.types"

interface UserEntry {
  id: number
  userName: string
  chapterName: string
  type: string
  detail: string
  date: string
}

interface ClientMembersProps {
  tyfcbs: (Tyfcb & { chapters?: { name?: string } })[]
  referrals: (Referral & { chapters?: { name?: string } })[]
  oneAndOnes: (OneAndOne & { chapters?: { name?: string } })[]
  chapters: Chapter[]
  userRole: string | null
  memberChapterId: number | null
  memberChapterName: string | null
  initialMembers: string[]
  initialAttendance: Attendance[]
}

// ── Attendance sub-component for member role ──

function MemberAttendanceView({
  chapterId,
  chapterName,
  initialMembers,
  initialAttendance,
}: {
  chapterId: number
  chapterName: string
  initialMembers: string[]
  initialAttendance: Attendance[]
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(new Date().toISOString().split("T")[0])
  const [members] = useState<string[]>(initialMembers)
  const [attendance, setAttendance] = useState<Record<string, "present" | "absent">>(() => {
    const map: Record<string, "present" | "absent"> = {}
    initialAttendance.forEach((a) => {
      map[a.member_name] = a.status as "present" | "absent"
    })
    return map
  })

  useEffect(() => {
    if (!chapterId || !selectedDate) return
    fetch(`/api/attendance?chapter_id=${chapterId}&date=${selectedDate}`)
      .then((r) => r.json())
      .then((data) => {
        const map: Record<string, "present" | "absent"> = {}
        ;(data.attendance as Attendance[]).forEach((a) => {
          map[a.member_name] = a.status as "present" | "absent"
        })
        setAttendance(map)
      })
      .catch(() => setAttendance({}))
  }, [chapterId, selectedDate])

  const toggleStatus = useCallback(async (memberName: string) => {
    if (!chapterId || !selectedDate) return
    const currentStatus = attendance[memberName] || "absent"
    const newStatus = currentStatus === "present" ? "absent" : "present"
    setAttendance((prev) => ({ ...prev, [memberName]: newStatus }))
    try {
      await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapter_id: chapterId,
          member_name: memberName,
          date: selectedDate,
          status: newStatus,
        }),
      })
    } catch {
      setAttendance((prev) => ({ ...prev, [memberName]: currentStatus }))
    }
  }, [chapterId, selectedDate, attendance])

  const memberAttendance = members.map((name) => ({
    name,
    status: attendance[name] || "absent" as "present" | "absent",
  }))

  const presentCount = memberAttendance.filter((m) => m.status === "present").length
  const absentCount = memberAttendance.filter((m) => m.status === "absent").length
  const totalCount = memberAttendance.length
  const attendancePct = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0

  function getInitials(name: string) {
    return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
  }

  const AVATAR_COLORS = [
    "bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500",
    "bg-rose-500", "bg-cyan-500", "bg-indigo-500", "bg-pink-500",
  ]

  function avatarColor(name: string) {
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div>
        <h1 className="text-2xl font-bold">Attendance — {chapterName}</h1>
        <p className="text-sm text-muted-foreground">Mark attendance for your chapter</p>
      </div>

      {/* Summary cards */}
      {selectedDate && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="shadow-sm border-0 bg-white">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <UsersIcon className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none">{totalCount}</p>
                <p className="text-xs text-muted-foreground mt-1">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-0 bg-white">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
                <UserCheckIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none text-green-600">{presentCount}</p>
                <p className="text-xs text-muted-foreground mt-1">Present</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-0 bg-white">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
                <UserXIcon className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none text-red-600">{absentCount}</p>
                <p className="text-xs text-muted-foreground mt-1">Absent</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-0 bg-white">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                <CalendarCheckIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none text-blue-600">{attendancePct}%</p>
                <p className="text-xs text-muted-foreground mt-1">Rate</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Calendar — 3 cols */}
        <div className="lg:col-span-3">
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            attendanceSummary={{}}
          />
        </div>

        {/* Member list — 2 cols */}
        <Card className="shadow-sm border-0 bg-white lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {selectedDate
                ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                    weekday: "short", month: "short", day: "numeric", year: "numeric",
                  })
                : "Select Date"}
            </CardTitle>
            <CardDescription className="text-xs">
              {selectedDate
                ? `${presentCount} present · ${absentCount} absent`
                : "Pick a date to mark attendance"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {!selectedDate ? (
              <div className="flex h-40 items-center justify-center">
                <div className="text-center">
                  <CalendarCheckIcon className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <span className="text-sm text-muted-foreground">Click a date on the calendar</span>
                </div>
              </div>
            ) : memberAttendance.length === 0 ? (
              <div className="flex h-40 items-center justify-center">
                <span className="text-sm text-muted-foreground">No members found</span>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
                {memberAttendance.map((member) => (
                  <div
                    key={member.name}
                    className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors cursor-pointer group
                      ${member.status === "present" ? "bg-green-50/60 hover:bg-green-50" : "bg-red-50/40 hover:bg-red-50/70"}
                    `}
                    onClick={() => toggleStatus(member.name)}
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-xs font-semibold ${avatarColor(member.name)}`}>
                      {getInitials(member.name)}
                    </div>
                    <span className="flex-1 text-sm font-medium truncate">{member.name}</span>
                    <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors
                      ${member.status === "present"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                      }`}
                    >
                      {member.status === "present" ? (
                        <><CheckIcon className="h-3 w-3" /> Present</>
                      ) : (
                        <><XIcon className="h-3 w-3" /> Absent</>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ── Main component ──

export default function ClientMembers({
  tyfcbs,
  referrals,
  oneAndOnes,
  chapters,
  userRole,
  memberChapterId,
  memberChapterName,
  initialMembers,
  initialAttendance,
}: ClientMembersProps) {
  // ── Member role: show attendance-only view ──
  if (userRole === "member" && memberChapterId && memberChapterName) {
    return (
      <SidebarProvider>
        <AppSidebar role={userRole} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white/80 backdrop-blur-sm px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Attendance</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <MemberAttendanceView
            chapterId={memberChapterId}
            chapterName={memberChapterName}
            initialMembers={initialMembers}
            initialAttendance={initialAttendance}
          />
        </SidebarInset>
      </SidebarProvider>
    )
  }

  // ── Admin/DC: show activity table ──
  const [selectedChapter, setSelectedChapter] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")

  const allEntries = useMemo(() => {
    const entries: UserEntry[] = []
    tyfcbs.forEach((t) => {
      entries.push({
        id: t.id,
        userName: t.user_name,
        chapterName: t.chapters?.name || "—",
        type: "TYFCB",
        detail: `${t.amount} — ${t.business_type} (Thank you to: ${t.thank_you_to})`,
        date: new Date(t.created_at).toISOString().split("T")[0],
      })
    })
    referrals.forEach((r) => {
      entries.push({
        id: r.id + 10000,
        userName: r.user_name,
        chapterName: r.chapters?.name || "—",
        type: "Referral",
        detail: `To: ${r.referred_to} — ${r.referral} [${r.referral_status}]`,
        date: new Date(r.created_at).toISOString().split("T")[0],
      })
    })
    oneAndOnes.forEach((o) => {
      entries.push({
        id: o.id + 20000,
        userName: o.user_name,
        chapterName: o.chapters?.name || "—",
        type: "1 & 1",
        detail: `Met ${o.met_with} at ${o.where_did_you_meet}`,
        date: o.date,
      })
    })
    entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return entries
  }, [tyfcbs, referrals, oneAndOnes])

  const filteredEntries = useMemo(() => {
    let result = allEntries
    if (selectedChapter !== "all") {
      result = result.filter((e) => e.chapterName === selectedChapter)
    }
    if (selectedType !== "all") {
      result = result.filter((e) => e.type === selectedType)
    }
    return result
  }, [allEntries, selectedChapter, selectedType])

  return (
    <SidebarProvider>
      <AppSidebar role={userRole} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-vertical:h-4 data-vertical:self-auto" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Member</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          <div>
            <h1 className="text-2xl font-bold">Member Activity</h1>
            <p className="text-sm text-muted-foreground">Member activity across all chapters</p>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <UsersIcon className="size-4" />
                Filter Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="grid gap-1.5">
                  <Label className="text-xs">Chapter</Label>
                  <Select value={selectedChapter} onValueChange={(v) => setSelectedChapter(v ?? "all")}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select chapter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Chapters</SelectItem>
                      {chapters.map((c) => (
                        <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">Type</Label>
                  <Select value={selectedType} onValueChange={(v) => setSelectedType(v ?? "all")}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="TYFCB">TYFCB</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                      <SelectItem value="1 & 1">1 & 1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Table */}
          <Card>
            <CardHeader>
              <CardTitle>Member Activity</CardTitle>
              <CardDescription>Showing {filteredEntries.length} entries</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredEntries.length === 0 ? (
                <div className="flex h-32 items-center justify-center">
                  <span className="text-sm text-muted-foreground">No activity found.</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Sno</TableHead>
                      <TableHead>User Name</TableHead>
                      <TableHead>Chapter</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Detail</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.map((entry, index) => (
                      <TableRow key={`${entry.type}-${entry.id}`}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{entry.userName}</TableCell>
                        <TableCell>{entry.chapterName}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              entry.type === "TYFCB"
                                ? "bg-emerald-50 text-emerald-700"
                                : entry.type === "Referral"
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-violet-50 text-violet-700"
                            }`}
                          >
                            {entry.type}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{entry.detail}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{entry.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
