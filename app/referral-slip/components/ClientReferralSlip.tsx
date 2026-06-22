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
import { Badge } from "@/components/reui/badge"
import type { Referral } from "@/lib/supabase/database.types"

interface ClientReferralSlipProps {
  referrals: (Referral & { chapters?: { name?: string } })[]
}

export default function ClientReferralSlip({ referrals }: ClientReferralSlipProps) {
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
                  <BreadcrumbPage>Referral Slip</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          <div>
            <h1 className="text-2xl font-bold">Referral Slip</h1>
            <p className="text-sm text-muted-foreground">Manage and track member referrals</p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Referral Records</CardTitle>
              <CardDescription>All referral entries from chapter members</CardDescription>
            </CardHeader>
            <CardContent>
              {referrals.length === 0 ? (
                <div className="flex h-32 items-center justify-center">
                  <span className="text-sm text-muted-foreground">No records found. Add entries from the entry form.</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Sno</TableHead>
                      <TableHead>User Name</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Referral Type</TableHead>
                      <TableHead>Referral Status</TableHead>
                      <TableHead>Referral</TableHead>
                      <TableHead>Telephone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referrals.map((row, index) => (
                      <TableRow key={row.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{row.user_name}</TableCell>
                        <TableCell>{row.referred_to}</TableCell>
                        <TableCell>{row.referral_type}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              row.referral_status === "Closed"
                                ? "success"
                                : row.referral_status === "In Progress"
                                  ? "warning"
                                  : "secondary"
                            }
                            size="sm"
                          >
                            {row.referral_status}
                          </Badge>
                        </TableCell>
                        <TableCell>{row.referral}</TableCell>
                        <TableCell>{row.telephone}</TableCell>
                        <TableCell>{row.email}</TableCell>
                        <TableCell className="text-muted-foreground">{row.address}</TableCell>
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
