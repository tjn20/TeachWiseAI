import { Outlet } from "react-router-dom";
import { GalleryVerticalEnd } from "lucide-react";
import student from "@/src/assets/student.jpg"
import { useEffect } from "react";

export default function GuestLayout() {

  useEffect(()=>{
    localStorage.removeItem('teachwiseai-theme')
  },[])
  return (
<div className="grid min-h-svh lg:grid-cols-2 bg-white"> 
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-black text-white">
              <GalleryVerticalEnd className="size-4" />
            </div>
            TeachWiseAI
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
          <Outlet/>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted-foreground lg:block">
        <img src={student} alt="image" className="absolute inset-0 h-full w-full object-cover" />
      </div>
    </div>
  )
}
