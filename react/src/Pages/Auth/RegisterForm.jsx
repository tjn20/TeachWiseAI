import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../Context/AuthProvider.jsx"
import {z} from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
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
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { toast } from 'sonner'
import { UNIVERSITY_DOMAINS } from "../../utils/universities.js"
import {Loader} from "lucide-react"
import { Helmet } from "react-helmet-async"
export default function RegisterForm() {
  const {signUp,abortConnection} = useAuth()
  const navigate = useNavigate()
  const [isSubmitting,setIsSubmitting] = useState(false)

    const formSchema = z.object({
      first_name:z.string()
      .min(2,"First Name must contain at least 2 character(s)")
      .max(30,"First Name must be under 30 characters")
      .regex(/^[A-Za-z]+$/, "First name can only contain letters"),
      last_name:z.string()
      .min(2,"Last Name must contain at least 2 character(s)")
      .max(30,"Last Name must be under 30 characters")
      .regex(/^[A-Za-z]+$/, "Last name can only contain letters"),
      role:z.enum(["student","instructor"],{
        required_error:"Please select a role."
      }),
      password:z.string()
      .min(8,"Password must contain at least 8 character(s)")
      .max(30,"Password must be under 30 characters")
      .regex(/[a-z]/,"Password must contain at least one lowercase letter")
      .regex(/[A-Z]/,"Password must contain at least one uppercase letter")
      .regex(/\d/,"Password must contain at least one digit")
      .regex(/[\W_]/,"Password must contain at least one special character"),
      email:z.string().email("Invalid email format")
      .refine(value=>{
        const domain = value.split('@')[1]
        return UNIVERSITY_DOMAINS.includes(domain)
      },{
        message:"Email must be from an approved university in the UAE"
      })
    }).refine(fields=>{
      if(fields.role === 'student')
      {
        const emailUsername = fields.email.split('@')[0]
        return /^\d{7,12}$/.test(emailUsername)
      }  
      return true
    },{
      message:"The username must be a numeric value between 7 and 12 digits long.",
      path:["email"]
    })
    .refine(fields=>{
      if(fields.role === "instructor")
      {
        const emailUsername = fields.email.split('@')[0]
        return /^[A-Za-z.]+$/.test(emailUsername)
      }
    },{
      message:"The username may only contain letters and periods.",
      path:["email"]
    })
   
    const form = useForm({
      resolver:zodResolver(formSchema),
      defaultValues:{
        first_name:"",
        last_name:"",
        email:"",
        password:"",
      }
    })
    const onSubmit = (data)=>{
      setIsSubmitting(true)
      signUp(data).then(({emailVerification})=>{
        if(emailVerification)
        {
          navigate('/email/verification-notification')
        }  
      }).catch(error=>{
        if(error.response?.status === 422)
          toast.error(error.response?.data.message)
        else
          toast.error("Something Went Wrong!")
      }).finally(()=>{
        setIsSubmitting(false)
      })
    }
   
  return (
    <>
    <Helmet>
      <title>Register</title>
    </Helmet>
    <div className="animate-in duration-400 fade-in-20 slide-in-from-top-5">
    <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
    <div className="flex flex-col items-center gap-2 text-center mb-2">
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-balance text-sm text-muted-foreground">
        Enter your details below to create an account
        </p>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-5 gap-y-6 sm:gap-y-0">
      <div className="flex-1">
      <FormField
        control={form.control}
        name="first_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>First Name</FormLabel>
            <FormControl>
              <Input placeholder="First Name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      </div>
      <div className="flex-1">
      <FormField
        control={form.control}
        name="last_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Last Name</FormLabel>
            <FormControl>
              <Input placeholder="Last Name" {...field} />
            </FormControl>
            <FormMessage/>
          </FormItem>
        )}
      />
      </div>
      </div>
      <FormField 
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem className="form-items space-y-1">
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input placeholder="Email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
       <FormField
        control={form.control}
        name="role"
        render={({ field }) => (
          <FormItem className="form-items space-y-1">
            <FormLabel>Role</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="instructor">Instructor</SelectItem>
                <SelectItem value="student">Student</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem className="form-items space-y-1">
            <FormLabel>Password</FormLabel>
            <FormControl >
              <Input placeholder="Password" type="password" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
     
      <Button type="submit" className="w-full mt-2"  size="sm" disabled={isSubmitting}>
      {isSubmitting ? (
      <>
        <Loader className="animate-spin" /> Submitting
      </>
    ) : (
      "Submit"
    )}
      </Button>
    </form>
    <div className="text-center text-sm mt-2">
        Already have an account?{" "}
        <Link to="/login" className="underline underline-offset-4">
          Login
        </Link>
      </div>
    </Form>
    </div>
    </>
  )
}

