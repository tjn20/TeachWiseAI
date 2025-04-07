import { Inbox } from "lucide-react"
import { useCallback } from "react"
import { useDropzone } from "react-dropzone"

  
export default function FileUpload({
    maxFiles, 
    multiple,
    addFile,
}) {
    const onDrop = useCallback((acceptedFiles)=>{
        if(acceptedFiles?.length)
        {
            addFile(acceptedFiles)
        }
    },[addFile])
    
    const {getRootProps,getInputProps,isDragActive} = useDropzone({
        onDrop,
        multiple: multiple ?? true, 
        maxFiles: maxFiles ?? 7, 
    })
  return (
    <div className="p-2 rounded-xl">
      <div {...getRootProps({
        className:"border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col dark:bg-main"
      })}>
        <input {...getInputProps()} />
        <>
        <Inbox size={20} className="text-black dark:text-white"/>
        {
        isDragActive ?
          <p className="mt-2 text-sm text-slate-400 dark:text-slate-100">Drop the files here ...</p> :
          <p className="mt-2 text-sm text-slate-400 dark:text-slate-100">Drag and drop files here, or click to browse for files.</p>
      }
        </>
      </div>
    </div>
  )
}
