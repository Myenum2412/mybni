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
import { useOneAndOnes } from "@/lib/supabase/hooks"

export default function OneAndOnePage() {
  const { oneAndOnes, loading } = useOneAndOnes()

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
                  <BreadcrumbPage>1 & 1</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          <div>
            <h1 className="text-2xl font-bold">1 & 1 Meetings</h1>
            <p className="text-sm text-muted-foreground">Track one-on-one member meetings</p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Meeting Records</CardTitle>
              <CardDescription>All 1 & 1 meeting entries from chapter members</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex h-32 items-center justify-center">
                  <span className="text-sm text-muted-foreground">Loading...</span>
                </div>
              ) : oneAndOnes.length === 0 ? (
                <div className="flex h-32 items-center justify-center">
                  <span className="text-sm text-muted-foreground">No records found. Add entries from the entry form.</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Sno</TableHead>
                      <TableHead>User Name</TableHead>
                      <TableHead>Met With</TableHead>
                      <TableHead>Initiated By</TableHead>
                      <TableHead>Where did you meet?</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Topics of Conversation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {oneAndOnes.map((row, index) => (
                      <TableRow key={row.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{row.user_name}</TableCell>
                        <TableCell>{row.met_with}</TableCell>
                        <TableCell>{row.initiated_by}</TableCell>
                        <TableCell>{row.where_did_you_meet}</TableCell>
                        <TableCell>{row.date}</TableCell>
                        <TableCell className="text-muted-foreground">{row.topics_of_conversation}</TableCell>
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
