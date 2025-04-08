import { BookOpen, Bot, Calendar, Frame, Home, Inbox, Loader, Moon, PieChart, Search, Settings, Settings2, SquareTerminal } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter
} from "@/components/ui/sidebar"


import whiteLogo from "@/src/assets/whiteLogo.png"
import { NavCourses } from "./NavCourses"
import { NavUser } from "./NavUser"
import NavSecondary from "./NavSecondary"
import { Link } from "react-router-dom"
import { useTheme } from "../../src/Context/theme-provider"


export function AppSidebar({
  side="left",
  variant="sidebar",
  user,
  courses,
  isCoursesLoading,
  activeCourseId,
  onConversationClear
}) {
  const {theme,setTheme } = useTheme()

  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    items: [
      {
        title: "Home",
        url: "#",
        icon: Home,
      },
    ],
    navCourses: [
      {
        title: "Courses",
        icon: SquareTerminal,
        isActive: true,
        items: [
          {
            title: "History",
            url: "#",
          },
          {
            title: "Starred",
            url: "#",
          },
          {
            title: "Settings",
            url: "#",
          },
        ],
      },
    ],
    navSecondary:[
    {
      title: "Theme",
      icon: Moon,
      onClick:() => setTheme(theme === "light" ? "dark" : "light")
    },
    ]
  
  }
 // to fix later
  const navCourses = [
    {
      title: "Courses",
      icon: SquareTerminal,
      isActive: true,
      items: courses
    }
  ]

  const onConversationClearClick = (id) => {
    alert(id)
  }

  return (
    <Sidebar side={side} variant={variant} collapsible="icon" className="dark:group-data-[side=left]:border-r-sidebar-secondaryBorder">
       <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="hover:bg-transparent" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <img src={whiteLogo} alt="" className="size-4" />
                </div>
                  <span className="font-bold">TeachWiseAI</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
      <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
            <SidebarMenuItem key="Home">
              <SidebarMenuButton asChild tooltip="Home">
                <Link to="/">
                  <Home/>
                  <span>Home</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      {isCoursesLoading ? <div className="pt-[100%]">
        <Loader size={10} className="animate-spin m-auto" />
      </div>: <NavCourses items={navCourses} onConversationClear={onConversationClear} activeCourseId={activeCourseId} />}
      </SidebarGroupContent>
    </SidebarGroup>
    <NavSecondary items={data.navSecondary} className="mt-auto"/>
      </SidebarContent>
      <SidebarFooter className="pt-0">
        <NavUser user={user} />
      </SidebarFooter>  
    </Sidebar>
  )
}   