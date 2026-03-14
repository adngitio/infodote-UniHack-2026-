"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Search, Sparkles } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

interface ClaimInputProps {
  onSubmit: (claim: string) => void
  isLoading?: boolean
  className?: string
}

export function ClaimInput({ onSubmit, isLoading, className }: ClaimInputProps) {
  const [claim, setClaim] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (claim.trim() && !isLoading) {
      onSubmit(claim.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)}>
      <div className="relative">
        <Textarea
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
          placeholder="Enter a claim to analyze... e.g., '5G towers cause health problems'"
          className="min-h-[120px] pr-4 pb-16 bg-card border-border text-foreground placeholder:text-muted-foreground resize-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          disabled={isLoading}
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <Button
            type="submit"
            disabled={!claim.trim() || isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
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
      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
        <Sparkles className="h-3 w-3 text-primary" />
        <span>Powered by AI analysis and verified sources</span>
      </div>
    </form>
  )
}
