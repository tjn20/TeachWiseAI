import { useEffect, useState } from "react"
import axiosClient from "../axios"
import { useAuth } from "../Context/AuthProvider"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowUpRight, EllipsisVertical, Info, Pen, StepBack, Trash, Trash2 } from "lucide-react"
import { HashLoader } from "react-spinners"
import ToolTippedButton from "@/components/app/ToolTippedButton"
import { Separator } from "../../components/ui/separator"
import FileItem from "../../components/app/FileItem"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBook, faFolderOpen,faUsers } from "@fortawesome/free-solid-svg-icons"
import EnrolledStudentItem from "../../components/app/EnrolledStudentItem"
import WaitlistedStudentItem from "../../components/app/WaitlistedStudentItem"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../../components/ui/dropdown-menu"
import { toast } from "sonner"
import CourseDeletionDialog from "../../components/app/CourseDeletionDialog"
import { useTheme } from "../Context/theme-provider"
import { Helmet } from "react-helmet-async"

export default function ViewCourse() {
    const {theme} = useTheme()
    const [course,setCourse] = useState(null)
    const [isCourseLoading,setIsCourseLoading] = useState(true)
    const [isMediumScreen,setIsMediumScreen] = useState(false)
    const [isDeleteDialogOpen,setIsDeleteDialogOpen] = useState(false)
    const {handleSessionTimeOut} = useAuth()
    const { slug } = useParams()
    const navigate  = useNavigate()
    useEffect(()=>{
       axiosClient.get(`/course/${slug}`)
       .then(({data})=>{
        setCourse(data)
        setIsCourseLoading(false)
       }).catch(error=>{
        handleSessionTimeOut(error)
        toast.warning("Something Went Wrong! Please Try again later")
       }) 
    },[])

    useEffect(()=>{
        const handler = () => {
            if(window.innerWidth <= 768)
               setIsMediumScreen(true)
            else
                setIsMediumScreen(false)
        }
        window.addEventListener('resize',handler)
        handler()
        return ()=> window.removeEventListener('resize',handler)
    },[])


    const onCourseDelete = () => {
        setIsDeleteDialogOpen(false)
        axiosClient.delete(`courses/${course.id}`)
        .then(({data})=>{
          toast.success(data.message)
          navigate(-1,{
            replace:true
          })
        })
        .catch((error)=>{
          handleSessionTimeOut(error)
          toast.warning("Something Went Wrong!")
        })
      }

  return (
    <>
     <Helmet>
        <title>{course?.title || "Loading..."}</title>
      </Helmet>
    <div className="flex-1 flex flex-col dark:bg-main">
        {isCourseLoading && (
            <span className="flex items-center flex-1 self-center">
                <HashLoader size={30} className="items-center justify-center" color={theme === "light" ? "black" : "white"}  />
            </span>
        )}
        {!isCourseLoading && (
            <div className="p-4 pt-7 flex flex-col gap-1">
                <div className="flex justify-between items-center flex-wrap">
                <div className="flex items-center gap-1">
                <ToolTippedButton onClick={()=>navigate(-1,{
                    replace:true
                })} type="button" title="Back" size="icon" variant="ghost" >
                    <StepBack />
                </ToolTippedButton>  
                <h1 className="text-2xl font-bold pb-[5px] dark:text-white">{course.title}</h1>
                </div>
                <div className="items-center gap-2 ml-auto hidden md:flex">
                    <ToolTippedButton onClick={()=>navigate(`/edit/course/${course.slug}`)} type="button" title="Edit" size="icon" variant="ghost" >
                        <Pen/>
                    </ToolTippedButton>
                    <ToolTippedButton onClick={()=>setIsDeleteDialogOpen(true)} type="button" title="Delete" size="icon" variant="ghost">
                        <Trash color="red" />
                    </ToolTippedButton>
                    <ToolTippedButton onClick={()=>navigate(`/chat/${course.url}`)} type="button" title="Chat" size="icon" variant="ghost">
                        <ArrowUpRight/>
                    </ToolTippedButton>
                </div>
                {isMediumScreen && <DropdownMenu modal={false}>
                    <DropdownMenuTrigger>
                    <ToolTippedButton type="button" title="options" size="sm" variant="ghost" className="focus:border-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                    <EllipsisVertical />
                    </ToolTippedButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" side="left">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                        <DropdownMenuItem className="items-center p-2" onClick={()=>navigate(`/edit/course/${course.slug}`)}>
                            <Pen size={10}/>
                            <span className="pb-[2px]">Edit Course</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="items-center p-2" onClick={()=>setIsDeleteDialogOpen(true)}>
                            <Trash2  size={10} color="red"/>
                            <span className="pb-[1px]">Delete Course</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="items-center p-2" onClick={()=>navigate(`/chat/${course.url}`)}>
                            <ArrowUpRight size={10}/>
                            <span className="pb-[2px]">Chat</span>
                        </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>}
                <Separator className="my-7 w-[90%] mx-auto flex bg-gray-300"/> 
                </div>
                <div className="flex flex-col gap-5">
                {course.description && <div className="border-2 border-dashed rounded-xl p-5 pt-3 animate-in fade-in-0 duration-200">
                <div className="flex items-baseline gap-3">
                <FontAwesomeIcon icon={faBook} color={theme === "light" ? "black" : "white"} /> 
                <h3 className="text-lg font-bold mb-2 dark:text-white">Description</h3>
                </div>
                <p className="text-black dark:text-gray-200">{course.description}</p>
                </div>}
                <div className="border-2 border-dashed rounded-xl p-5 pt-3 animate-in fade-in-0 duration-300">
                    <div className="flex items-baseline gap-3 mb-4">
                    <FontAwesomeIcon icon={faFolderOpen} color={theme === "light" ? "black" : "white"} />    
                    <h3 className="text-lg font-bold dark:text-white">Course Material</h3>
                    </div>
                    <div className="flex flex-col gap-3">
                        {course.files.map((file,index)=>(
                            <FileItem key={index} file={file} />
                        ))}
                    </div>
                </div>
                {course.enrolled_students_count > 0 && <div className="border-2 border-dashed rounded-xl p-5 pt-3 animate-in fade-in-0 duration-400">
                    <div className="flex items-baseline gap-3 mb-4">
                        <FontAwesomeIcon icon={faUsers}color={theme === "light" ? "black" : "white"} />    
                        <div className="flex flex-col">
                        <h3 className="text-lg font-bold dark:text-white">Enrolled Students</h3>
                        <span className="text-sm font-semibold dark:text-gray-50">{course.enrolled_students_count} Student(s)</span>  
                        </div>
                    </div>
                    <div className="flex flex-col">
                        {course.enrolled_students.map((student,index)=>(
                            <div className="flex items-center dark:text-white">
                                <span className="font-semibold">{index + 1}</span>.<EnrolledStudentItem key={index} student={student} />
                            </div>    
                        ))}
                    </div>
                </div>}
                {course.waitlisted_students_count > 0 && <div className="border-2 border-dashed rounded-xl p-5 pt-3 animate-in fade-in-0 duration-500">
                <div className="flex items-baseline gap-3">
                        <FontAwesomeIcon icon={faUsers} color={theme === "light" ? "black" : "white"}/>    
                        <div className="flex flex-col">
                        <div className="flex items-center">
                        <h3 className="text-lg font-bold dark:text-white">Waitlisted Students</h3>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="circle" className="pt-[3.5px] focus:border-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                                <Info size={14}/>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="top" className="w-56 p-4">
                            <p className="font-mono text-sm">These students have not registered on the platform yet.Once they complete their registration, 
                                they will be automatically enrolled in this course.</p>
                        </DropdownMenuContent>
                        </DropdownMenu>
    
                        </div>
                        <span className="text-sm font-semibold -translate-y-[6px] dark:text-gray-100">{course.waitlisted_students_count} Student(s)</span>  
                        </div>
                        </div>
                    <div className="flex flex-col">
                        {course.waitlisted_students.map((student,index)=>(
                            <div className="flex items-center dark:text-white">
                                <span className="font-semibold">{index + 1}</span>. <WaitlistedStudentItem key={index} student={student} />
                            </div>
                        ))}
                    </div>
                </div>}
                </div>
            </div>
        )}
        <CourseDeletionDialog open={isDeleteDialogOpen} onCancel={()=>setIsDeleteDialogOpen(false)} onConfirm={()=>onCourseDelete()} />
    </div>
    </>
  )
  
}
