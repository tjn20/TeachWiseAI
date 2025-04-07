import { ArrowLeft, ArrowUpRight, BookText, EllipsisVertical, Trash2 } from "lucide-react"
import ToolTippedButton from "@/components/app/ToolTippedButton"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { hasPermission } from "../../src/auth"
import { useNavigate } from "react-router-dom"
import { Button } from "../ui/button"
export default function CourseCard({course,user,onCourseDelete}) {
    const navigate  = useNavigate()
  // we need to fix this
  return (
    <Card className="w-full md:w-[350px] h-[220px] animate-in fade-in-0 slide-in-from-left-6 zoom-in-100 duration-300 transition dark:border-white dark:bg-transparent">
    <CardHeader className={`flex justify-between flex-row px-3 pt-2 mt-1 pb-2 ${user.role === "student" ? "h-[70px]" : "h-[50px]"}`}>
    <div className="flex flex-col flex-1 overflow-hidden h-full">
    <div className="flex items-start pt-[2px] gap-x-2 flex-1">
      <BookText/>
      <CardTitle className="w-full h-full overflow-hidden text-ellipsis whitespace-nowrap">{course.title}</CardTitle>
    </div>
    {user.role === "student" && <span className="truncate pl-8 pt-1 font-bold">by <span className="font-normal italic">{course.instructor}</span></span>}
    </div>

   {hasPermission(user,"delete:course") && <DropdownMenu modal={false}>
   <TooltipProvider delayDuration={0}> 
   <Tooltip>    
   <TooltipTrigger asChild>
    <DropdownMenuTrigger asChild className="-translate-y-[10px]">
      <Button type="button" size="sm" variant="ghost" className="focus:border-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0">
      <EllipsisVertical />
      </Button>
    </DropdownMenuTrigger>
    </TooltipTrigger>
    <TooltipContent side="bottom">
      <p>Options</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
    <DropdownMenuContent className="w-56" side="left">
      <DropdownMenuLabel>Course</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem className="items-center" onClick={onCourseDelete}>
        <Trash2 color="red" size={10}/>
        <span className="pb-[1px]">Delete Course</span>
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>}


    </CardHeader>
    <CardContent className="flex-1 flex">
      <p className={`w-full overflow-hidden break-words 
        text-gray-600 dark:text-gray-200 ${user.role === "student" ? "line-clamp-3" : "line-clamp-4"}`}>
        {course.description}
      </p>
    </CardContent>
    <CardFooter className="pb-2 px-3 flex items-center justify-between h-[50px]">
    <span className="flex rounded-sm font-semibold">{course.enrolled_students_count} Student(s)</span>
    <ToolTippedButton type="button" title="Open" size="sm" variant="ghost" onClick={()=>{hasPermission(user,"view:course") ? navigate(`/course/${course.slug}`): navigate(`/chat/${course.url}`)}}>
    <ArrowUpRight />
    </ToolTippedButton>
    </CardFooter>
  </Card>
  )
}
