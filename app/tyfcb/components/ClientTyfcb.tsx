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
import type { Tyfcb } from "@/lib/supabase/database.types"

interface ClientTyfcbProps {
  tyfcbs: (Tyfcb & { chapters?: { name?: string } })[]
  userRole?: string | null
}

export default function ClientTyfcb({ tyfcbs, userRole }: ClientTyfcbProps) {
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
                  <BreadcrumbPage>TYFCB</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          <div>
            <h1 className="text-2xl font-bold">Thank You For Closed Business</h1>
            <p className="text-sm text-muted-foreground">Track closed business and referral revenue</p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Closed Business Records</CardTitle>
              <CardDescription>All closed business entries from chapter members</CardDescription>
            </CardHeader>
            <CardContent>
              {tyfcbs.length === 0 ? (
                <div className="flex h-32 items-center justify-center">
                  <span className="text-sm text-muted-foreground">No records found. Add entries from the entry form.</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Sno</TableHead>
                      <TableHead>User Name</TableHead>
                      <TableHead>Thank you to</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Business Type</TableHead>
                      <TableHead>Referral Type</TableHead>
                      <TableHead>Comments</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tyfcbs.map((row, index) => (
                      <TableRow key={row.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{row.user_name}</TableCell>
                        <TableCell>{row.thank_you_to}</TableCell>
                        <TableCell>{row.amount}</TableCell>
                        <TableCell>{row.business_type}</TableCell>
                        <TableCell>{row.referral_type}</TableCell>
                        <TableCell className="text-muted-foreground">{row.comments}</TableCell>
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
