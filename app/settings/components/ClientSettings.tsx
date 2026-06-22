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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { PlusIcon, PencilIcon, Trash2Icon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Chapter, ChapterInsert } from "@/lib/supabase/database.types"

interface ClientSettingsProps {
  chapters: Chapter[]
}

export default function ClientSettings({ chapters: initialChapters }: ClientSettingsProps) {
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters)
  const supabase = createClient()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    region: null as string | null,
    meeting_day: null as string | null,
    meeting_time: "",
    location: "",
    president: "",
    members: "",
  })

  const resetForm = () => {
    setFormData({
      name: "",
      region: null,
      meeting_day: null,
      meeting_time: "",
      location: "",
      president: "",
      members: "",
    })
  }

  const handleAdd = async () => {
    const { data } = await supabase
      .from("chapters")
      .insert({
        name: formData.name,
        region: formData.region ?? "",
        meeting_day: formData.meeting_day ?? "",
        meeting_time: formData.meeting_time,
        location: formData.location,
        president: formData.president,
        members: Number(formData.members) || 0,
      })
      .select()
      .single()
    if (data) {
      setChapters((prev) => [...prev, data])
    }
    resetForm()
    setIsAddOpen(false)
  }

  const handleEdit = (chapter: Chapter) => {
    setEditingChapter(chapter)
    setFormData({
      name: chapter.name,
      region: chapter.region,
      meeting_day: chapter.meeting_day,
      meeting_time: chapter.meeting_time,
      location: chapter.location,
      president: chapter.president,
      members: String(chapter.members),
    })
    setIsEditOpen(true)
  }

  const handleUpdate = async () => {
    if (!editingChapter) return
    const { data } = await supabase
      .from("chapters")
      .update({
        name: formData.name,
        region: formData.region ?? "",
        meeting_day: formData.meeting_day ?? "",
        meeting_time: formData.meeting_time,
        location: formData.location,
        president: formData.president,
        members: Number(formData.members) || 0,
      })
      .eq("id", editingChapter.id)
      .select()
      .single()
    if (data) {
      setChapters((prev) => prev.map((c) => (c.id === editingChapter.id ? data : c)))
    }
    resetForm()
    setIsEditOpen(false)
    setEditingChapter(null)
  }

  const handleDelete = async (id: number) => {
    await supabase.from("chapters").delete().eq("id", id)
    setChapters((prev) => prev.filter((c) => c.id !== id))
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
                  <BreadcrumbPage>Settings</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage chapters and application settings</p>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Chapter List</CardTitle>
                <CardDescription>Add, edit, or remove BNI chapters</CardDescription>
              </div>
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger
                  render={
                    <Button size="sm">
                      <PlusIcon className="mr-2 size-4" />
                      Add Chapter
                    </Button>
                  }
                />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Chapter</DialogTitle>
                    <DialogDescription>Fill in the details to create a new BNI chapter</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Chapter Name</Label>
                      <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="BNI Victory" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="region">Region</Label>
                      <Select value={formData.region} onValueChange={(v) => setFormData({ ...formData, region: v })}>
                        <SelectTrigger id="region">
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="North">North</SelectItem>
                          <SelectItem value="South">South</SelectItem>
                          <SelectItem value="East">East</SelectItem>
                          <SelectItem value="West">West</SelectItem>
                          <SelectItem value="Central">Central</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="meetingDay">Meeting Day</Label>
                        <Select value={formData.meeting_day} onValueChange={(v) => setFormData({ ...formData, meeting_day: v })}>
                          <SelectTrigger id="meetingDay">
                            <SelectValue placeholder="Day" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Monday">Monday</SelectItem>
                            <SelectItem value="Tuesday">Tuesday</SelectItem>
                            <SelectItem value="Wednesday">Wednesday</SelectItem>
                            <SelectItem value="Thursday">Thursday</SelectItem>
                            <SelectItem value="Friday">Friday</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="meetingTime">Meeting Time</Label>
                        <Input id="meetingTime" value={formData.meeting_time} onChange={(e) => setFormData({ ...formData, meeting_time: e.target.value })} placeholder="7:00 AM" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Hotel Grand Palace" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="president">President</Label>
                      <Input id="president" value={formData.president} onChange={(e) => setFormData({ ...formData, president: e.target.value })} placeholder="Rahul Sharma" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="members">Members</Label>
                      <Input id="members" type="number" value={formData.members} onChange={(e) => setFormData({ ...formData, members: e.target.value })} placeholder="32" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => { resetForm(); setIsAddOpen(false); }}>Cancel</Button>
                    <Button onClick={handleAdd}>Add Chapter</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {chapters.length === 0 ? (
                <div className="flex h-32 items-center justify-center">
                  <span className="text-sm text-muted-foreground">No chapters found. Add a chapter to get started.</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Sno</TableHead>
                      <TableHead>Chapter Name</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Meeting Day</TableHead>
                      <TableHead>Meeting Time</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>President</TableHead>
                      <TableHead className="text-right">Members</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chapters.map((chapter, index) => (
                      <TableRow key={chapter.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{chapter.name}</TableCell>
                        <TableCell>{chapter.region}</TableCell>
                        <TableCell>{chapter.meeting_day}</TableCell>
                        <TableCell>{chapter.meeting_time}</TableCell>
                        <TableCell>{chapter.location}</TableCell>
                        <TableCell>{chapter.president}</TableCell>
                        <TableCell className="text-right">{chapter.members}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                              <DialogTrigger
                                render={
                                  <Button variant="ghost" size="icon" onClick={() => handleEdit(chapter)}>
                                    <PencilIcon className="size-4" />
                                  </Button>
                                }
                              />
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Chapter</DialogTitle>
                                  <DialogDescription>Update chapter details</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-name">Chapter Name</Label>
                                    <Input id="edit-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-region">Region</Label>
                                    <Select value={formData.region} onValueChange={(v) => setFormData({ ...formData, region: v })}>
                                      <SelectTrigger id="edit-region"><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="North">North</SelectItem>
                                        <SelectItem value="South">South</SelectItem>
                                        <SelectItem value="East">East</SelectItem>
                                        <SelectItem value="West">West</SelectItem>
                                        <SelectItem value="Central">Central</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                      <Label htmlFor="edit-meetingDay">Meeting Day</Label>
                                      <Select value={formData.meeting_day} onValueChange={(v) => setFormData({ ...formData, meeting_day: v })}>
                                        <SelectTrigger id="edit-meetingDay"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Monday">Monday</SelectItem>
                                          <SelectItem value="Tuesday">Tuesday</SelectItem>
                                          <SelectItem value="Wednesday">Wednesday</SelectItem>
                                          <SelectItem value="Thursday">Thursday</SelectItem>
                                          <SelectItem value="Friday">Friday</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor="edit-meetingTime">Meeting Time</Label>
                                      <Input id="edit-meetingTime" value={formData.meeting_time} onChange={(e) => setFormData({ ...formData, meeting_time: e.target.value })} />
                                    </div>
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-location">Location</Label>
                                    <Input id="edit-location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-president">President</Label>
                                    <Input id="edit-president" value={formData.president} onChange={(e) => setFormData({ ...formData, president: e.target.value })} />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-members">Members</Label>
                                    <Input id="edit-members" type="number" value={formData.members} onChange={(e) => setFormData({ ...formData, members: e.target.value })} />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => { resetForm(); setIsEditOpen(false); setEditingChapter(null); }}>Cancel</Button>
                                  <Button onClick={handleUpdate}>Save Changes</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(chapter.id)}>
                              <Trash2Icon className="size-4 text-destructive" />
                            </Button>
                          </div>
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
