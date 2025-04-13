import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod"
import {  COURSE_MATERIAL_MAX_FILE_SIZE,COURSE_MATERIAL_ALLOWED_FILE_TYPES, courseSchema } from "../utils/CourseSchema"
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../axios";
import { useAuth } from "../Context/AuthProvider";
import { toast } from "sonner";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
  } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import FileUpload from "@/components/app/FileUpload"
import FileItem from "@/components/app/FileItem"
import { Info, Loader, Plus, RotateCcw, StepBack, Trash } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Button } from "../../components/ui/button";
import { HashLoader } from "react-spinners";
import ToolTippedButton from "../../components/app/ToolTippedButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faSquareCheck, faTrash, faUsers, faX } from "@fortawesome/free-solid-svg-icons";
import EnrolledStudentFormItem from "../../components/app/EnrolledStudentFormItem";
import WaitlistedStudentFormItem from "../../components/app/WaitlistedStudentFormItem";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { Helmet } from "react-helmet-async";
import { useTheme } from "../Context/theme-provider";
export default function EditCourse() {
    const {theme} = useTheme()
    const [course,setCourse] = useState(null)
    const [isCourseLoading,setIsCourseLoading] = useState(true)
    const [courseContentFiles,setCourseContentFiles] = useState([])
    const [isSubmitting,setIsSubmitting] = useState(false)
    const [selectedEnrolledStudents,setSelectedEnrolledStudents] = useState(new Set())
    const [selectedWaitlistedStudents,setSelectedWaitlistedStudents] = useState(new Set())
    const {slug} = useParams()
    const navigate = useNavigate();
    const {handleSessionTimeOut} = useAuth()
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

    const formSchema = courseSchema.extend({
        courseFiles : z.array(
              z.instanceof(File).refine((file) =>file.size <= COURSE_MATERIAL_MAX_FILE_SIZE, `File must be less than ${COURSE_MATERIAL_MAX_FILE_SIZE / (1024 * 1024)}MB`)
              .refine((file) => COURSE_MATERIAL_ALLOWED_FILE_TYPES.includes(file.type), "Only PDF files are allowed.")
            ).optional(),
        students:courseSchema.shape.students.extend({
            removedEnrolledStudentIds: z.array(
                z.number()
            ).optional(),
            removedWaitlistedStudentIds: z.array(
                z.number()
            ).optional(),
        }),
        removedFileIds : z.array(
            z.number()
        ).optional()
    }).refine((data)=>{
        const existingFilesCount = course?.files?.length ?? 0
        const removedFilesCount = data.removedFileIds?.length ?? 0
        const addedFilesCount = data.courseFiles?.length ?? 0

        const totalFiles = existingFilesCount + addedFilesCount - removedFilesCount

        if(totalFiles < 1 || totalFiles > 7) return false
        return true
    },{
        message: "You can upload between 1 and 7 files",
        path:['courseFiles']
    })
    .refine((data)=>{
        const existingStudentsCount = course?.enrolled_students_count ?? 0 + course.waitlisted_students_count ?? 0
        const removedStudents = data.removedEnrolledStudentIds?.length ?? 0 + data.removedWaitlistedStudentIds?.length ?? 0
        const areThereAddedStudents = data.students?.file ? true : false || data.students?.studentsId.length > 0

        if(!areThereAddedStudents) 
        {
            return !(removedStudents >= existingStudentsCount)
        }   
        
        return true
    },{
        message: "Either student IDs or a file must be provided.",
        path:['students']
    })

    const form = useForm({
        resolver:zodResolver(formSchema),
        values:{
            title:course?.title || "",
            description:course?.description ?? "",
            courseFiles:[],
            students: {
                studentsId: [],
                file: null,
                removedEnrolledStudentIds: [],
                removedWaitlistedStudentIds: [],
            },
            removedFileIds : []
        }
    })
    const removedFileIdsArray = form.getValues("removedFileIds")
    const removedEnrolledStudentIds = form.getValues("students.removedEnrolledStudentIds")
    const removedWaitlistedStudentIds = form.getValues("students.removedWaitlistedStudentIds")
    const {fields:studentsIdFields,append:appendStudentId,remove:removeStudentId} = useFieldArray({
        control:form.control,
        name:"students.studentsId"
      })
    
    const studentsFile = form.getValues('students.file')
    const studentsFileError = form.formState.errors?.students?.file?.message
    const isThereStudentsError = course ? !studentsFile && studentsIdFields.length === 0 && removedEnrolledStudentIds.length === course.enrolled_students.length && removedWaitlistedStudentIds.length === course.waitlisted_students.length : false
    const addCourseFile = (newFiles)=>{
        setCourseContentFiles(prev=>{
          const updatedFiles = [...prev,...newFiles]
          form.setValue(
            "courseFiles",
            updatedFiles,
            {
              shouldValidate: true,
            }
          );
          return updatedFiles
        })
      }
    
      // This removes a course File that is currently uploaded
      const removeCourseFile = (index) => {
        setCourseContentFiles(prev=>{
          const updatedFiles = prev.filter((_,i)=>i!==index)
          form.setValue(
            "courseFiles",
            updatedFiles,
            {
              shouldValidate: true,
            }
          );
          return updatedFiles
        })
      };

      // This removes a course File that was prevously uploaded
      const removeUploadedCourseFile = (id) => {
        form.setValue(
            "removedFileIds",
            [...removedFileIdsArray,id],
            {
              shouldValidate: true,
            }
          );
      }

      const restoreRemovedCourseFile = () => {
        form.setValue(
          "removedFileIds",
          [],
          {
            shouldValidate:true
          })
      }


      const toggleEnrolledStudentsSelect = (id) => {
        setSelectedEnrolledStudents((prev)=>{
            const newSet = new Set(prev); 
            if (newSet.has(id)) {
                newSet.delete(id); 
            } else {
                newSet.add(id); 
            }
            return newSet; 
            })
      }

      const selectAllEnrolledStudents = () => {
        setSelectedEnrolledStudents(new Set(course.enrolled_students.map(student=>student.id)))
      }

      const deselectAllEnrolledStudents = () => {
        setSelectedEnrolledStudents(new Set())
      }

      const removeEnrolledStudents = () => {
        form.setValue('students.removedEnrolledStudentIds',[...selectedEnrolledStudents],{
            shouldValidate:true
        })
        setSelectedEnrolledStudents(new Set())
      }

      const restoreEnrolledStudents = () => {
        form.setValue('students.removedEnrolledStudentIds',[],{
            shouldValidate:true
        })
      }

      const toggleWaitlistedStudentsSelect = (id) => {
        setSelectedWaitlistedStudents((prev)=>{
            const newSet = new Set(prev); 
            if (newSet.has(id)) {
                newSet.delete(id); 
            } else {
                newSet.add(id); 
            }
            return newSet; 
            })
      }

      const selectAllWaitlistedStudents = () => {
        setSelectedWaitlistedStudents(new Set(course.waitlisted_students.map(student=>student.id)))
      }

      const deselectAllWaitlistedStudents = () => {
        setSelectedWaitlistedStudents(new Set())
      }

      const removeWaitlistedStudents = () => {
        form.setValue('students.removedWaitlistedStudentIds',[...selectedWaitlistedStudents],{
            shouldValidate:true
        })
        setSelectedWaitlistedStudents(new Set())
      }

      const restoreWaitlistedStudents = () => {
        form.setValue('students.removedWaitlistedStudentIds',[],{
            shouldValidate:true
        })
      }
      
      const addStudentsFile = (newFile) => {
        form.setValue('students.file',newFile[0],{
          shouldValidate:true,
        })
      }
      
      const removeStudentsFile = () => {
        form.setValue('students.file',null,{
          shouldValidate:true,
        })
      }

    function appendToFormData(formData, key, value) {
      if (Array.isArray(value)) {
          value.forEach((item, index) => {
              formData.append(`${key}[${index}]`, item);
          });
      } else if (value instanceof File) {
          formData.append(key, value);
      } else if (typeof value === "object" && value !== null) {
          Object.entries(value).forEach(([subKey, subValue]) => {
              appendToFormData(formData, `${key}[${subKey}]`, subValue);
          });
      } else if(value !== null){
          formData.append(key, value);
      }
  }
  
    
      const onSubmit = (data) => {
        setIsSubmitting(true)
        if (data.students.studentsId) {
          data.students.studentsId = data.students.studentsId.map(student => student.studentID);
        }
        const {removedFileIds,courseFiles,...otherProps} = data;
        data = {
            courseFiles : {
                removedFileIds : removedFileIds,
                files : courseFiles
            },
            ...otherProps
        }
        console.log('sub',data)
        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => {
          appendToFormData(formData, key, value);
        });

        formData.append('_method','PUT')
        axiosClient.post(`/course/${course.id}`,formData).then(({data})=>{
         toast.success(`${data.course_title} ${data.message}`)
          setTimeout(()=>{
            navigate('/')
          },1500)
          setIsSubmitting(false)
        }).catch(error=>{
          if(!error) return
          handleSessionTimeOut(error)
          if(error.response?.status === 422)
          {
            if(error.response?.data.errors)
              toast.error(Object.values(error.response?.data.errors)[0][0])
            else
              toast.error(error.response?.data.message)
          }
          else
            toast.error("Something Went Wrong!")
          setIsSubmitting(false)
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
                <HashLoader size={30} className="items-center justify-center " color={theme === "light" ? "black" : "white"}  />
            </span>
        )}
        {!isCourseLoading && (<>
    <div className="flex items-center gap-1 px-4 py-3 mt-2">
      <ToolTippedButton onClick={()=>navigate(-1,{
        replace:true
      })} type="button" title="Back" size="icon" variant="ghost" >
        <StepBack />
      </ToolTippedButton> 
      <h1 className="text-2xl font-bold dark:text-white">Edit Course</h1>
    </div>
   <Form {...form}>
   <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 flex flex-col gap-7">
      <fieldset className="border border-gray-300 rounded-lg p-4">
        <legend className="text-md font-semibold px-2">Details</legend>
        <div className="flex flex-col gap-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Title"  {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
              <Textarea placeholder="Description" className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        </div>
      </fieldset>
      <fieldset className="border border-gray-300 rounded-lg p-4">
      <legend className="text-md font-semibold px-2">Course Material</legend>
       {(courseContentFiles.length + course.files?.length - removedFileIdsArray.length <7) && <div className="animate-in fade-in-0 duration-500 slide-in-from-top-4">
        
            <FormItem>
              <FormLabel className="pl-3">Upload Material</FormLabel>
              <FormControl>
                <FileUpload addFile={addCourseFile} />
              </FormControl>
              <FormDescription className="flex justify-center">
              This section contains the materials from which the AI will learn and generate responses. Provide PDFs and PowerPoint files to ensure accurate and relevant AI outputs. Up to 7 files is allowed.              </FormDescription>
            </FormItem>
          
          </div>}
        {((courseContentFiles.length + course.files.length > removedFileIdsArray.length || removedFileIdsArray.length > 0 )) && <div className="flex flex-col gap-3 animate-in fade-in-0 duration-500">
          <Separator className="my-7 w-[90%] mx-auto flex"/>
          <div className="flex items-center justify-between">
          <h1 className="text-md font-bold px-1 mt-2 dark:text-white">Uploaded Material</h1>
          { 
            removedFileIdsArray.length > 0  && 
            <Button
            className="animate-in fade-in-0 duration-700 slide-in-from-top-1"
            size="sm"
            variant="outline"
            type="button"
            onClick={()=>restoreRemovedCourseFile()}
            >
              <RotateCcw />
          </Button>
         }
          </div>
        {courseContentFiles.map((file,index)=>{
          const fileError = form.formState.errors?.courseFiles?.[index]?.message;
          return <FileItem key={index} file={file} error={fileError} newlyUploaded onRemoveClick={()=>removeCourseFile(index)} />
        
        })}
        {course.files.map((file,index)=>{
            return !removedFileIdsArray.includes(file.id) ? <FileItem key={index} file={file} onRemoveClick={()=>removeUploadedCourseFile(file.id)} /> : null    
        })}
        </div>}
        {form.formState.errors?.courseFiles?.message && <div className={`text-error text-sm flex justify-center ${courseContentFiles.length > 0 ? "pt-8" : 'pl-3 pt-5'} font-medium`}>{form.formState.errors?.courseFiles?.message}</div>}
      </fieldset>
      <fieldset className="border border-gray-300 rounded-lg p-4">
      <legend className="text-md font-semibold px-2">Course Students</legend>
      {!studentsFile ? <div className="animate-in fade-in-0 duration-700 slide-in-from-top-4">
            <FormItem>
              <FormLabel className="pl-3">Upload Students</FormLabel>
              <FormControl>
                <FileUpload addFile={addStudentsFile} maxFiles={1} multiple={false} />
              </FormControl>
              <FormDescription className="flex justify-center">
              This section contains student IDs that will be enrolled in the course. Please upload a CSV file with the required student information.
                </FormDescription>
            </FormItem>
       </div> : <div>
            <FileItem file={studentsFile} type="csv" error={studentsFileError} onRemoveClick={()=>removeStudentsFile()} />
            </div>
  }
    <Separator className="my-7 w-[90%] mx-auto flex"/>
    <div className="flex items-center justify-between">
    <FormLabel className="pl-3 text-md">Add Students</FormLabel>
    <ToolTippedButton onClick={()=>appendStudentId({studentID:""})} type="button" title="Add" size="circle" variant="ghost">
    <Plus className="dark:text-white"/>
    </ToolTippedButton>
    </div>
    <FormDescription className="flex justify-center">
    You can manually add student IDs by clicking the plus sign (+).
    </FormDescription>
    <div className="flex flex-col gap-3 px-3 pt-4">
      {
        studentsIdFields.map((field,index)=>(
          <FormField
          key={field.id}
          control={form.control}
          name={`students.studentsId.${index}.studentID`}
          render={({ field }) => (
            <FormItem className="animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
              <FormLabel>{index + 1}. Student ID</FormLabel>
              <div className="flex items-center justify-between gap-1">
              <FormControl>
                <Input placeholder="Student ID" {...field} />
              </FormControl>
              <ToolTippedButton onClick={()=>removeStudentId(index)} type="button" title="Remove" size="sm" variant="ghost">
                <Trash color="red"/>
              </ToolTippedButton>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        ))
      }
    </div>
    <Separator className="my-7 w-[90%] mx-auto flex"/>
    <div>
                        <div className="flex items-center justify-between  mb-4">
                        <div className="flex items-baseline gap-3 dark:text-white">
                            <FontAwesomeIcon icon={faUsers} />    
                            <div className="flex flex-col">
                            <h3 className="text-lg font-bold">Enrolled Students</h3>
                            <span className="text-sm font-semibold">{course.enrolled_students_count - removedEnrolledStudentIds.length} Student(s)</span>  
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                        {removedEnrolledStudentIds.length !== course.enrolled_students.length && (
                            <>
                            {selectedEnrolledStudents.size !== course.enrolled_students.length && (
                                <Button
                                className="animate-in fade-in-0 duration-700 slide-in-from-top-1"
                                size="sm"
                                variant="outline"
                                type="button"
                                onClick={()=>selectAllEnrolledStudents()}
                                >
                                <FontAwesomeIcon icon={faCheck} />
                                Select All
                                </Button>
                            )}

                            {selectedEnrolledStudents.size === course.enrolled_students.length && (
                                <Button
                                className="animate-in fade-in-0 duration-700 slide-in-from-top-1"
                                size="sm"
                                variant="outline"
                                type="button"
                                onClick={()=>deselectAllEnrolledStudents()}
                                >
                                <FontAwesomeIcon icon={faX} />
                                Deselect All
                                </Button>
                            )}

                            {selectedEnrolledStudents.size > 0 && (
                                <Button
                                className="animate-in fade-in-0 duration-700 slide-in-from-top-1"
                                size="sm"
                                variant="outline"
                                type="button"
                                onClick={()=>removeEnrolledStudents()}
                                >
                                <FontAwesomeIcon icon={faTrash} color="red" />
                                </Button>
                            )}
                            </>
                        )}
                        {
                            (course.enrolled_students_count > 0 && removedEnrolledStudentIds.length > 0 ) && (
                                <Button
                                className="animate-in fade-in-0 duration-700 slide-in-from-top-1"
                                size="sm"
                                variant="outline"
                                type="button"
                                onClick={()=>restoreEnrolledStudents()}
                                >
                                <RotateCcw />
                                </Button>
                            )
                        }
                        </div>

                        </div>
                        <div className="flex flex-col gap-3">
                            {course.enrolled_students.map((student,index)=>{
                                return !removedEnrolledStudentIds.includes(student.id) && <div className="flex items-center gap-2">
                                    <EnrolledStudentFormItem key={index} student={student} onSelect={toggleEnrolledStudentsSelect} isSelected={selectedEnrolledStudents.has(student.id)} />
                                </div>    
                        })}
                        </div>
                        {removedEnrolledStudentIds.length !== course.enrolled_students.length && <FormDescription className="flex justify-center mt-4 animate-in fade-in-5 slide-in-from-bottom-2 duration-200">
                             Select the students you want to unenroll from this course.
                        </FormDescription>}
                    </div>
                    <Separator className="my-7 w-[90%] mx-auto flex"/>
                    <div>
                        <div className="flex items-center justify-between mb-4">
                        <div className="flex items-baseline gap-3 dark:text-white">
                        <FontAwesomeIcon icon={faUsers} />    
                        <div className="flex flex-col ">
                        <div className="flex items-center">
                        <h3 className="text-lg font-bold">Waitlisted Students</h3>
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
                        <span className="text-sm font-semibold -translate-y-[6px]">{course.waitlisted_students_count - removedWaitlistedStudentIds.length} Student(s)</span>  
                        </div>
                        </div>
                        <div className="flex items-center gap-1">
                        {removedWaitlistedStudentIds.length !== course.waitlisted_students.length && (
                            <>
                            {selectedWaitlistedStudents.size !== course.waitlisted_students.length && (
                                <Button
                                className="animate-in fade-in-0 duration-700 slide-in-from-top-1"
                                size="sm"
                                variant="outline"
                                type="button"
                                onClick={()=>selectAllWaitlistedStudents()}
                                >
                                <FontAwesomeIcon icon={faCheck} />
                                Select All
                                </Button>
                            )}

                            {selectedWaitlistedStudents.size === course.waitlisted_students.length && (
                                <Button
                                className="animate-in fade-in-0 duration-700 slide-in-from-top-1"
                                size="sm"
                                variant="outline"
                                type="button"
                                onClick={()=>deselectAllWaitlistedStudents()}
                                >
                                <FontAwesomeIcon icon={faX} />
                                Deselect All
                                </Button>
                            )}

                            {selectedWaitlistedStudents.size > 0 && (
                                <Button
                                className="animate-in fade-in-0 duration-700 slide-in-from-top-1"
                                size="sm"
                                variant="outline"
                                type="button"
                                onClick={()=>removeWaitlistedStudents()}
                                >
                                <FontAwesomeIcon icon={faTrash} color="red" />
                                </Button>
                            )}
                            </>
                        )}
                        {
                            (course.waitlisted_students_count > 0 && removedWaitlistedStudentIds.length > 0) && (
                                <Button
                                className="animate-in fade-in-0 duration-700 slide-in-from-top-1"
                                size="sm"
                                variant="outline"
                                type="button"
                                onClick={()=>restoreWaitlistedStudents()}
                                >
                                <RotateCcw />
                                </Button>
                            )
                        }
                        </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            {course.waitlisted_students.map((student,index)=>{
                                return !removedWaitlistedStudentIds.includes(student.id) && <WaitlistedStudentFormItem key={index} student={student} onSelect={toggleWaitlistedStudentsSelect} isSelected={selectedWaitlistedStudents.has(student.id)} />
                            })}
                        </div>
                        {removedWaitlistedStudentIds.length !== course.waitlisted_students.length && <FormDescription className="flex justify-center mt-4 animate-in fade-in-5 slide-in-from-bottom-2 duration-200">
                             Select the students you want to unenroll from this course.
                        </FormDescription>}
                    </div>            
        { isThereStudentsError && 
            <span className="text-error font-semibold text-sm flex justify-center animate-in fade-in-5 slide-in-from-bottom-2 duration-400">{form.formState.errors?.students?.message || form.formState.errors?.students?.root?.message }</span>
        }
      </fieldset>
      <div className="ms-auto flex items-center gap-2">
        <Button type="submit" size="sm" disabled={isSubmitting}>
      {isSubmitting ? (
        <>
          <Loader className="animate-spin" /> Please Wait
        </>
      ) : (
        "Submit"
      )}
    </Button>    
      </div>
    </form>
   </Form>
   </>)}
  </div>
    </>
  
  )
}
