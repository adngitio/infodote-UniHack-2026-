"use client"

import { cn } from "@/lib/utils"
import { ExternalLink, Shield } from "lucide-react"

interface SourceCardProps {
  title: string
  url: string
  snippet: string
  verdict: string
  similarityScore?: number
  className?: string
}

export function SourceCard({
  title,
  url,
  snippet,
  verdict,
  similarityScore,
  className,
}: SourceCardProps) {
  const domain = new URL(url).hostname.replace("www.", "")
  const matchPct = similarityScore != null ? Math.round(similarityScore * 100) : null

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "block p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all group",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-xs text-muted-foreground truncate">
              {domain}
            </span>
            <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {verdict}
            </span>
            {matchPct != null && (
              <span className="ml-auto text-xs text-muted-foreground flex-shrink-0">
                {matchPct}% match
              </span>
            )}
          </div>
          <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {title}
          </h4>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {snippet}
          </p>
          {matchPct != null && (
            <div className="mt-2 h-1 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary/60"
                style={{ width: `${matchPct}%` }}
              />
            </div>
          )}
        </div>
        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
      </div>
    </a>
  )
}
