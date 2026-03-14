"use client"

import { cn } from "@/lib/utils"

interface ScoreGaugeProps {
  label: string
  value: number          // 0-100
  description?: string
  invert?: boolean       // if true, high = bad (e.g. bias)
  className?: string
}

export function ScoreGauge({ label, value, description, className }: ScoreGaugeProps) {
  // Color: neutral by default, skewed towards red if invert & high, or white if normal & high
  const clampedValue = Math.max(0, Math.min(100, value))

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-light tracking-widest text-neutral-500 uppercase">{label}</span>
        <span className="text-lg font-medium text-white tabular-nums">{clampedValue}<span className="text-xs text-neutral-500 font-light">%</span></span>
      </div>

      {/* Track */}
      <div className="h-[3px] w-full rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 bg-white"
          style={{ width: `${clampedValue}%` }}
        />
      </div>

      {description && (
        <p className="text-[11px] text-neutral-600 font-light leading-relaxed">{description}</p>
      )}
    </div>
  )
}
