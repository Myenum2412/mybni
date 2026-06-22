"use client"

import { useState } from "react"
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
import { UsersIcon, PlusIcon, EyeIcon, EyeOffIcon, Loader2Icon, UserPlusIcon, ChevronDownIcon, ChevronRightIcon, HeartHandshakeIcon, FileTextIcon, HandshakeIcon, CalendarCheckIcon } from "lucide-react"
import type { Chapter } from "@/lib/supabase/database.types"

interface UserAccount {
  id: string
  email: string
  name: string | null
  role: string
  chapter_id: number | null
  created_at: string
  chapters?: { name: string } | null
  tyfcbs_count?: number
  referrals_count?: number
  one_and_ones_count?: number
  attendance_count?: number
}

interface ClientUsersProps {
  users: UserAccount[]
  chapters: Chapter[]
  currentUser: {
    id: string
    email: string
    role: string
    chapter_id: number | null
  } | null
}

export default function ClientUsers({ users, chapters, currentUser }: ClientUsersProps) {
  const isAdmin = currentUser?.role === "admin" || currentUser?.role === "superadmin"
  const userRole = currentUser?.role ?? null

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const [newUserName, setNewUserName] = useState("")
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserPassword, setNewUserPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [newUserChapterId, setNewUserChapterId] = useState<string>("")
  const [newUserRole, setNewUserRole] = useState<string>("member")
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState(false)

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
        setTimeout(() => {
          setShowCreateForm(false)
          window.location.reload()
        }, 1000)
      }
    } catch (err) {
      setCreateError(String(err))
    } finally {
      setCreating(false)
    }
  }

  const toggleExpand = (userId: string) => {
    setExpandedUser(expandedUser === userId ? null : userId)
  }

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
                  <BreadcrumbPage>Users</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          <div>
            <h1 className="text-2xl font-bold">Users</h1>
            <p className="text-sm text-muted-foreground">Manage user accounts and view connected data</p>
          </div>

          {/* Create User Card */}
          {isAdmin && (
            <Dialog open={showCreateForm} onOpenChange={(open) => { setShowCreateForm(open); if (!open) resetCreateForm(); }}>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <UserPlusIcon className="size-4 text-red-600" />
                        Create New User
                      </CardTitle>
                      <CardDescription>Add a new user account</CardDescription>
                    </div>
                    <DialogTrigger
                      render={
                        <Button className="bg-red-600 hover:bg-red-700">
                          <PlusIcon className="mr-2 size-4" />
                          Create User
                        </Button>
                      }
                    />
                  </div>
                </CardHeader>
              </Card>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>Fill in the details to create a new user account</DialogDescription>
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
                    <Input id="new-name" placeholder="Enter full name" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="new-email">Email ID</Label>
                    <Input id="new-email" type="email" placeholder="john@example.com" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="new-password">Password</Label>
                    <div className="relative">
                      <Input id="new-password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} className="pr-10" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                        {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                      </button>
                    </div>
                  </div>
                  {userRole === "superadmin" && (
                    <div className="grid gap-2">
                      <Label htmlFor="new-chapter">Chapter</Label>
                      <Select value={newUserChapterId} onValueChange={(v) => setNewUserChapterId(v ?? "")}>
                        <SelectTrigger id="new-chapter"><SelectValue placeholder="Select chapter" /></SelectTrigger>
                        <SelectContent>
                          {chapters.map((c) => (<SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="new-role">Role</Label>
                    <Select value={newUserRole} onValueChange={(v) => setNewUserRole(v ?? "member")}>
                      <SelectTrigger id="new-role"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        {userRole === "superadmin" && <SelectItem value="superadmin">Super Admin</SelectItem>}
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

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UsersIcon className="size-5" />
                User Accounts
              </CardTitle>
              <CardDescription>Showing {users.length} user accounts with connected data</CardDescription>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="flex h-32 items-center justify-center">
                  <span className="text-sm text-muted-foreground">No user accounts found. Create one above.</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8"></TableHead>
                      <TableHead className="w-16">Sno</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Chapter</TableHead>
                      <TableHead className="text-center"><HeartHandshakeIcon className="size-4 inline" /> TYFCB</TableHead>
                      <TableHead className="text-center"><FileTextIcon className="size-4 inline" /> Referrals</TableHead>
                      <TableHead className="text-center"><HandshakeIcon className="size-4 inline" /> 1&1</TableHead>
                      <TableHead className="text-center"><CalendarCheckIcon className="size-4 inline" /> Attendance</TableHead>
                      <TableHead className="text-right">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user, index) => (
                      <>
                        <TableRow key={user.id} className="hover:bg-muted/30">
                          <TableCell>
                            <button onClick={() => toggleExpand(user.id)} className="p-0.5 hover:bg-muted rounded">
                              {expandedUser === user.id ? <ChevronDownIcon className="size-4" /> : <ChevronRightIcon className="size-4" />}
                            </button>
                          </TableCell>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">{user.name || "—"}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              user.role === "admin" || user.role === "superadmin"
                                ? "bg-red-50 text-red-700"
                                : "bg-blue-50 text-blue-700"
                            }`}>
                              {user.role}
                            </span>
                          </TableCell>
                          <TableCell>{user.chapters?.name || "—"}</TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex items-center justify-center rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold px-2 py-0.5 min-w-[28px]">
                              {user.tyfcbs_count || 0}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex items-center justify-center rounded-full bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 min-w-[28px]">
                              {user.referrals_count || 0}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex items-center justify-center rounded-full bg-violet-50 text-violet-700 text-xs font-semibold px-2 py-0.5 min-w-[28px]">
                              {user.one_and_ones_count || 0}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex items-center justify-center rounded-full bg-amber-50 text-amber-700 text-xs font-semibold px-2 py-0.5 min-w-[28px]">
                              {user.attendance_count || 0}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString("en-IN")}
                          </TableCell>
                        </TableRow>
                        {expandedUser === user.id && (
                          <TableRow key={`${user.id}-detail`}>
                            <TableCell colSpan={11} className="bg-muted/20 p-4">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="rounded-lg border bg-white p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <HeartHandshakeIcon className="size-4 text-emerald-600" />
                                    <span className="text-xs font-medium text-muted-foreground">TYFCBs</span>
                                  </div>
                                  <p className="text-2xl font-bold text-emerald-600">{user.tyfcbs_count || 0}</p>
                                  <p className="text-xs text-muted-foreground">Closed business entries</p>
                                </div>
                                <div className="rounded-lg border bg-white p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <FileTextIcon className="size-4 text-blue-600" />
                                    <span className="text-xs font-medium text-muted-foreground">Referrals</span>
                                  </div>
                                  <p className="text-2xl font-bold text-blue-600">{user.referrals_count || 0}</p>
                                  <p className="text-xs text-muted-foreground">Referral records</p>
                                </div>
                                <div className="rounded-lg border bg-white p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <HandshakeIcon className="size-4 text-violet-600" />
                                    <span className="text-xs font-medium text-muted-foreground">1 & 1s</span>
                                  </div>
                                  <p className="text-2xl font-bold text-violet-600">{user.one_and_ones_count || 0}</p>
                                  <p className="text-xs text-muted-foreground">Meeting records</p>
                                </div>
                                <div className="rounded-lg border bg-white p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <CalendarCheckIcon className="size-4 text-amber-600" />
                                    <span className="text-xs font-medium text-muted-foreground">Attendance</span>
                                  </div>
                                  <p className="text-2xl font-bold text-amber-600">{user.attendance_count || 0}</p>
                                  <p className="text-xs text-muted-foreground">Attendance records</p>
                                </div>
                              </div>
                              <div className="mt-3 text-xs text-muted-foreground">
                                User ID: <code className="bg-muted px-1 py-0.5 rounded text-[10px]">{user.id}</code>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
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
