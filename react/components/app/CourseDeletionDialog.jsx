import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "../ui/alert-dialog"
  
export default function CourseDeletionDialog({
    onConfirm,
    onCancel,
    open,
}) {
  return (
        <AlertDialog open={open}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
            This action will permanently delete your course and erase all associated data for enrolled students.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
          <AlertDialogCancel size="sm" variant="outline" onClick={onCancel}>Cancel</AlertDialogCancel>   
          <AlertDialogAction  size="sm" variant="destructive" onClick={onConfirm}>Confirm</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
  )
}
