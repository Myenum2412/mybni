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
import { LayoutDashboardIcon, HeartHandshakeIcon, SettingsIcon, UsersIcon, ShieldIcon, UserCheckIcon, CalendarIcon } from "lucide-react"

interface NavItem {
  title: string
  url: string
  icon?: React.ReactNode
  isActive?: boolean
  items?: { title: string; url: string }[]
}

function buildNavForRole(role: string | null): NavItem[] {
  if (role === "org" || role === "dc") {
    const base = [
      { title: "Dashboard", url: "/dashboard", icon: <LayoutDashboardIcon />, isActive: true },
      { title: "Tools", url: "#", icon: <HeartHandshakeIcon />, items: [
        { title: "TYFCB", url: "/tyfcb" },
        { title: "Referral Slip", url: "/referral-slip" },
        { title: "1 & 1", url: "/one-and-one" },
      ]},
      { title: "Performance", url: "#", icon: <CalendarIcon />, items: [
        { title: "Attendance", url: "/attendance" },
      ]},
    ]
    if (role === "org") {
      return [
        ...base,
        { title: "Users", url: "/users", icon: <UsersIcon /> },
        { title: "Members", url: "/member", icon: <UserCheckIcon /> },
        { title: "Org", url: "/org", icon: <ShieldIcon /> },
      ]
    }
    // DC — no Users/Members/Org
    return base
  }

  // Member — minimal nav
  return [
    { title: "Dashboard", url: "/dashboard", icon: <LayoutDashboardIcon />, isActive: true },
    { title: "Attendance", url: "/attendance", icon: <CalendarIcon /> },
  ]
}

interface AppSidebarProps {
  role?: string | null
}

export function AppSidebar({ role }: AppSidebarProps) {
  const navItems = buildNavForRole(role ?? null)

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
