import { useEffect } from "react"
import { useAuth } from "../../Context/AuthProvider"
import { useLocation, useParams } from "react-router-dom"
import { Loader } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function VerificationProcessing() {
    const {verifyEmail}  = useAuth()
    const location = useLocation();
    const {id,hash} = useParams()
    const queryParams = new URLSearchParams(location.search);
    const expires = queryParams.get('expires')
    const signature = queryParams.get('signature')

    useEffect(()=>{
       if(!id || !hash || !expires || !signature) return
       verifyEmail(id,hash,expires,signature).then(()=>{
       }).catch(()=>{
        window.close()
       })
    },[])
  return (
    <>
    <Helmet>
      <title>Verifying Account...</title>
    </Helmet>
    <div className="w-full sm:max-w-lg mt-6 px-6 py-4 bg-white overflow-hidden animate-in duration-400 fade-in-20 slide-in-from-top-5">
          <div className="w-full sm:max-w-md px-6 py-4 overflow-hidden min-w-full flex flex-col items-center"> 
          <div className="mb-4 text-md text-gray-700 font-bold">
          Please wait while we verify your account.
        </div>
            <Loader size={12} className="animate-spin" />
          </div>
    </div>
    </>
  )  
}
