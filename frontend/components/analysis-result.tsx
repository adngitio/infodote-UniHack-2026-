"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { VerdictBadge, type VerdictType } from "./verdict-badge"
import { TechniquePill } from "./technique-pill"
import { SourceCard } from "./source-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, ChevronDown, ChevronUp, Copy, Check, FileText, Scale, Shield } from "lucide-react"

export interface AnalysisData {
  verdict: VerdictType
  confidence: number
  technique: string
  explanation: string
  reasoning: string
  literacyLesson: string
  matchedSources: Array<{
    title: string
    url: string
    snippet: string
    verdict: string
    similarityScore?: number
  }>
}

interface AnalysisResultProps {
  data: AnalysisData
  claim: string
  className?: string
}

export function AnalysisResult({ data, claim, className }: AnalysisResultProps) {
  const [reasoningOpen, setReasoningOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const verdictLabel = data.verdict.charAt(0).toUpperCase() + data.verdict.slice(1)
    const text = [
      `🛡️ INFODOTE FACT CHECK`,
      `Claim: "${claim}"`,
      `Verdict: ${verdictLabel} (${data.confidence}% confidence)`,
      `Technique: ${data.technique}`,
      ``,
      data.explanation,
      ``,
      `Powered by Infodote — Your Digital Immunity`,
    ].join("\n")
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Claim being analyzed */}
      <Card className="bg-white/5 border-white/10 shadow-lg backdrop-blur-md">
        <CardHeader className="pb-3 border-b border-white/5">
          <CardTitle className="text-xs font-light tracking-widest text-neutral-500 flex items-center gap-2 uppercase">
            <Scale className="h-4 w-4" />
            Claim Analyzed
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-xl text-white font-light text-pretty">{`"${claim}"`}</p>
        </CardContent>
      </Card>

      {/* Verdict, Confidence, Technique */}
      <div className="flex flex-wrap items-center gap-3">
        <VerdictBadge verdict={data.verdict} />
        <TechniquePill technique={data.technique} />
        <button
          onClick={handleCopy}
          className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md border border-border hover:border-primary/50"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied!" : "Share result"}
        </button>
      </div>

      {/* Confidence Meter */}
      {data.confidence > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>AI Confidence</span>
            <span className="font-medium text-foreground">{data.confidence}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{ width: `${data.confidence}%` }}
            />
          </div>
        </div>
      )}

      {/* Explanation */}
      <Card className="bg-white/5 border-white/10 shadow-lg backdrop-blur-md">
        <CardHeader className="pb-3 border-b border-white/5">
          <CardTitle className="text-xs font-light tracking-widest text-neutral-500 flex items-center gap-2 uppercase">
            <FileText className="h-4 w-4" />
            Explanation
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-neutral-300 font-light leading-relaxed">{data.explanation}</p>
        </CardContent>
      </Card>

      {/* Reasoning (collapsible) */}
      {data.reasoning && (
        <button
          onClick={() => setReasoningOpen((o) => !o)}
          className="w-full text-left"
        >
          <Card className="bg-card border-border hover:border-primary/40 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <Scale className="h-4 w-4" />
                  How we reached this verdict
                </span>
                {reasoningOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CardTitle>
            </CardHeader>
            {reasoningOpen && (
              <CardContent>
                <p className="text-foreground leading-relaxed text-sm">{data.reasoning}</p>
              </CardContent>
            )}
          </Card>
        </button>
      )}

      {/* Literacy Lesson */}
      <Card className="bg-white/5 border-white/10 shadow-lg backdrop-blur-md">
        <CardHeader className="pb-3 border-b border-white/5">
          <CardTitle className="text-xs font-light tracking-widest text-neutral-500 flex items-center gap-2 uppercase">
            <BookOpen className="h-4 w-4" />
            Critical Thinking Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-neutral-300 font-light leading-relaxed">{data.literacyLesson}</p>
        </CardContent>
      </Card>

      {/* Matched Sources */}
      {data.matchedSources.length > 0 && (
        <Card className="bg-white/5 border-white/10 shadow-lg backdrop-blur-md">
          <CardHeader className="pb-3 border-b border-white/5">
            <CardTitle className="text-xs font-light tracking-widest text-neutral-500 flex items-center gap-2 uppercase">
              <Shield className="h-4 w-4" />
              Verified Sources ({data.matchedSources.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {data.matchedSources.map((source, index) => (
              <SourceCard key={index} {...source} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
