"use client"

import { useState, useEffect, useCallback } from "react"
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CheckIcon, XIcon, UsersIcon, CalendarCheckIcon, UserCheckIcon, UserXIcon } from "lucide-react"
import Calendar from "@/app/attendance/components/Calendar"
import type { Chapter, Attendance } from "@/lib/supabase/database.types"

interface ClientAttendanceOnlyProps {
  chapters: Chapter[]
  initialAttendance: Record<number, Attendance[]>
  initialMembers: Record<number, string[]>
  initialDate: string
}

interface MemberAttendance {
  name: string
  status: "present" | "absent"
}

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

export default function ClientAttendanceOnly({
  chapters,
  initialAttendance,
  initialMembers,
  initialDate,
}: ClientAttendanceOnlyProps) {
  const [selectedChapter, setSelectedChapter] = useState<number | null>(
    chapters.length > 0 ? chapters[0].id : null
  )
  const [selectedDate, setSelectedDate] = useState<string | null>(initialDate)
  const [members, setMembers] = useState<string[]>(
    chapters.length > 0 ? (initialMembers[chapters[0].id] || []) : []
  )
  const [attendance, setAttendance] = useState<Record<string, "present" | "absent">>(() => {
    const map: Record<string, "present" | "absent"> = {}
    if (chapters.length > 0) {
      ;(initialAttendance[chapters[0].id] || []).forEach((a) => {
        map[a.member_name] = a.status as "present" | "absent"
      })
    }
    return map
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedChapter) return
    setLoading(true)

    const newMembers = initialMembers[selectedChapter] || []
    setMembers(newMembers)

    if (selectedDate) {
      fetch(`/api/attendance?chapter_id=${selectedChapter}&date=${selectedDate}`)
        .then((r) => r.json())
        .then((data) => {
          const map: Record<string, "present" | "absent"> = {}
          ;(data.attendance as Attendance[]).forEach((a) => {
            map[a.member_name] = a.status as "present" | "absent"
          })
          setAttendance(map)
        })
        .catch(() => setAttendance({}))
        .finally(() => setLoading(false))
    } else {
      const map: Record<string, "present" | "absent"> = {}
      ;(initialAttendance[selectedChapter] || []).forEach((a) => {
        map[a.member_name] = a.status as "present" | "absent"
      })
      setAttendance(map)
      setLoading(false)
    }
  }, [selectedChapter, selectedDate, initialAttendance, initialMembers])

  const toggleStatus = useCallback(async (memberName: string) => {
    if (!selectedChapter || !selectedDate) return
    const currentStatus = attendance[memberName] || "absent"
    const newStatus = currentStatus === "present" ? "absent" : "present"
    setAttendance((prev) => ({ ...prev, [memberName]: newStatus }))
    try {
      await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapter_id: selectedChapter,
          member_name: memberName,
          date: selectedDate,
          status: newStatus,
        }),
      })
    } catch {
      setAttendance((prev) => ({ ...prev, [memberName]: currentStatus }))
    }
  }, [selectedChapter, selectedDate, attendance])

  const memberAttendance: MemberAttendance[] = members.map((name) => ({
    name,
    status: attendance[name] || "absent",
  }))

  const presentCount = memberAttendance.filter((m) => m.status === "present").length
  const absentCount = memberAttendance.filter((m) => m.status === "absent").length
  const totalCount = memberAttendance.length
  const attendancePct = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0

  return (
    <SidebarProvider>
      <AppSidebar />
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

        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 bg-muted/20 min-h-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Track chapter meeting attendance</p>
            </div>
            <select
              className="h-9 rounded-md border border-input bg-white px-3 text-sm"
              value={selectedChapter?.toString() || ""}
              onChange={(e) => { setSelectedChapter(Number(e.target.value)); setSelectedDate(initialDate) }}
            >
              {chapters.map((c) => (
                <option key={c.id} value={c.id.toString()}>{c.name}</option>
              ))}
            </select>
          </div>

          {selectedChapter && (
            <>
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

              <div className="grid gap-6 lg:grid-cols-5">
                <div className="lg:col-span-3">
                  <Calendar
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                    attendanceSummary={{}}
                  />
                </div>

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
                    ) : loading ? (
                      <div className="flex h-40 items-center justify-center">
                        <span className="text-sm text-muted-foreground">Loading...</span>
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
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
