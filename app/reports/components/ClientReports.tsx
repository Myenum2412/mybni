"use client"

import { useMemo } from "react"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  HeartHandshakeIcon,
  FileTextIcon,
  HandshakeIcon,
  DollarSignIcon,
  TrendingUpIcon,
  UsersIcon,
  CheckCircle2Icon,
  XCircleIcon,
} from "lucide-react"
import type { Tyfcb, Referral, OneAndOne } from "@/lib/supabase/database.types"

interface ClientReportsProps {
  tyfcbs: (Tyfcb & { chapters?: { name?: string } })[]
  referrals: (Referral & { chapters?: { name?: string } })[]
  oneAndOnes: (OneAndOne & { chapters?: { name?: string } })[]
  chapterName: string | null
  userRole: string | null
  stats: {
    totalTyfcbs: number
    activeReferrals: number
    totalMeetings: number
    totalRevenue: string
  }
  attendanceSummary: { date: string; present: number; total: number }[]
}

const statConfig = [
  { key: "totalTyfcbs" as const, title: "Total TYFCB", description: "Closed business entries", icon: <HeartHandshakeIcon className="size-5" />, color: "text-emerald-600", bg: "bg-emerald-50" },
  { key: "activeReferrals" as const, title: "Active Referrals", description: "Pending + In Progress", icon: <FileTextIcon className="size-5" />, color: "text-blue-600", bg: "bg-blue-50" },
  { key: "totalMeetings" as const, title: "1 & 1 Meetings", description: "Total meetings recorded", icon: <HandshakeIcon className="size-5" />, color: "text-violet-600", bg: "bg-violet-50" },
  { key: "totalRevenue" as const, title: "Total Revenue", description: "From closed referrals", icon: <DollarSignIcon className="size-5" />, color: "text-amber-600", bg: "bg-amber-50" },
]

export default function ClientReports({
  tyfcbs,
  referrals,
  oneAndOnes,
  chapterName,
  userRole,
  stats,
  attendanceSummary,
}: ClientReportsProps) {
  const recentTyfcbs = useMemo(() =>
    [...tyfcbs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10),
    [tyfcbs]
  )

  const recentReferrals = useMemo(() =>
    [...referrals].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10),
    [referrals]
  )

  const recentOneAndOnes = useMemo(() =>
    [...oneAndOnes].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10),
    [oneAndOnes]
  )

  const maxAttendance = Math.max(...attendanceSummary.map((a) => a.total), 1)

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
                  <BreadcrumbPage>Reports</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          <div>
            <h1 className="text-2xl font-bold">
              Reports{chapterName ? ` — ${chapterName}` : ""}
            </h1>
            <p className="text-sm text-muted-foreground">
              {userRole === "admin" ? "Chapter performance summary" : "All chapters performance summary"}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statConfig.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <div className={`flex size-8 items-center justify-center rounded-lg ${stat.bg} ${stat.color}`}>
                    {stat.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stat.key === "totalRevenue" ? stats.totalRevenue : stats[stat.key]}
                  </div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Attendance Trend — admin only */}
          {userRole === "admin" && attendanceSummary.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUpIcon className="size-5 text-blue-600" />
                  Attendance Trend (Last 7 Days)
                </CardTitle>
                <CardDescription>Daily attendance rate for your chapter</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-32">
                  {attendanceSummary.map((day) => {
                    const pct = day.total > 0 ? (day.present / day.total) * 100 : 0
                    const height = day.total > 0 ? Math.max((day.present / maxAttendance) * 100, 8) : 8
                    const dateLabel = new Date(day.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" })
                    return (
                      <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[10px] font-medium text-muted-foreground">
                          {day.total > 0 ? `${Math.round(pct)}%` : "—"}
                        </span>
                        <div className="w-full rounded-t-sm bg-blue-500/20 relative" style={{ height: `${height}%` }}>
                          <div
                            className="absolute bottom-0 w-full rounded-t-sm bg-blue-500"
                            style={{ height: `${day.total > 0 ? (day.present / day.total) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground">{dateLabel}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent TYFCBs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HeartHandshakeIcon className="size-5 text-emerald-600" />
                Recent TYFCBs
              </CardTitle>
              <CardDescription>Latest closed business entries</CardDescription>
            </CardHeader>
            <CardContent>
              {recentTyfcbs.length === 0 ? (
                <div className="flex h-24 items-center justify-center">
                  <span className="text-sm text-muted-foreground">No TYFCB entries yet.</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Business Type</TableHead>
                      <TableHead>Thank You To</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTyfcbs.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.user_name}</TableCell>
                        <TableCell className="text-emerald-600 font-semibold">{t.amount}</TableCell>
                        <TableCell>{t.business_type}</TableCell>
                        <TableCell>{t.thank_you_to}</TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {new Date(t.created_at).toLocaleDateString("en-IN")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Recent Referrals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileTextIcon className="size-5 text-blue-600" />
                Recent Referrals
              </CardTitle>
              <CardDescription>Latest referral entries</CardDescription>
            </CardHeader>
            <CardContent>
              {recentReferrals.length === 0 ? (
                <div className="flex h-24 items-center justify-center">
                  <span className="text-sm text-muted-foreground">No referral entries yet.</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Referred To</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentReferrals.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.user_name}</TableCell>
                        <TableCell>{r.referred_to}</TableCell>
                        <TableCell>{r.referral_type}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                            r.referral_status === "Closed"
                              ? "bg-emerald-50 text-emerald-700"
                              : r.referral_status === "In Progress"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-blue-50 text-blue-700"
                          }`}>
                            {r.referral_status === "Closed" ? <CheckCircle2Icon className="h-3 w-3" /> : <XCircleIcon className="h-3 w-3" />}
                            {r.referral_status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {new Date(r.created_at).toLocaleDateString("en-IN")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Recent 1&1s */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HandshakeIcon className="size-5 text-violet-600" />
                Recent 1 & 1 Meetings
              </CardTitle>
              <CardDescription>Latest one-on-one meetings</CardDescription>
            </CardHeader>
            <CardContent>
              {recentOneAndOnes.length === 0 ? (
                <div className="flex h-24 items-center justify-center">
                  <span className="text-sm text-muted-foreground">No 1 & 1 entries yet.</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Met With</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOneAndOnes.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-medium">{o.user_name}</TableCell>
                        <TableCell>{o.met_with}</TableCell>
                        <TableCell>{o.where_did_you_meet}</TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {new Date(o.date).toLocaleDateString("en-IN")}
                        </TableCell>
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
