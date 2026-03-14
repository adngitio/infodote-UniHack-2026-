"use client"

import { cn } from "@/lib/utils"
import { VerdictBadge, type VerdictType } from "./verdict-badge"
import { TechniquePill } from "./technique-pill"
import { SourceCard } from "./source-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, FileText, Scale, Shield } from "lucide-react"

export interface AnalysisData {
  verdict: VerdictType
  technique: string
  explanation: string
  literacyLesson: string
  matchedSources: Array<{
    title: string
    url: string
    snippet: string
    relevanceScore: number
  }>
}

interface AnalysisResultProps {
  data: AnalysisData
  claim: string
  className?: string
}

export function AnalysisResult({ data, claim, className }: AnalysisResultProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Claim being analyzed */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Claim Analyzed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-foreground font-medium">{`"${claim}"`}</p>
        </CardContent>
      </Card>

      {/* Verdict and Technique */}
      <div className="flex flex-wrap items-center gap-3">
        <VerdictBadge verdict={data.verdict} />
        <TechniquePill technique={data.technique} />
      </div>

      {/* Explanation */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Explanation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground leading-relaxed">{data.explanation}</p>
        </CardContent>
      </Card>

      {/* Literacy Lesson */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Digital Immunity Lesson
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground leading-relaxed">{data.literacyLesson}</p>
        </CardContent>
      </Card>

      {/* Matched Sources */}
      {data.matchedSources.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Verified Sources ({data.matchedSources.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.matchedSources.map((source, index) => (
              <SourceCard key={index} {...source} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
