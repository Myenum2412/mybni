"use client"

import { useState, useMemo, useEffect } from "react"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useChapters, useTyfcbs, useReferrals, useOneAndOnes } from "@/lib/supabase/hooks"
import { useAuth } from "@/lib/supabase/auth"
import { UsersIcon, PlusIcon, EyeIcon, EyeOffIcon, Loader2Icon } from "lucide-react"

interface UserEntry {
  id: number
  userName: string
  chapterName: string
  type: string
  detail: string
  date: string
}

export default function UsersPage() {
  const { user, loading: authLoading } = useAuth()
  const { chapters } = useChapters()
  const { tyfcbs } = useTyfcbs()
  const { referrals } = useReferrals()
  const { oneAndOnes } = useOneAndOnes()

  const isAdmin = user?.role === "admin" || user?.role === "superadmin"

  const userChapterName = useMemo(() => {
    if (!user?.chapter_id) return null
    const chapter = chapters.find((c) => c.id === user.chapter_id)
    return chapter?.name ?? null
  }, [user?.chapter_id, chapters])

  const [selectedChapter, setSelectedChapter] = useState<string>("all")

  // Create user form state
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newUserName, setNewUserName] = useState("")
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserPassword, setNewUserPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [newUserChapterId, setNewUserChapterId] = useState<string>("")
  const [newUserRole, setNewUserRole] = useState<string>("member")
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState(false)

  useEffect(() => {
    if (!isAdmin && userChapterName) {
      setSelectedChapter(userChapterName)
    }
  }, [isAdmin, userChapterName])

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
        detail: `To: ${r.referred_to} — ${r.referral} [${r.referral_status}]`,
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

  const resetCreateForm = () => {
    setNewUserName("")
    setNewUserEmail("")
    setNewUserPassword("")
    setNewUserChapterId("")
    setNewUserRole("member")
    setCreateError(null)
    setCreateSuccess(false)
  }

  const handleCreateUser = async () => {
    setCreateError(null)
    setCreateSuccess(false)

    if (!newUserName || !newUserEmail || !newUserPassword) {
      setCreateError("Name, email, and password are required")
      return
    }

    setCreating(true)
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          password: newUserPassword,
          chapterId: newUserChapterId || null,
          role: newUserRole,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setCreateError(data.error || "Failed to create user")
      } else {
        setCreateSuccess(true)
        resetCreateForm()
        setTimeout(() => setShowCreateForm(false), 1500)
      }
    } catch (err) {
      setCreateError(String(err))
    } finally {
      setCreating(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-muted-foreground">Loading...</span>
      </div>
    )
  }

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Users</h1>
              <p className="text-sm text-muted-foreground">
                {isAdmin ? "Manage members and view activity" : `Your chapter: ${userChapterName || "Not assigned"}`}
              </p>
            </div>
            {isAdmin && (
              <Dialog open={showCreateForm} onOpenChange={(open) => { setShowCreateForm(open); if (!open) resetCreateForm(); }}>
                <DialogTrigger
                  render={
                    <Button className="bg-red-600 hover:bg-red-700">
                      <PlusIcon className="mr-2 size-4" />
                      Add User
                    </Button>
                  }
                />
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>Add a new member to the chapter</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {createError && (
                      <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                        {createError}
                      </div>
                    )}
                    {createSuccess && (
                      <div className="rounded-md bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-600">
                        User created successfully!
                      </div>
                    )}
                    <div className="grid gap-2">
                      <Label htmlFor="new-name">Name</Label>
                      <Input
                        id="new-name"
                        placeholder="John Smith"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="new-email">Email ID</Label>
                      <Input
                        id="new-email"
                        type="email"
                        placeholder="john@example.com"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="new-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={newUserPassword}
                          onChange={(e) => setNewUserPassword(e.target.value)}
                          className="pr-10"
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
                    <div className="grid gap-2">
                      <Label htmlFor="new-chapter">Chapter</Label>
                      <Select value={newUserChapterId} onValueChange={(v) => setNewUserChapterId(v ?? "")}>
                        <SelectTrigger id="new-chapter">
                          <SelectValue placeholder="Select chapter" />
                        </SelectTrigger>
                        <SelectContent>
                          {chapters.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="new-role">Role</Label>
                      <Select value={newUserRole} onValueChange={(v) => setNewUserRole(v ?? "member")}>
                        <SelectTrigger id="new-role">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="superadmin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => { setShowCreateForm(false); resetCreateForm(); }}>Cancel</Button>
                    <Button onClick={handleCreateUser} disabled={creating} className="bg-red-600 hover:bg-red-700">
                      {creating ? <Loader2Icon className="mr-2 size-4 animate-spin" /> : "Create User"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Chapter Filter Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <UsersIcon className="size-4" />
                {isAdmin ? "Filter by Chapter" : "Your Chapter"}
              </CardTitle>
              <CardDescription>
                {isAdmin ? "Select a chapter to filter user activity" : "Showing activity for your assigned chapter"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isAdmin ? (
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
              ) : (
                <div className="rounded-md border px-3 py-2 text-sm font-medium">
                  {userChapterName || "No chapter assigned"}
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Activity Table */}
          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
              <CardDescription>
                {isAdmin && selectedChapter === "all"
                  ? `Showing all ${filteredEntries.length} entries across all chapters`
                  : `Showing ${filteredEntries.length} entries${userChapterName ? ` for ${userChapterName}` : ""}`}
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
