import React from 'react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "../ui/tooltip"
import { Button } from '../ui/button'
export default function ToolTippedButton({
    title,children ,...props
}) {
  return (
    <TooltipProvider delayDuration={0}>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button {...props}>{children}</Button>
        </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>{title}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
  )
}
