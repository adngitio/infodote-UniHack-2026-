"use client"

import { cn } from "@/lib/utils"

interface ExampleChipsProps {
  onSelect: (claim: string) => void
  className?: string
}

const exampleClaims = [
  "5G towers cause health problems",
  "Vaccines contain microchips",
  "Climate change is a hoax",
  "The moon landing was faked",
  "Drinking lemon water cures cancer",
  "Earth is flat",
]

export function ExampleChips({ onSelect, className }: ExampleChipsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <span className="text-sm text-muted-foreground mr-1">Try:</span>
      {exampleClaims.map((claim) => (
        <button
          key={claim}
          onClick={() => onSelect(claim)}
          className="px-3 py-1.5 text-sm bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-full border border-border hover:border-primary/50 transition-all"
        >
          {claim}
        </button>
      ))}
    </div>
  )
}
