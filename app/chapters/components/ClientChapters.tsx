"use client"

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
import type { Chapter } from "@/lib/supabase/database.types"

interface ClientChaptersProps {
  chapters: Chapter[]
  userRole?: string | null
}

export default function ClientChapters({ chapters, userRole }: ClientChaptersProps) {
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
                  <BreadcrumbPage>Chapters</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          <div>
            <h1 className="text-2xl font-bold">Chapters</h1>
            <p className="text-sm text-muted-foreground">BNI chapter directory and details</p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Chapter Directory</CardTitle>
              <CardDescription>All BNI chapters in the network</CardDescription>
            </CardHeader>
            <CardContent>
              {chapters.length === 0 ? (
                <div className="flex h-32 items-center justify-center">
                  <span className="text-sm text-muted-foreground">No chapters found. Add chapters from Settings.</span>
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chapters.map((row, index) => (
                      <TableRow key={row.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{row.name}</TableCell>
                        <TableCell>{row.region}</TableCell>
                        <TableCell>{row.meeting_day}</TableCell>
                        <TableCell>{row.meeting_time}</TableCell>
                        <TableCell>{row.location}</TableCell>
                        <TableCell>{row.president}</TableCell>
                        <TableCell className="text-right">{row.members}</TableCell>
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
