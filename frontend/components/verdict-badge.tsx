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
    className: "bg-primary/10 text-primary border-primary/30",
  },
  false: {
    label: "False",
    icon: XCircle,
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
  misleading: {
    label: "Misleading",
    icon: AlertTriangle,
    className: "bg-warning/10 text-warning border-warning/30",
  },
  unverified: {
    label: "Unverified",
    icon: HelpCircle,
    className: "bg-muted text-muted-foreground border-border",
  },
}

export function VerdictBadge({ verdict, className }: VerdictBadgeProps) {
  const config = verdictConfig[verdict]
  const Icon = config.icon

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-full border font-medium text-sm transition-all",
        config.className,
        className
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{config.label}</span>
    </div>
  )
}
