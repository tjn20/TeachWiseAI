import { Delete } from "lucide-react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFileCsv, faFilePdf,faFileCircleXmark } from "@fortawesome/free-solid-svg-icons"
import ToolTippedButton from "@/components/app/ToolTippedButton"
import FORMAT_FILE_SIZE from "@/src/utils/formatFileSize"

const FILE_TYPES = {
    "application/pdf": faFilePdf,
    "text/csv":faFileCsv
}

export default function FileItem({
    file,
    error,
    onRemoveClick,
    newlyUploaded = false
}) {
  return (
    <div className="flex flex-col animate-in fade-in-0 slide-in-from-bottom-2 duration-700">
    <div className={`flex items-center justify-between px-2 border rounded-lg ${error ? "border-error" : "border-gray-300"}`}>
  <div className="flex gap-2 ">
  <FontAwesomeIcon icon={FILE_TYPES[file.type] ?? faFileCircleXmark} size="xl" className="mt-3 h-8 w-8 dark:text-white"  /> 
  <div className="flex flex-col py-3 pl-2 sm:w-full w-[310px]">
  <p className="text-sm font-semibold truncate dark:text-gray-200">
    {file.name}   {newlyUploaded && <span className="text-xs text-white badge badge-error badge-sm ml-2">New</span>}
  </p>
  <span className="text-xs text-slate-400 dark:text-slate-300">{FORMAT_FILE_SIZE(file.size)}</span>
  </div>
  </div>
  {onRemoveClick && <ToolTippedButton onClick={onRemoveClick} type="button" title="Remove" size="sm" variant="ghost">
  <Delete color="red"/>
  </ToolTippedButton>}
  </div>
  <span className="text-error text-xs mt-1">{error}</span>
</div>
  )
}
