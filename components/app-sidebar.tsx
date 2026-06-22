"use client"

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
import { LayoutDashboardIcon, HeartHandshakeIcon, FileTextIcon, HandshakeIcon, BuildingIcon, SettingsIcon, UsersIcon, ShieldIcon, UserCheckIcon } from "lucide-react"

const data = {
  user: {
    name: "BNI Member",
    email: "member@bni.com",
    avatar: "/avatars/member.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
      isActive: true,
    },
    {
      title: "Tools",
      url: "#",
      icon: <HeartHandshakeIcon />,
      items: [
        {
          title: "TYFCB",
          url: "/tyfcb",
        },
        {
          title: "Referral Slip",
          url: "/referral-slip",
        },
        {
          title: "1 & 1",
          url: "/one-and-one",
        },
        {
          title: "Chapters",
          url: "/chapters",
        },
      ],
    },
    {
      title: "Users",
      url: "/users",
      icon: <UsersIcon />,
    },
    {
      title: "Members",
      url: "/members",
      icon: <UserCheckIcon />,
    },
    {
      title: "Admin",
      url: "/admin",
      icon: <ShieldIcon />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
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
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
