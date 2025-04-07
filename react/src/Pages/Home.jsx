import { useEffect, useState } from "react"
import { useAuth } from "../Context/AuthProvider"
import { hasPermission } from "../auth"
import { Separator } from "@/components/ui/separator"
import { CircleOff,Plus } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import ToolTippedButton from "@/components/app/ToolTippedButton"
import { useEventBus } from "../Context/EventProvider"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import CourseCard from "../../components/app/CourseCard"
import axiosClient from "../axios"
import CourseDeletionDialog from "../../components/app/CourseDeletionDialog"
import SkeletonLoaderCard from "../../components/app/SkeletonLoaderCard"
import { Helmet } from "react-helmet-async"
export default function Home() {
  const {user,handleSessionTimeOut} = useAuth()
  const [courses,setCourses] = useState([])
  const [deletedCourseDialogId,setDeletedCourseDialogId] = useState(null)
  const {on} = useEventBus()
  const [isLoading,setIsLoading] = useState(true)
  const navigate = useNavigate()
  useEffect(()=>{
    const courseCreated = on('course.created',(course)=>{
      setCourses(prev=>[course,...prev])
    })
    const courseLocked = on('course.locked',(course)=>{
      setCourses(prev=>prev.filter(c => c.id !== course.id))
    })
    const courseRemoved = on('course.removed',(course)=>{
      setCourses(prev=>prev.filter(c => c.id !== course.id))
    })
    const addedToCourse = on('course.added',(course)=>{
      setCourses(prev=>[course,...prev])
    })
    const courseEdited = on('course.edited',(course)=>{
      setCourses(prev => [course,...prev]);
    })
    return ()=> {
      courseCreated()
      courseLocked()
      courseRemoved()
      addedToCourse()
      courseEdited()
    }

  },[on])

/*   useEffect(()=>{
    const courseLocked = on('course.locked',(course)=>{
      setCourses(prev=>prev.filter(c => c.id !== course.id))
    })

    return ()=> courseLocked()
  },[on]) */

 /*  useEffect(()=>{
    const courseRemoved = on('course.removed',(course)=>{
      setCourses(prev=>prev.filter(c => c.id !== course.id))
    })

    return ()=> courseRemoved()
  },[on]) */

/*   useEffect(()=>{
    const addedToCourse = on('course.added',(course)=>{
      setCourses(prev=>[course,...prev])
    })
    return ()=> addedToCourse()

  },[on]) */

 /*  useEffect(()=>{
    const courseEdited = on('course.edited',(course)=>{
      setCourses(prev => [course,...prev]);
    })
    return ()=> courseEdited()

  },[on]) */

  useEffect(()=>{
    axiosClient.get('/courses')
    .then(({data})=>{
      setCourses(data)
    })
    .catch((error)=>{
      handleSessionTimeOut(error)

    })
    .finally(()=>{
    setIsLoading(false)
    })
  },[])


  const onCourseDelete = (id) => {
    if(!id) return
    setDeletedCourseDialogId(null)
    const course = courses.find(c=>c.id === id)
    setCourses(prev=>prev.filter(c=>c.id !== id))
    axiosClient.delete(`courses/${id}`)
    .then(({data})=>{
      toast.success(data.message)
    })
    .catch((error)=>{
      handleSessionTimeOut(error)
      toast.warning("Something Went Wrong!")
      setCourses(prev=>[course,...prev])
    })
  }

  return (
    <>
     <Helmet>
        <title>TeachWiseAI</title>
      </Helmet>
    <div className="flex flex-col overflow-auto flex-1 dark:bg-main">
      <div className="flex items-center justify-between px-7 py-3 mt-2">
            <h1 className="text-2xl font-bold dark:text-white">My Courses</h1>
            {hasPermission(user,"create:course") && <ToolTippedButton title="Create Course" size="circle" variant="ghost" onClick={()=>navigate('create/course')}>
              <Plus className="dark:text-white"/>
            </ToolTippedButton>}
          </div>
         <div className="px-6">
         <Separator />
         </div>
         {(!isLoading && courses.length === 0 ) && 
          (user.role === "instructor" ? (<div className="text-slate-800 text-xl flex items-center justify-center flex-1 flex-col animate-in fade-in-0 slide-in-from-top-6 zoom-in-100 duration-300 dark:text-white"><CircleOff /> You don't have any created courses yet.</div>) 
          : 
          (<div className="text-slate-800 text-xl flex items-center justify-center flex-1 flex-col animate-in fade-in-0 slide-in-from-top-6 zoom-in-100 duration-300 dark:text-white"><CircleOff />You are not enrolled in any courses yet.</div>))

         }
          <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(350px,1fr))] py-4 px-4 justify-items-center md:justify-items-center ">
          {isLoading && Array.from({length:8}).map(()=>(
            <SkeletonLoaderCard/>
          ))}
          {!isLoading && courses.map((course,index)=>(
            <CourseCard key={index} course={course} user={user} onCourseDelete={()=>setDeletedCourseDialogId(course.id)} />
          ))}
    </div>
{/*     <div className="w-full bottom-0 mt-auto py-3">
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
    </div> */}
    {hasPermission(user,"delete:course") && <CourseDeletionDialog open={deletedCourseDialogId !== null} onCancel={()=>setDeletedCourseDialogId(null)} onConfirm={()=>onCourseDelete(deletedCourseDialogId)} />}
    </div>
    </>
  )
}
