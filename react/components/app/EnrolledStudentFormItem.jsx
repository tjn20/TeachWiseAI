import { faSquareCheck, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
export default function EnrolledStudentFormItem({
    student,
    isSelected,
    onSelect
}) {
    return (
      <div className="flex flex-1 flex-col animate-in fade-in-0 slide-in-from-bottom-2 duration-700 cursor-pointer overflow-hidden dark:text-white" onClick={()=>onSelect(student.id)}>
          <div className={`flex items-center gap-2 p-3 border border-gray-300 dark:border-sidebarInset rounded-lg transition ${isSelected && "bg-gray-200 dark:bg-sidebarInset"}`}>
          <FontAwesomeIcon
            icon={faSquareCheck}
            className={`w-4 h-4 cursor-pointer accent-gray-500 dark:accent-white 
                transition-all duration-200 
                ${isSelected ? "opacity-100 translate-x-0" : "opacity-0 invisible -translate-x-4 pointer-events-none"}`}
            />
           
              <div className={`flex items-center gap-4 transition-all duration-200  ${isSelected ? "translate-x-0" : "-translate-x-5"} `}>
                      <FontAwesomeIcon icon={faUser}  /> 
                      <span className="text-sm font-semibold truncate">
                      {student.student_university_id} - {student.first_name} {student.last_name}
                       </span>
              </div>
          </div>
      </div>
    )
}

