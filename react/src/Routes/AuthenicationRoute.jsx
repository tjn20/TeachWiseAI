import { replace, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthProvider";
import { useEffect } from "react";

export default function AuthenicationRoute({
    children
}) {
  const navigate = useNavigate();
  const {authenticated,verified,loading} = useAuth()
  useEffect(()=>{
    if(loading) return
    if(verified) navigate('/',{
      replace:true
    })
    if(authenticated && !verified) navigate('/email/verification-notification')

  },[
    loading,navigate
  ])

   if (loading) return null
    return !verified ? children : null
}
