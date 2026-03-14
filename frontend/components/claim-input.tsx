"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Search, Sparkles } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

const PLACEHOLDER_EXAMPLES = [
  "5G towers cause health problems",
  "Vaccines contain microchips",
  "Climate change is a hoax",
  "The moon landing was faked",
  "Humans only use 10% of their brains",
  "Earth is flat",
  "AI will replace all human creativity by 2030",
  "Goldfish have a 3-second memory",
  "Sharks don't get cancer",
  "Eating carrots improves night vision",
]

interface ClaimInputProps {
  onSubmit: (claim: string) => void
  isLoading?: boolean
  className?: string
}

export function ClaimInput({ onSubmit, isLoading, className }: ClaimInputProps) {
  const [claim, setClaim] = useState("")
  const [placeholderIndex, setPlaceholderIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDER_EXAMPLES.length)
    }, 3200)
    return () => clearInterval(id)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (claim.trim() && !isLoading) {
      onSubmit(claim.trim())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (claim.trim() && !isLoading) {
        onSubmit(claim.trim())
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)}>
      <div className="relative">
        <Textarea
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`e.g. "${PLACEHOLDER_EXAMPLES[placeholderIndex]}"`}
          className="min-h-[160px] p-6 pb-20 bg-white/5 backdrop-blur-3xl border border-white/10 text-white placeholder:text-neutral-500 resize-none focus:ring-1 focus:ring-white/30 focus:border-white/30 rounded-2xl text-lg font-light shadow-2xl transition-all outline-none"
          disabled={isLoading}
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <Button
            type="submit"
            disabled={!claim.trim() || isLoading}
            className="bg-neutral-800 text-white hover:bg-neutral-700 gap-2 rounded-xl px-5 h-10 font-medium border border-white/10 transition-colors"
          >
            {isLoading ? (
              <>
                <Spinner className="h-4 w-4" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Analyze Claim
              </>
            )}
          </Button>
        </div>
      </div>
      <div className="flex justify-center flex-col sm:flex-row items-center gap-2 mt-4 text-xs text-neutral-500 font-light tracking-wide uppercase">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3 w-3" />
          <span>Fostering critical thought</span>
        </div>
      </div>
    </form>
  )
}
