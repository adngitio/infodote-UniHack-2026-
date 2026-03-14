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
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white border border-white/20 text-xs font-medium tracking-wide",
        className
      )}
    >
      <Lightbulb className="h-4 w-4" />
      <span>{technique}</span>
    </div>
  )
}
