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
        "block p-5 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 transition-all group",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-3 w-3 text-neutral-500 flex-shrink-0" />
            <span className="text-xs font-light text-neutral-500 truncate mt-px">
              {domain}
            </span>
<<<<<<< Updated upstream
            <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {verdict}
=======
            <span className="text-[10px] text-white bg-white/10 border border-white/10 px-2 py-0.5 rounded-full font-medium tracking-wide">
              {Math.round(relevanceScore * 100)}% match
>>>>>>> Stashed changes
            </span>
            {matchPct != null && (
              <span className="ml-auto text-xs text-muted-foreground flex-shrink-0">
                {matchPct}% match
              </span>
            )}
          </div>
          <h4 className="text-sm font-medium text-white group-hover:text-neutral-300 transition-colors line-clamp-1">
            {title}
          </h4>
          <p className="text-xs text-neutral-400 mt-1.5 line-clamp-2 font-light leading-relaxed">
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
        <ExternalLink className="h-4 w-4 text-neutral-600 group-hover:text-white transition-colors flex-shrink-0 mt-1" />
      </div>
    </a>
  )
}
