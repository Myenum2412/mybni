import { createClient } from "@/lib/supabase/server"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { LayoutDashboardIcon, HeartHandshakeIcon, FileTextIcon, HandshakeIcon, BuildingIcon, SettingsIcon, UsersIcon, ShieldIcon, UserCheckIcon, CalendarIcon, BarChart3Icon } from "lucide-react"

interface NavItem {
  title: string
  url: string
  icon?: React.ReactNode
  isActive?: boolean
  items?: { title: string; url: string }[]
}

function buildNavForRole(role: string | null): NavItem[] {
  // Admin (chapter admin) — limited nav, chapter-scoped only
  if (role === "admin") {
    return [
      { title: "Dashboard", url: "/dashboard", icon: <LayoutDashboardIcon />, isActive: true },
      {
        title: "Tools", url: "#", icon: <HeartHandshakeIcon />, items: [
          { title: "TYFCB", url: "/tyfcb" },
          { title: "Referral Slip", url: "/referral-slip" },
          { title: "1 & 1", url: "/one-and-one" },
        ],
      },
      {
        title: "Performance", url: "#", icon: <CalendarIcon />, items: [
          { title: "Attendance", url: "/attendance" },
        ],
      },
      { title: "Reports", url: "/reports", icon: <BarChart3Icon /> },
    ]
  }

  // Member — attendance only via /members
  if (role === "member") {
    return [
      { title: "Dashboard", url: "/dashboard", icon: <LayoutDashboardIcon />, isActive: true },
      { title: "Members", url: "/members", icon: <UserCheckIcon /> },
    ]
  }

  // Superadmin / default — full nav
  return [
    { title: "Dashboard", url: "/dashboard", icon: <LayoutDashboardIcon />, isActive: true },
    {
      title: "Tools", url: "#", icon: <HeartHandshakeIcon />, items: [
        { title: "TYFCB", url: "/tyfcb" },
        { title: "Referral Slip", url: "/referral-slip" },
        { title: "1 & 1", url: "/one-and-one" },
        { title: "Chapters", url: "/chapters" },
      ],
    },
    {
      title: "Performance", url: "#", icon: <CalendarIcon />, items: [
        { title: "Attendance", url: "/attendance" },
        { title: "Visitor", url: "/visitor" },
        { title: "Testimonials", url: "/testimonials" },
      ],
    },
    { title: "Users", url: "/users", icon: <UsersIcon /> },
    { title: "Members", url: "/members", icon: <UserCheckIcon /> },
    { title: "Admin", url: "/admin", icon: <ShieldIcon /> },
  ]
}

export async function AppSidebar() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  let role: string | null = null
  if (session?.user) {
    const { data } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single()
    role = data?.role ?? null
  }

  const navItems = buildNavForRole(role)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<a href="/settings" />} tooltip="Settings">
              <SettingsIcon />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <NavUser user={{ name: "BNI Member", email: "member@bni.com", avatar: "/avatars/member.jpg" }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
