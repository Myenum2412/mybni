"use client"

import { useState, useMemo } from "react"
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
import { UsersIcon } from "lucide-react"
import type { Tyfcb, Referral, OneAndOne, Chapter } from "@/lib/supabase/database.types"

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
}

export default function ClientMembers({ tyfcbs, referrals, oneAndOnes, chapters }: ClientMembersProps) {
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
      <AppSidebar />
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
                  <BreadcrumbPage>Members</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          <div>
            <h1 className="text-2xl font-bold">Members</h1>
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
