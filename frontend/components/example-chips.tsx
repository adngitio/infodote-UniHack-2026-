"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface ExampleChipsProps {
  onSelect: (claim: string) => void
  className?: string
}

const examplePool = [
  "5G towers cause health problems",
  "Vaccines contain microchips",
  "Climate change is a hoax",
  "The moon landing was faked",
  "Drinking lemon water cures cancer",
  "Earth is flat",
  "AI will replace all human creativity by 2030",
  "The Great Wall of China is visible from the moon",
  "Humans only use 10% of their brains",
  "Napoleon Bonaparte was extremely short",
  "Sharks don't get cancer",
  "Bulls hate the color red",
  "Eating carrots improves night vision",
  "Goldfish have a 3-second memory",
  "Chameleons change color to blend in with surroundings",
  "Wait times at traffic lights add up to 6 months of your life",
]

export function ExampleChips({ onSelect, className }: ExampleChipsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])

  useEffect(() => {
    // Pick 6 random suggestions
    const shuffled = [...examplePool].sort(() => 0.5 - Math.random())
    setSuggestions(shuffled.slice(0, 6))
  }, [])

  return (
    <div className={cn("flex flex-wrap gap-2 items-center justify-center", className)}>
      <span className="text-sm font-light text-neutral-500 mr-1 w-full text-center mb-2">Try analyzing:</span>
      {suggestions.map((claim) => (
        <button
          key={claim}
          onClick={() => onSelect(claim)}
          className="px-3 py-1.5 text-[11px] font-light bg-black/20 hover:bg-white/10 text-neutral-400 hover:text-white rounded-full border border-white/5 hover:border-white/20 transition-all backdrop-blur-sm"
        >
          {claim}
        </button>
      ))}
    </div>
  )
}
