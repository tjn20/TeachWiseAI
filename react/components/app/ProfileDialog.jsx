import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "../ui/dialog"
import { Label } from "../ui/label"
  
export default function ProfileDialog({
    user
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>profile</DialogTitle>
          <DialogDescription>
            This is your profile. 
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-5 gap-y-6 sm:gap-y-0">
        <div className="flex-1 flex flex-col">
            <Label>
                First Name
            </Label>
            <span className="truncate">{user.first_name}</span>
        </div>
        <div className="flex-1 flex flex-col">
            <Label>
                Last Name
            </Label>
            <span className="truncate">{user.last_name}</span>
        </div>
        <div className="flex flex-col">
            <Label>
                Email
            </Label>
            <span>{user.email}</span>
        </div>
        <div className="flex flex-col">
            <Label>
               Role 
            </Label>
            <span>{user.role}</span>
        </div>
        </div>    
      </DialogContent>
    </Dialog>
  )
}
