import React from 'react'
import { Link, Outlet } from 'react-router-dom'
import {
  LogOut,
  Moon,
  User,
} from "lucide-react"
import { Button } from '@/components/ui/button'
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AVATAR_FORMATTER } from '../utils/formatAvatar'
import { useAuth } from '../Context/AuthProvider'
import {useTheme} from '../Context/theme-provider'
import lightModeImg from "../assets/logo.png"
import darkModeImg from "../assets/whiteLogo.png"

export default function AuthenticatedLayout() {
  const {user,logout} = useAuth()
  const {theme,setTheme } = useTheme()
  const onLogoutClick = ()=> {
    logout()
  }
  return <>
    <div className='min-h-[100dvh] flex flex-col'>
    <div className='sticky top-0 shadow-md z-10 py-3 flex justify-between items-center px-3 bg-white dark:bg-sidebarInset'>
    <Link to="/">
    <Button variant="link" className="text-lg hover:no-underline flex items-center justify-center">
    <img src={theme && theme === 'dark' ? darkModeImg : lightModeImg} width={35} height={35} alt="" /> TeachWiseAI
    </Button>
    </Link>
    <div className='flex items-center justify-between gap-3'>
    <Button variant="ghost" size="circle" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
    <Moon className='dark:text-white' />
    </Button>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="profile" size="icon">
            <Avatar>
              <AvatarFallback>{AVATAR_FORMATTER(user.first_name,user.last_name)}</AvatarFallback>
            </Avatar> 
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem >
            <User />
            <span>Profile</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogoutClick}>
          <LogOut />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </div>
    </div>
    <Outlet/>
    </div>
  
    </>
  
}

