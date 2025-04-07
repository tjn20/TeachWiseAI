import { SidebarProvider,SidebarTrigger,SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app/AppSideBar"
import Chat from "../Pages/Chat"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "../Context/AuthProvider"
import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import axiosClient from "../axios"
import { Loader } from "lucide-react"
import axios from "axios"
import { useEventBus } from "../Context/EventProvider"
import { Helmet } from "react-helmet-async"
export default function ChatLayout() {
  const {user,handleSessionTimeOut} = useAuth()
  const [courses,setCourses] = useState([])
  const [isSidebarCoursesLoading,setIsSidebarLoading] = useState(true)
  const navigate = useNavigate()
  const {on} = useEventBus()
  const {id:conversationId} = useParams()
  const [conversationData,setConversationData] = useState(null)
  const controllerRef = useRef(null);

  useEffect(() => {
    if (!conversationId) return;
    
    if(conversationData) setConversationData(null)
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    fetchConversation(conversationId, controller);

    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, [conversationId]);

  useEffect(()=>{
    
    axiosClient.get('/conversations').then(({data})=>{
      setCourses(data)
    }).catch((error)=>{
      handleSessionTimeOut(error)
    }).finally(()=>{
      setIsSidebarLoading(false)
    })
  },[])

  useEffect(()=>{
    const courseCreated = on('course.created',(course)=>{
      setCourses(prev=>[...prev,course])
    })
    return ()=> courseCreated()
  },[on])

  useEffect(() => {
    const offCourseLocked = on('course.locked', () => {}); 

    const courseLocked = on('course.locked', (course) => {

        const currentCourse = courses.find(c => c.id === course.id);
        if (currentCourse) {
            navigate("/");
        } else {
            setCourses(prev => prev.filter(c => c.id !== course.id));
        }
    });

    return () => {
        offCourseLocked(); 
        courseLocked(); 
    };
}, [on, courses, conversationId, navigate]); 


  useEffect(()=>{
    const courseEdited = on('course.edited',(course)=>{
        setCourses(prev=>[...prev,course])
    })
    return ()=> courseEdited()
  },[on])

  const fetchConversation = async (conversationId, controller) => {
    try {
      const { data } = await axiosClient.get(`conversations/${conversationId}`, {
        signal: controller.signal,
      });
      setConversationData(data);
    } catch (error) {
      if (axios.isCancel(error)) return 
      handleSessionTimeOut(error)
      console.log(error)
    }
  };

  
  return (
    <>
    <Helmet>
      <title>{conversationData ? conversationData.course_title : "Loading..."}</title>
    </Helmet>
    <SidebarProvider>  
        <AppSidebar user={user} courses={courses} activeCourseId={conversationData?.course_id} isCoursesLoading={isSidebarCoursesLoading}/>
        <SidebarInset className="z-0 h-svh"> {/* #e5e7eb */}
        <header className="flex sticky top-0 h-16 shrink-0 items-center gap-2 border-b px-4 z-20 bg-sidebarInset dark:border-b-sidebarInset-border">
          <SidebarTrigger className="-ml-1 dark:text-white" />
          <Separator orientation="vertical" className="mr-2 h-4 dark:bg-white" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">
                  Courses
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold">{conversationData ? <div className="flex flex-col">
                  <span>
                    {conversationData.course_title}
                  </span>
                 {user.role === "student" && <span className="text-xs font-normal">
                    By {conversationData.course_instructor}
                  </span>}
                </div> : <Loader size={9} className="animate-spin" />}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        {conversationData ? <Chat nextCursor={conversationData.nextCursor || null} messages={conversationData.messages} conversationId={conversationId} handleSessionTimeOut={handleSessionTimeOut}/>: (<div className="self-center place-self-center flex-1 w-full flex items-center justify-center gap-1">
          <span className="loading loading-bars loading-xs"></span>
          <span className="loading loading-bars loading-sm"></span>
          <span className="loading loading-bars loading-md"></span>
        </div>)}
        
        </SidebarInset>

    </SidebarProvider>
    </>
  )
}
