import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    (<input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-base ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-gray-950 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950  disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:border-gray-600 dark:bg-transparent dark:ring-offset-gray-950 dark:file:text-gray-50 dark:placeholder:text-gray-300 dark:focus-visible:ring-gray-300 dark:text-white dark:caret-white",
        className
      )}
      ref={ref}
      {...props} />)
  );
})
Input.displayName = "Input"

export { Input }
