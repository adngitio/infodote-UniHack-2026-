"use client"

import { cn } from "@/lib/utils"
import { VerdictBadge, type VerdictType } from "./verdict-badge"
import { TechniquePill } from "./technique-pill"
import { SourceCard } from "./source-card"
import { ScoreGauge } from "./score-gauge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, FileText, Scale, Shield } from "lucide-react"

export interface AnalysisData {
  verdict: VerdictType
  technique: string
  explanation: string
  literacyLesson: string
  biasScore: number
  soundnessScore: number
  provocationScore: number
  matchedSources: Array<{
    title: string
    url: string
    snippet: string
    relevanceScore: number
    biasScore: number
  }>
}

interface AnalysisResultProps {
  data: AnalysisData
  claim: string
  density?: "compact" | "detailed"
  className?: string
}

export function AnalysisResult({ data, claim, density = "detailed", className }: AnalysisResultProps) {
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

      {/* Verdict and Technique */}
      <div className="flex flex-wrap items-center gap-3">
        <VerdictBadge verdict={data.verdict} />
        <TechniquePill technique={data.technique} />
      </div>

      {/* Critical Thinking Scores — hidden in compact mode */}
      {density === "detailed" && (
        <Card className="bg-white/5 border-white/10 shadow-lg backdrop-blur-md">
          <CardHeader className="pb-3 border-b border-white/5">
            <CardTitle className="text-xs font-light tracking-widest text-neutral-500 uppercase">
              Claim Analysis Scores
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 space-y-5">
            <ScoreGauge
              label="Bias"
              value={data.biasScore}
              invert
              description="Higher scores indicate stronger ideological or emotional slant in the claim."
            />
            <ScoreGauge
              label="Logical Soundness"
              value={data.soundnessScore}
              description="How well-structured and logically consistent the claim is."
            />
            <ScoreGauge
              label="Provocation"
              value={data.provocationScore}
              description="How thought-provoking or philosophically stimulating the claim is."
            />
          </CardContent>
        </Card>
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

      {/* Matched Sources — show section even when empty so user knows why */}
      <Card className="bg-white/5 border-white/10 shadow-lg backdrop-blur-md">
        <CardHeader className="pb-3 border-b border-white/5">
          <CardTitle className="text-xs font-light tracking-widest text-neutral-500 flex items-center gap-2 uppercase">
            <Shield className="h-4 w-4" />
            {data.matchedSources.length > 0
              ? `Verified Sources (${data.matchedSources.length})`
              : "Sources"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          {data.matchedSources.length > 0 ? (
            data.matchedSources.map((source, index) => (
              <SourceCard key={index} {...source} />
            ))
          ) : (
            <p className="text-sm text-neutral-500 font-light">
              No external sources were used for this analysis. The explanation and guide above are from the AI (Gemini 2.0 Flash). Context search (e.g. Elasticsearch) was unavailable or returned no matches.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
