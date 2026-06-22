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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  UsersIcon, PlusIcon, EyeIcon, EyeOffIcon, Loader2Icon, UserPlusIcon,
  ChevronDownIcon, ChevronRightIcon, HeartHandshakeIcon, FileTextIcon,
  HandshakeIcon, CalendarCheckIcon, Trash2Icon, PencilIcon, XIcon, CheckIcon,
} from "lucide-react"
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

export default function ClientUsers({ users: initialUsers, chapters, currentUser }: ClientUsersProps) {
  const isSuperadmin = currentUser?.role === "superadmin"
  const isAdmin = currentUser?.role === "admin" || currentUser?.role === "superadmin"
  const userRole = currentUser?.role ?? null

  const [users, setUsers] = useState<UserAccount[]>(initialUsers)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null)
  const [expandedUser, setExpandedUser] = useState<string | null>(null)

  // Form fields
  const [formName, setFormName] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formPassword, setFormPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [formChapterId, setFormChapterId] = useState<string>("")
  const [formRole, setFormRole] = useState<string>("member")
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState(false)

  const resetForm = () => {
    setFormName("")
    setFormEmail("")
    setFormPassword("")
    setFormChapterId("")
    setFormRole("member")
    setFormError(null)
    setFormSuccess(false)
    setEditingUser(null)
    setShowPassword(false)
  }

  const openCreateForm = () => {
    resetForm()
    // Auto-assign admin's chapter
    if (!isSuperadmin && currentUser?.chapter_id) {
      setFormChapterId(String(currentUser.chapter_id))
    }
    setShowForm(true)
  }

  const openEditForm = (user: UserAccount) => {
    setFormName(user.name || "")
    setFormEmail(user.email)
    setFormPassword("")
    setFormChapterId(user.chapter_id ? String(user.chapter_id) : "")
    setFormRole(user.role)
    setFormError(null)
    setFormSuccess(false)
    setEditingUser(user)
    setShowForm(true)
  }

  const handleSubmit = async () => {
    setFormError(null)
    setFormSuccess(false)

    if (!formName || !formEmail) {
      setFormError("Name and email are required")
      return
    }

    if (!editingUser && !formPassword) {
      setFormError("Password is required for new users")
      return
    }

    setSubmitting(true)
    try {
      if (editingUser) {
        // Update existing user profile
        const { error } = await fetch("/api/users", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingUser.id,
            name: formName,
            email: formEmail,
            chapterId: formChapterId || null,
            role: formRole,
            ...(formPassword ? { password: formPassword } : {}),
          }),
        }).then(r => r.json())

        if (error) {
          setFormError(error)
        } else {
          setFormSuccess(true)
          // Update local state
          setUsers(prev => prev.map(u =>
            u.id === editingUser.id
              ? { ...u, name: formName, email: formEmail, role: formRole, chapter_id: formChapterId ? Number(formChapterId) : null }
              : u
          ))
          setTimeout(() => { setShowForm(false); resetForm(); window.location.reload() }, 1000)
        }
      } else {
        // Create new user
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName,
            email: formEmail,
            password: formPassword,
            chapterId: formChapterId || null,
            role: formRole,
          }),
        })
        const data = await res.json()

        if (!res.ok) {
          setFormError(data.error || "Failed to create user")
        } else {
          setFormSuccess(true)
          setTimeout(() => { setShowForm(false); resetForm(); window.location.reload() }, 1000)
        }
      }
    } catch (err) {
      setFormError(String(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteUser = async (user: UserAccount) => {
    if (!confirm(`Delete user "${user.name || user.email}"? This cannot be undone.`)) return
    try {
      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id }),
      })
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== user.id))
      }
    } catch {
      // silent
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Users</h1>
              <p className="text-sm text-muted-foreground">Manage user accounts and view connected data</p>
            </div>
            {isAdmin && !showForm && (
              <Button onClick={openCreateForm} className="bg-red-600 hover:bg-red-700">
                <PlusIcon className="mr-2 size-4" />
                Create User
              </Button>
            )}
          </div>

          {/* ── Create / Edit User Form ── */}
          {showForm && isAdmin && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <UserPlusIcon className="size-4 text-red-600" />
                    {editingUser ? "Edit User" : "Create New User"}
                  </CardTitle>
                  <button onClick={() => { setShowForm(false); resetForm(); }} className="rounded p-1 hover:bg-muted">
                    <XIcon className="size-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {formError && (
                  <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-600 mb-4">
                    {formError}
                  </div>
                )}
                {formSuccess && (
                  <div className="rounded-md bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-600 mb-4 flex items-center gap-2">
                    <CheckIcon className="size-4" />
                    {editingUser ? "User updated successfully!" : "User created successfully!"}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label>Full Name <span className="text-red-500">*</span></Label>
                    <Input placeholder="John Doe" value={formName} onChange={(e) => setFormName(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Email <span className="text-red-500">*</span></Label>
                    <Input type="email" placeholder="john@example.com" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Password {editingUser && <span className="text-muted-foreground text-xs">(leave blank to keep current)</span>}<span className="text-red-500">{!editingUser && " *"}</span></Label>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} placeholder="••••••••" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} className="pr-10" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                        {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                      </button>
                    </div>
                  </div>
                  {isSuperadmin && (
                    <div className="grid gap-2">
                      <Label>Chapter</Label>
                      <Select value={formChapterId} onValueChange={(v) => setFormChapterId(v ?? "")}>
                        <SelectTrigger><SelectValue placeholder="Select chapter" /></SelectTrigger>
                        <SelectContent>
                          {chapters.map((c) => (<SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Label>Role</Label>
                    <Select value={formRole} onValueChange={(v) => setFormRole(v ?? "member")}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        {isSuperadmin && <SelectItem value="superadmin">Super Admin</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2 items-end">
                    <Button onClick={handleSubmit} disabled={submitting} className="bg-red-600 hover:bg-red-700 w-full">
                      {submitting ? (
                        <><Loader2Icon className="mr-2 size-4 animate-spin" /> {editingUser ? "Updating..." : "Creating..."}</>
                      ) : (
                        <>{editingUser ? <><CheckIcon className="mr-2 size-4" /> Update User</> : <><PlusIcon className="mr-2 size-4" /> Create User</>}</>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Summary Stats ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                  <UsersIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{users.length}</p>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
                  <HeartHandshakeIcon className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{users.reduce((s, u) => s + (u.tyfcbs_count || 0), 0)}</p>
                  <p className="text-xs text-muted-foreground">Total TYFCBs</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                  <FileTextIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{users.reduce((s, u) => s + (u.referrals_count || 0), 0)}</p>
                  <p className="text-xs text-muted-foreground">Total Referrals</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
                  <CalendarCheckIcon className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{users.reduce((s, u) => s + (u.attendance_count || 0), 0)}</p>
                  <p className="text-xs text-muted-foreground">Total Attendance</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Users Table ── */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UsersIcon className="size-5" />
                User Accounts
              </CardTitle>
              <CardDescription>Showing {users.length} accounts with connected data from all tables</CardDescription>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="flex h-32 items-center justify-center">
                  <span className="text-sm text-muted-foreground">No users found.</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8"></TableHead>
                      <TableHead className="w-10">Sno</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Chapter</TableHead>
                      <TableHead className="text-center"><span title="TYFCBs"><HeartHandshakeIcon className="size-3.5 inline" /></span></TableHead>
                      <TableHead className="text-center"><span title="Referrals"><FileTextIcon className="size-3.5 inline" /></span></TableHead>
                      <TableHead className="text-center"><span title="1 & 1s"><HandshakeIcon className="size-3.5 inline" /></span></TableHead>
                      <TableHead className="text-center"><span title="Attendance"><CalendarCheckIcon className="size-3.5 inline" /></span></TableHead>
                      <TableHead className="text-right">Created</TableHead>
                      {isAdmin && <TableHead className="w-20 text-right">Actions</TableHead>}
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
                          <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                          <TableCell className="font-medium">{user.name || "—"}</TableCell>
                          <TableCell className="text-sm">{user.email}</TableCell>
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
                          <TableCell className="text-right text-muted-foreground text-sm">
                            {new Date(user.created_at).toLocaleDateString("en-IN")}
                          </TableCell>
                          {isAdmin && (
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={() => openEditForm(user)} className="p-1.5 rounded hover:bg-muted" title="Edit">
                                  <PencilIcon className="size-3.5" />
                                </button>
                                <button onClick={() => handleDeleteUser(user)} className="p-1.5 rounded hover:bg-red-50 text-red-500" title="Delete">
                                  <Trash2Icon className="size-3.5" />
                                </button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                        {expandedUser === user.id && (
                          <TableRow key={`${user.id}-detail`}>
                            <TableCell colSpan={isAdmin ? 12 : 11} className="bg-muted/20 p-4">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="rounded-lg border bg-white p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <HeartHandshakeIcon className="size-4 text-emerald-600" />
                                    <span className="text-xs font-medium text-muted-foreground">TYFCBs</span>
                                  </div>
                                  <p className="text-2xl font-bold text-emerald-600">{user.tyfcbs_count || 0}</p>
                                  <p className="text-xs text-muted-foreground">Closed business</p>
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
                                  <p className="text-xs text-muted-foreground">Meetings</p>
                                </div>
                                <div className="rounded-lg border bg-white p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <CalendarCheckIcon className="size-4 text-amber-600" />
                                    <span className="text-xs font-medium text-muted-foreground">Attendance</span>
                                  </div>
                                  <p className="text-2xl font-bold text-amber-600">{user.attendance_count || 0}</p>
                                  <p className="text-xs text-muted-foreground">Records</p>
                                </div>
                              </div>
                              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                                <span>User ID: <code className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-mono">{user.id}</code></span>
                                <span>Chapter ID: <code className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-mono">{user.chapter_id ?? "none"}</code></span>
                                {user.chapter_id && <span>Chapter: {user.chapters?.name || `#${user.chapter_id}`}</span>}
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
