"use client"

import { cn } from "@/lib/utils"
import { ExternalLink, Shield } from "lucide-react"

interface SourceCardProps {
  title: string
  url: string
  snippet: string
  relevanceScore: number
  biasScore: number
  className?: string
}

export function SourceCard({
  title,
  url,
  snippet,
  relevanceScore,
  biasScore,
  className,
}: SourceCardProps) {
  let domain = url
  try { domain = new URL(url).hostname.replace("www.", "") } catch {}

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
          {/* Domain + match badge */}
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-3 w-3 text-neutral-500 flex-shrink-0" />
            <span className="text-xs font-light text-neutral-500 truncate mt-px">
              {domain}
            </span>
            <span className="text-[10px] text-white bg-white/10 border border-white/10 px-2 py-0.5 rounded-full font-medium tracking-wide">
              {Math.round(relevanceScore * 100)}% match
            </span>
          </div>

          <h4 className="text-sm font-medium text-white group-hover:text-neutral-300 transition-colors line-clamp-1">
            {title}
          </h4>
          <p className="text-xs text-neutral-400 mt-1.5 line-clamp-2 font-light leading-relaxed">
            {snippet}
          </p>

          {/* Source bias gauge */}
          <div className="mt-3 space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] tracking-widest text-neutral-600 uppercase font-light">Source Bias</span>
              <span className="text-[10px] text-neutral-500">{biasScore}<sup className="text-[8px]">%</sup></span>
            </div>
            <div className="h-[2px] w-full rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-neutral-400 transition-all duration-500"
                style={{ width: `${biasScore}%` }}
              />
            </div>
          </div>
        </div>
        <ExternalLink className="h-4 w-4 text-neutral-600 group-hover:text-white transition-colors flex-shrink-0 mt-1" />
      </div>
    </a>
  )
}
