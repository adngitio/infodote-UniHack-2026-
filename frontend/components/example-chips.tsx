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
    <div className={cn("flex flex-wrap gap-2 items-center", className)}>
      <span className="text-sm font-light text-neutral-500 mr-2">Try:</span>
      {exampleClaims.map((claim) => (
        <button
          key={claim}
          onClick={() => onSelect(claim)}
          className="px-3 py-1.5 text-sm font-light bg-white/5 hover:bg-white/10 text-neutral-300 rounded-full border border-white/10 hover:border-white/30 transition-all"
        >
          {claim}
        </button>
      ))}
    </div>
  )
}
