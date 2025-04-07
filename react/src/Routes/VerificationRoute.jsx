import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthProvider";
import { useEffect } from "react";

export default function VerificationRoute({
    children
}) {
    const navigate = useNavigate();
    const {authenticated,verified,loading} = useAuth()
    useEffect(()=>{
        if(loading) return
        if(!authenticated) navigate('/login',{
            replace:true
        })
        if(authenticated && verified) navigate('/',{
            replace:true
        })    
    },[
        authenticated,verified,loading,navigate
    ])

    if (loading) return null
    return authenticated && !verified ? children : null
}
