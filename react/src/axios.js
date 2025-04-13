import axios from  'axios'
import Cookies from 'js-cookie'

const axiosClient = axios.create({
    baseURL:`${import.meta.env.VITE_API_BASE_URL}/api`,
    withCredentials:true,
    withXSRFToken:true
})

axiosClient.interceptors.request.use(config=>{
    if((config.method == 'post' || config.method == 'put' || 
        config.method == 'delete') && !Cookies.get('XSRF-TOKEN'))
        return setCSRFToken().then(response=>config)

        return config
})

axiosClient.interceptors.response.use(response=>response,(error)=>{
    if (!error.response) return Promise.reject(error);
    const {status}  = error.response
    if(status === 404 || status === 403)
    {
        window.location.href = "/"
        return error;
    }
    return Promise.reject(error)
})

const setCSRFToken = ()=> {
    return axiosClient.get('/sanctum/csrf-cookie')
}



export default axiosClient