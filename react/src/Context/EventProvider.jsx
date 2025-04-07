import { useContext, useEffect, useRef,createContext } from "react"
import echo from "../echo";
import { toast } from "sonner";
import { useAuth } from "./AuthProvider";


const EventContext = createContext()

export default function EventProvider({children}) {

    const events = useRef({});
    const {user,handleSessionTimeOut} = useAuth()
    const emit = (name, data) => {
        if (events.current[name]) {
            for (let cb of events.current[name]) {
                cb(data);
            }
        }
    };

    const on = (name, cb) => {
        if (!events.current[name]) {
            events.current[name] = [];
        }
        events.current[name].push(cb);

        return () => {
            events.current[name] = events.current[name].filter(callback => callback !== cb);
        };
    };

    useEffect(() => {
        if (!user) return;

        if (user.role === "instructor")
        {    
                echo.private(`course.created.instructor.${user.id}`)
                .listen('CourseCreated',({course})=>{ 
                    toast.success(`${course.title} has been created!`)
                    emit("course.created", course);        
                })
                .error(error=>{
                    handleSessionTimeOut(error)
                })

                echo.private(`course.edited.instructor.${user.id}`)
                .listen('CourseEdited',({course})=>{ 
                    toast.success(`${course.title} has been updated!`)
                    emit("course.edited", course);        
                })
                .error(error=>{
                    handleSessionTimeOut(error)
                })

                echo.private(`course.locked.instructor.${user.id}`)
                .listen('CourseLocked',({course,message})=>{ 
                    toast.success(`${course.title} ${message}`)
                    emit("course.locked", course);        
                })
                .error(error=>{
                    handleSessionTimeOut(error)
                })

                echo.private(`course-operation-failure.instructor.${user.id}`)
                .listen('CourseOperationFailed',({message})=>{ 
                    toast.error(message)
                    emit("course-operation.failed", message);        
                })
                .error(error=>{
                    handleSessionTimeOut(error)
                })
        }        
        else if(user.role === "student"){

            echo.private(`course.created.student.${user.id}`).listen("CourseCreated", ({course}) => {
                toast.success(`You have been enrolled in ${course.title} Course!`)
                emit("course.created",course);
            });

            echo.private(`course.edited.student.${user.id}`)
                .listen('CourseEdited',({course})=>{ 
                    toast.success(`${course.title} is back and updated! Enjoy!`)
                    emit("course.edited", course);        
                })
                .error(error=>{
                    handleSessionTimeOut(error)
                })

            echo.private(`course.locked.student.${user.id}`)
                .listen('CourseLocked',({course,message})=>{ 
                    toast.success(`${course.title} ${message}`)
                    emit("course.locked", course);        
                })
                .error(error=>{
                    handleSessionTimeOut(error)
                })   
                
             echo.private(`course.removed.student.${user.id}`)
                .listen('RemovedFromCourse',({message})=>{ 
                    toast.success(message)
                    emit("course.removed", course);       // to fix 
                })
                .error(error=>{
                    handleSessionTimeOut(error)
                })    
            
            echo.private(`course.added.student.${user.id}`)
                .listen('AddedToCourse',({course,message})=>{ 
                    toast.success(message)
                    emit("course.added", course);        
                })
                .error(error=>{
                    handleSessionTimeOut(error)
                })   
        }    

          /*   // Listen for updates to enrolled courses
            user.enrolledCourses.forEach((courseId) => {
                echo.private(`course.student.${courseId}`).listen(".course.updated", (data) => {
                    emit("course.updated", data.course);
                });
            }); */
        return () => {
            if(!user) return
            if (user.role === "instructor")
            {
                echo.leaveChannel(`course.created.instructor.${user.id}`);
                echo.leaveChannel(`course.edited.instructor.${user.id}`);
                echo.leaveChannel(`course.locked.instructor.${user.id}`);
                echo.leaveChannel(`course-operation-failure.instructor.${user.id}`);
            }
            else if(user.role === "student")
            {
                echo.leaveChannel(`course.created.student.${user.id}`);
                echo.leaveChannel(`course.edited.student.${user.id}`);
                echo.leaveChannel(`course.locked.student.${user.id}`);
                echo.leaveChannel(`course.removed.student.${user.id}`);
                echo.leaveChannel(`course.added.student.${user.id}`);
            }

        };
    }, [user]);

  return (
    <EventContext.Provider value = {{ on }}>
        {children}
    </EventContext.Provider>
  )
}

export const useEventBus  = () => {
    const context = useContext(EventContext)
        if(!context) throw new Error("useEventBus should only be used inside <EventProvider/>")
        return context  
}
