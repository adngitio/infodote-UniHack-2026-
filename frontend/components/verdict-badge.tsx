"use client"

import { cn } from "@/lib/utils"
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle } from "lucide-react"

export type VerdictType = "true" | "false" | "misleading" | "unverified"

interface VerdictBadgeProps {
  verdict: VerdictType
  className?: string
}

const verdictConfig = {
  true: {
    label: "Verified True",
    icon: CheckCircle2,
    className: "bg-white/10 text-white border-white/20",
  },
  false: {
    label: "False",
    icon: XCircle,
    className: "bg-white/5 text-neutral-400 border-white/10",
  },
  misleading: {
    label: "Misleading",
    icon: AlertTriangle,
    className: "bg-white/5 text-neutral-300 border-white/10",
  },
  unverified: {
    label: "Unverified",
    icon: HelpCircle,
    className: "bg-transparent text-neutral-500 border-white/10",
  },
}

export function VerdictBadge({ verdict, className }: VerdictBadgeProps) {
  const config = verdictConfig[verdict]
  const Icon = config.icon

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-full border font-medium text-sm transition-all shadow-sm tracking-wide",
        config.className,
        className
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{config.label}</span>
    </div>
  )
}
