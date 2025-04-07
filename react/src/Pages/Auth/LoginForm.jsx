import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../Context/AuthProvider"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { Helmet } from "react-helmet-async";
export default function LoginForm() {
  const {signIn} = useAuth()
  const navigate = useNavigate()
  const [isSubmitting,setIsSubmitting] = useState(false)

  const formSchema = z.object({
      password: z.string().min(1, { message: "Password is required" }),
      email:z.string().email("Email is Required")
      })

  const form = useForm({
        resolver:zodResolver(formSchema),
        defaultValues:{
          email:"",
          password:"",
        }
      })
  const onSubmit = (data)=>{
    setIsSubmitting(true)
    signIn(data).then(({emailVerification})=>{
      if(emailVerification)
      {
        navigate('/email/verification-notification')
      }  
      else 
        navigate('/')
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
      <title>Login</title>
    </Helmet>
    <div className="animate-in duration-4400 fade-in-20 slide-in-from-top-5">
    <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-1">
    <div className="flex flex-col items-center gap-2 text-center mb-2">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
        Enter your email below to login to your account
        </p>
      </div>
      <FormField 
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem className="form-items">
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
        name="password"
        render={({ field }) => (
          <FormItem className="form-items">
            <FormLabel>Password</FormLabel>
            <FormControl >
              <Input placeholder="Password" type="password" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
     
      <Button type="submit" className="w-full mt-3"  size="sm" disabled={isSubmitting}>
      {isSubmitting ? (
      <>
        <Loader className="animate-spin" /> Submitting
      </>
    ) : (
      "Submit"
    )}
      </Button>
    </form>
    <div className="text-center text-sm mt-3">
        Don't have an account?{" "}
        <Link to="/register" className="underline underline-offset-4">
          Register
        </Link>
      </div>
    </Form>
    </div>
    </>
 )
}
