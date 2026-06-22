"use client"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard",
}

import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
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
import { Badge } from "@/components/reui/badge"
import { QrPopup } from "@/components/qr-popup"
import { useDashboardStats, useRecentActivity } from "@/lib/supabase/hooks"
import {
  HeartHandshakeIcon,
  FileTextIcon,
  HandshakeIcon,
  DollarSignIcon,
  ArrowRightIcon,
} from "lucide-react"

const quickActions = [
  {
    title: "TYFCB",
    description: "Log closed business and track referral revenue",
    icon: <HeartHandshakeIcon className="size-6" />,
    href: "/tyfcb",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "hover:border-emerald-200",
  },
  {
    title: "Referral Slip",
    description: "Create and manage member referral entries",
    icon: <FileTextIcon className="size-6" />,
    href: "/referral-slip",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "hover:border-blue-200",
  },
  {
    title: "1 & 1",
    description: "Record one-on-one meeting notes",
    icon: <HandshakeIcon className="size-6" />,
    href: "/one-and-one",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "hover:border-violet-200",
  },
]

const statConfig = [
  { key: "totalTyfcbs" as const, title: "Total TYFCB", description: "Closed business entries", icon: <HeartHandshakeIcon className="size-5" />, color: "text-emerald-600", bg: "bg-emerald-50" },
  { key: "activeReferrals" as const, title: "Active Referrals", description: "Pending + In Progress", icon: <FileTextIcon className="size-5" />, color: "text-blue-600", bg: "bg-blue-50" },
  { key: "totalMeetings" as const, title: "1 & 1 Meetings", description: "Total meetings recorded", icon: <HandshakeIcon className="size-5" />, color: "text-violet-600", bg: "bg-violet-50" },
  { key: "totalRevenue" as const, title: "Total Revenue", description: "From closed referrals", icon: <DollarSignIcon className="size-5" />, color: "text-amber-600", bg: "bg-amber-50" },
]

export default function DashboardPage() {
  const { stats, loading: statsLoading } = useDashboardStats()
  const { activities, loading: activityLoading } = useRecentActivity()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-vertical:h-4 data-vertical:self-auto" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto px-4">
            <QrPopup />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">BNI Chapter overview and quick actions</p>
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
                    {statsLoading ? "—" : stat.key === "totalRevenue" ? stats.totalRevenue : stats[stat.key]}
                  </div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {quickActions.map((action) => (
                <a key={action.title} href={action.href}>
                  <Card className={`transition-colors ${action.border}`}>
                    <CardHeader className="flex flex-row items-center gap-4">
                      <div className={`flex size-10 items-center justify-center rounded-lg ${action.bg} ${action.color}`}>
                        {action.icon}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">{action.title}</CardTitle>
                        <CardDescription className="text-xs">{action.description}</CardDescription>
                      </div>
                      <ArrowRightIcon className="size-4 text-muted-foreground" />
                    </CardHeader>
                  </Card>
                </a>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest entries across all sections</CardDescription>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <span className="text-sm text-muted-foreground">Loading...</span>
                </div>
              ) : activities.length === 0 ? (
                <div className="flex h-32 items-center justify-center">
                  <span className="text-sm text-muted-foreground">No activity yet. Use the QR code to add entries.</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Type</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Detail</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activities.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Badge
                            variant={item.type === "TYFCB" ? "success" : item.type === "Referral" ? "default" : "secondary"}
                            size="sm"
                          >
                            {item.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{item.member}</TableCell>
                        <TableCell className="text-muted-foreground">{item.detail}</TableCell>
                        <TableCell>
                          <Badge
                            variant={item.status === "Closed" || item.status === "Completed" ? "success" : item.status === "In Progress" ? "warning" : "secondary"}
                            size="sm"
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">{item.date}</TableCell>
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
