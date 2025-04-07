import { useAuth } from "../../Context/AuthProvider"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { Helmet } from "react-helmet-async"
import { toast } from "sonner"

export default function VerifyEmail() {
    const [isProcessing,setIsProcessing] = useState(false)
    const {VerifyEmail,sendEmailVerificationNotification,logout} = useAuth()
    const onResendClick = ()=>{
        setIsProcessing(true)
        toast.promise(sendEmailVerificationNotification, {
            loading: 'Resending Verification Link',
            success: () => {
              return `A new verification link has been sent`;
            },
            error: "Something Went Wrong!",
            finally:()=>{
                setIsProcessing(false)
            }
          });

          
    }

    useEffect(()=>{
        return ()=>toast.dismiss()
    },[])

    const onLogoutClick = () =>{
        logout()
    } 
return (
    <>
    <Helmet>
      <title>Email Verification</title>
    </Helmet>
    <div className="w-full sm:max-w-lg mt-6 px-6 py-4 bg-white shadow-lg overflow-hidden sm:rounded-lg border animate-in duration-400 fade-in-20 slide-in-from-top-5">
        <div className="w-full sm:max-w-md px-6 py-4 overflow-hidden min-w-full">
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Thanks for signing up! Before getting started, could you verify your email address by clicking on the
            link we just emailed to you? If you didn't receive the email, we will gladly send you another.
        </div>
            <div className="mt-4 flex items-center justify-between">
                <Button size="sm" disabled={isProcessing} onClick={onResendClick}>Resend Verification Email</Button>

                <Button variant="link" onClick={onLogoutClick} className="underline"
                >
                    Log Out
                </Button>
            </div>
        </div>
    </div>
    </>

)
}
