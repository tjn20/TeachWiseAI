import { useEffect } from "react"
import { useAuth } from "../Context/AuthProvider"
import { useNavigate } from "react-router-dom"
import { hasPermission } from "../auth";
export default function ProtectedRoute({
    children,
    permission
}) {
    const navigate = useNavigate();
    let {verified,loading,user} = useAuth()
    useEffect(()=>{
    if(!loading && !verified) navigate('/login')
    if(user && permission && !hasPermission(user,permission)) navigate('/')
    },[
        verified,loading,navigate
    ])

    if (loading) return null
    return verified ? children : null
}
