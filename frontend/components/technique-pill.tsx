"use client"

import { cn } from "@/lib/utils"
import { Lightbulb } from "lucide-react"

interface TechniquePillProps {
  technique: string
  className?: string
}

export function TechniquePill({ technique, className }: TechniquePillProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-info/10 text-info border border-info/30 text-sm font-medium",
        className
      )}
    >
      <Lightbulb className="h-4 w-4" />
      <span>{technique}</span>
    </div>
  )
}
