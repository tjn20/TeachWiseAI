import { Link, useNavigate } from "react-router-dom"
import {z} from "zod"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import FileUpload from "@/components/app/FileUpload"
import { useEffect, useState } from "react"
import FileItem from "@/components/app/FileItem"
import ToolTippedButton from "@/components/app/ToolTippedButton"
import { Loader, Plus, StepBack, Trash } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import axiosClient from "../axios"
import { useAuth } from "../Context/AuthProvider"
import { toast } from "sonner"
import {  COURSE_MATERIAL_MAX_FILE_SIZE,COURSE_MATERIAL_ALLOWED_FILE_TYPES, courseSchema } from "../utils/CourseSchema"
import { Helmet } from "react-helmet-async"

export default function CreateCourse() {
  const {handleSessionTimeOut} = useAuth()
  const navigate = useNavigate()
  const [courseContentFiles,setCourseContentFiles] = useState([])
  const [isSubmitting,setIsSubmitting] = useState(false)

  const formSchema = courseSchema.extend({
    courseFiles: z.array(
      z.instanceof(File).refine((file) =>file.size <= COURSE_MATERIAL_MAX_FILE_SIZE, `File must be less than ${COURSE_MATERIAL_MAX_FILE_SIZE / (1024 * 1024)}MB`)
      .refine((file) => COURSE_MATERIAL_ALLOWED_FILE_TYPES.includes(file.type), "Only PDF files are allowed.")
    ).min(1, "At least one file is required")
     .max(7, "You can upload up to 7 files"),
    students:courseSchema.shape.students.refine((data) => { 
      return data.file ? true:false || data.studentsId.length > 0;
    }, {
      message: "Either student IDs or a file must be provided.",
    })
  })
  const form = useForm({
    resolver:zodResolver(formSchema),
    defaultValues:{
      title:"", 
      description:"",
      courseFiles:[],
      students: {
        studentsId: [],
        file: null,
      }
    }
  })

  const {fields:studentsIdFields,append:appendStudentId,remove:removeStudentId} = useFieldArray({
    control:form.control,
    name:"students.studentsId"
  })

  const studentsFile = form.getValues('students.file')
  const studentsFileError = form.formState.errors?.students?.file?.message


  const addCourseMaterialFile = (newFiles)=>{
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
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      console.log(key,value)
      appendToFormData(formData, key, value);
    });
    axiosClient.post('/courses/create',formData).then(({data})=>{
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
        <title>Create Course</title>
      </Helmet>
    <div className="flex-1 flex flex-col dark:bg-main">
      <div className="flex items-center gap-1 px-4 py-3 mt-2">
      <ToolTippedButton onClick={()=>navigate(-1,{
        replace:true
      })} type="button" title="Back" size="icon" variant="ghost" >
        <StepBack />
      </ToolTippedButton> 
      <h1 className="text-2xl font-bold dark:text-white">New Course</h1>
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
     {courseContentFiles.length <= 7 && <div className="animate-in fade-in-0 duration-500 slide-in-from-top-4">
      
          <FormItem>
            <FormLabel className="pl-3">Upload Material</FormLabel>
            <FormControl>
              <FileUpload addFile={addCourseMaterialFile} />
            </FormControl>
            <FormDescription className="flex justify-center">
            This section contains the materials from which the AI will learn and generate responses. Provide PDFs and PowerPoint files to ensure accurate and relevant AI outputs. Up to 7 files is allowed.              </FormDescription>
          </FormItem>
        
        </div>}
      {courseContentFiles.length > 0 && <div className="flex flex-col gap-3 animate-in fade-in-0 duration-500">
        <Separator className="my-7 w-[90%] mx-auto flex"/>
        <h1 className="text-md font-bold px-1 mt-2 dark:text-gray-100">Uploaded Material</h1>
      {courseContentFiles.map((file,index)=>{
        const fileError = form.formState.errors?.courseFiles?.[index]?.message;
        return <FileItem key={index} file={file} error={fileError} onRemoveClick={()=>removeCourseFile(index)} />
      
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
          <FileItem file={studentsFile} error={studentsFileError} onRemoveClick={()=>removeStudentsFile()} />
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
  <span className="text-error font-semibold text-sm flex justify-center">{(!studentsFile && studentsIdFields.length === 0 ) && form.formState.errors?.students?.message || form.formState.errors?.students?.root?.message }</span>
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
</div>
    </>

  )
}
