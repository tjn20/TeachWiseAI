import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function WaitlistedStudentItem({student}) {
  return (
    <div className="flex flex-col animate-in fade-in-0 slide-in-from-bottom-2 duration-700">
        <div className={`flex items-center gap-2 p-4`}>
            <div className="flex items-center gap-4">
                    <FontAwesomeIcon icon={faUser}  /> 
                    <span className="text-sm font-semibold truncate">
                            {student.email}
                     </span>
            </div>
        </div>
    </div>
  )
}

