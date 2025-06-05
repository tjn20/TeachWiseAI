
import { ChevronRight, MoreHorizontal, Trash2 } from "lucide-react"
import {Link} from 'react-router-dom'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "../ui/sidebar"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
 } from "../ui/dropdown-menu"
import { Button } from "../ui/button"

export function NavCourses({
  items,activeCourseId ,onConversationClear
}) {

  return (
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.url} className={`flex items-center justify-between hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg h-8 ${subItem.id === activeCourseId && "bg-sidebar-accent text-sidebar-accent-foreground"}`}>
                      <SidebarMenuSubButton asChild className="flex-1 hover:bg-none h-full">
                        {<Link   to={subItem.url && `/chat/${subItem.url}`}> 
                          <span>{subItem.title}</span>
                        </Link>
                        }
                      </SidebarMenuSubButton>
                      {subItem.id === activeCourseId && <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                      <Button type="button" size="sm" variant="none" className="focus:border-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                      <MoreHorizontal  />
                      </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" align="start">
                        <DropdownMenuItem onClick={()=>onConversationClear(subItem)}>
                          <Trash2 color="red"/>
                          <span>Clear Conversation</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>}
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
  )
}
