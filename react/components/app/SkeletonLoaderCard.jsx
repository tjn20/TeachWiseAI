import { Skeleton } from "../ui/skeleton";

export default function SkeletonLoaderCard() {
  return (
<div className="flex flex-col space-y-3 animate-in fade-in-0 slide-in-from-bottom-6 zoom-in-100 duration-700">
            <Skeleton className="h-[100px] w-[350px] shadow rounded-xl bg-gray-200 dark:bg-sidebarInset" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[350px] shadow-md bg-gray-200 dark:bg-sidebarInset" />
              <Skeleton className="h-4 w-[300px] shadow-md bg-gray-200 dark:bg-sidebarInset" />
            </div>
            </div>
  )
}
