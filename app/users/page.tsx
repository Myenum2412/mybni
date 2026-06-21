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
import { useChapters, useTyfcbs, useReferrals, useOneAndOnes } from "@/lib/supabase/hooks"
import { UsersIcon } from "lucide-react"

interface UserEntry {
  id: number
  userName: string
  chapterName: string
  type: string
  detail: string
  date: string
}

export default function UsersPage() {
  const { chapters } = useChapters()
  const { tyfcbs } = useTyfcbs()
  const { referrals } = useReferrals()
  const { oneAndOnes } = useOneAndOnes()

  const [selectedChapter, setSelectedChapter] = useState<string>("all")

  const allEntries = useMemo(() => {
    const entries: UserEntry[] = []

    tyfcbs.forEach((t) => {
      entries.push({
        id: t.id,
        userName: t.user_name,
        chapterName: (t as unknown as { chapters?: { name?: string } }).chapters?.name || "—",
        type: "TYFCB",
        detail: `${t.amount} — ${t.business_type} (Thank you to: ${t.thank_you_to})`,
        date: new Date(t.created_at).toISOString().split("T")[0],
      })
    })

    referrals.forEach((r) => {
      entries.push({
        id: r.id + 10000,
        userName: r.user_name,
        chapterName: (r as unknown as { chapters?: { name?: string } }).chapters?.name || "—",
        type: "Referral",
        detail: `To: ${r.to} — ${r.referral} [${r.referral_status}]`,
        date: new Date(r.created_at).toISOString().split("T")[0],
      })
    })

    oneAndOnes.forEach((o) => {
      entries.push({
        id: o.id + 20000,
        userName: o.user_name,
        chapterName: (o as unknown as { chapters?: { name?: string } }).chapters?.name || "—",
        type: "1 & 1",
        detail: `Met ${o.met_with} at ${o.where_did_you_meet}`,
        date: o.date,
      })
    })

    entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return entries
  }, [tyfcbs, referrals, oneAndOnes])

  const filteredEntries = useMemo(() => {
    if (selectedChapter === "all") return allEntries
    return allEntries.filter((e) => e.chapterName === selectedChapter)
  }, [allEntries, selectedChapter])

  // Unique chapter names from data
  const chapterNames = useMemo(() => {
    const names = new Set<string>()
    allEntries.forEach((e) => {
      if (e.chapterName !== "—") names.add(e.chapterName)
    })
    return Array.from(names).sort()
  }, [allEntries])

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
                  <BreadcrumbPage>Users</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          <div>
            <h1 className="text-2xl font-bold">Users</h1>
            <p className="text-sm text-muted-foreground">Member activity across all chapters</p>
          </div>

          {/* Chapter Filter Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <UsersIcon className="size-4" />
                Filter by Chapter
              </CardTitle>
              <CardDescription>Select a chapter to filter user activity</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedChapter} onValueChange={(v) => setSelectedChapter(v ?? "all")}>
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="Select chapter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Chapters</SelectItem>
                  {chapters.map((c) => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* User Activity Table */}
          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
              <CardDescription>
                {selectedChapter === "all"
                  ? `Showing all ${filteredEntries.length} entries across all chapters`
                  : `Showing ${filteredEntries.length} entries for ${selectedChapter}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredEntries.length === 0 ? (
                <div className="flex h-32 items-center justify-center">
                  <span className="text-sm text-muted-foreground">No user activity found.</span>
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
