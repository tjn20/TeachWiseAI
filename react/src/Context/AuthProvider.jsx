import { createContext, useContext, useEffect, useState } from "react";
import axiosClient from "../axios";

/*
    user : null | user object,
    authenticated : null | Boolean,
    signIn = (
    emai:string,
    password,
    ),
    Regiseter = ()? => Promise({emailVerification:boolean,signedIn:boolean}) ,
    signOut : void,
    emailVerification : (code,...) => promise(),
    setUser(user,authenticated),
    checkAuthentication = ()=> 

*/

const AuthContext = createContext(undefined);

export default function AuthProvider({children,emailVerification=false})
{
    const [authenticationState,setAuthenticationState] = useState({
        user:null,
        authenticated:null,
        verified:null
    })
    const [loading,setLoading] = useState(true)
    const user = authenticationState.user;
    const authenticated = authenticationState.authenticated;
    const verified = authenticationState.verified;

    useEffect(()=>{
        checkAuthentication()
    },[])

    const signIn = (credentials)=>{
        return new Promise(async (resolve,reject)=>{
            try
            {
                await axiosClient.post('/login',credentials)
                const user = await revalidate()

                return resolve({emailVerification:false,signedIn:true,user})
                
            }
            catch(error)
            {
                if(error.response?.status === 409 && emailVerification) // added email verification
                {
                    setAuthenticationState({user:null,authenticated:true,verified:false})
                    return resolve({emailVerification:true,signedIn:false})
                }
                return reject(error)
            }
            
        })

    }

    const signUp = (credentials)=>{
        return new Promise(async (resolve,reject)=>{
            try
            {
                await axiosClient.post('/register',credentials)

                if(emailVerification)
                {
                    setAuthenticationState({user:null,authenticated:true,verified:false})
                    return resolve({emailVerification:true,signedIn:false})
                }
                
                const user = await revalidate()
                return resolve({emailVerification:false,signedIn:true,user})
            }
            catch(error)
            {
                return reject(error)
            }
           
            
        })
    }

    const revalidate = ()=>{
        return new Promise(async (resolve,reject)=>{
            try
            {
                const {data:user} = await axiosClient.get('/auth-check')
                setAuthenticationState({user,authenticated:true,verified:true})
                return resolve(user)
            }
            catch(error)
            {
                if(error.response?.status === 401)
                {
                    setAuthenticationState({user:null,authenticated:false,verified:null})
                    return resolve(false)
                    
                }
                else if(error.response?.status === 409)
                {
                    setAuthenticationState({user:null,authenticated:true,verified:false})
                    return resolve(false)
                }    

                else 
                    return reject(error)   
            }
        })
    }

    const handleSessionTimeOut = (error) =>{
        if(error?.response?.status === 401 || error?.response?.status === 409) // unauthenticated or unverified
        {
            setAuthenticationState({user:null,authenticated:false,verified:false})
        }
    }

    const verifyEmail = (id,hash,expires,signature) => {
        return new Promise(async(resolve,reject)=>{
            try
            {
                await axiosClient.get(`/verify-email/${id}/${hash}?expires=${expires}&signature=${signature}`)
                
                const user = await revalidate()

                return resolve(user)
            }

            catch(error)
            {
                return reject(error)
            }
        })
    }

    const sendEmailVerificationNotification = ()=> {
        return new Promise(async (resolve,reject)=>{
            try
            {
                await axiosClient.post('/email/verification-notification')
                return resolve()
            }
            catch(error)
            {
                return reject(error)
            }
        })
    }

    const logout = ()=>{
        return new Promise(async (resolve,reject)=>{
            try
            {
                await axiosClient.post('/logout')
                setAuthenticationState({user:null,authenticated:false,verified:false})
                resolve()
            }
            catch (error)
            {
                return reject(error)
            }
        })
    }

    const checkAuthentication = ()=>{
        return new Promise(async (resolve,reject)=>{
            setLoading(true)
            if(authenticated === null || verified === null) 
            {
                try
                {
                    await revalidate()
                    return resolve(true)
                }
                catch(error)
                {
                    if(error.response?.status === 401)
                        {
                            setAuthenticationState({user:null,authenticated:false,verified:null})
                            return resolve(false)
                            
                        }
                        else if(error.response?.status === 409)
                        {
                            setAuthenticationState({user:null,authenticated:true,verified:false})
                            return resolve(false)
                        }    
        
                        else 
                            return reject(error)    
                }
                finally
            {
                setLoading(false)
            }
            }
            else 
            return resolve(authenticated)    
        })
    }

    const setUser = (user,authenticated,verified)=>{
        setAuthenticationState({user,authenticated,verified})
    }

    const abortConnection = () =>{
        controller.abort()
    }

   

    return <AuthContext.Provider
            children={children}
            value={{
                authenticated,
                user,
                verified,
                setUser,
                signIn,
                signUp,
                verifyEmail,
                sendEmailVerificationNotification,
                loading,
                logout,
                abortConnection,
                handleSessionTimeOut
             }}
            />
}



export const useAuth=()=>{
    const context = useContext(AuthContext)
    if(!context) throw new Error("UseAuth should only be used inside <AuthProvider/>")
    return context  
}
