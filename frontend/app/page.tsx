"use client"

import { useState } from "react"
import { ClaimInput } from "@/components/claim-input"
import { ExampleChips } from "@/components/example-chips"
import { AnalysisResult, type AnalysisData } from "@/components/analysis-result"
import { analyzeClaim } from "@/lib/api"
import { Shield, Sparkles, Target, BookOpen } from "lucide-react"

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<AnalysisData | null>(null)
  const [analyzedClaim, setAnalyzedClaim] = useState("")

  const handleAnalyze = async (claim: string) => {
    setIsLoading(true)
    setResult(null)
    setAnalyzedClaim(claim)

    try {
      const data = await analyzeClaim(claim)
      setResult(data)
    } catch (error) {
      console.error("Analysis failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Infodote</h1>
              <p className="text-xs text-muted-foreground">Your Digital Immunity</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">AI-Powered Fact Analysis</span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero Section */}
        {!result && !isLoading && (
          <section className="text-center mb-12 pt-8">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-balance">
              Build Your Digital Immunity
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty">
              Analyze claims, detect misinformation techniques, and strengthen your
              critical thinking with AI-powered fact-checking.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm text-foreground">Detect Techniques</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm text-foreground">Verified Sources</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="text-sm text-foreground">Learn as You Go</span>
              </div>
            </div>
          </section>
        )}

        {/* Claim Input Section */}
        <section className="mb-8">
          <ClaimInput onSubmit={handleAnalyze} isLoading={isLoading} />
          {!result && !isLoading && (
            <div className="mt-6">
              <ExampleChips onSelect={handleAnalyze} />
            </div>
          )}
        </section>

        {/* Loading State */}
        {isLoading && (
          <section className="text-center py-16">
            <div className="inline-flex flex-col items-center gap-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <Shield className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div>
                <p className="text-foreground font-medium">Analyzing claim...</p>
                <p className="text-sm text-muted-foreground">
                  Checking sources and detecting techniques
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Results */}
        {result && !isLoading && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Analysis Results</h3>
              <button
                onClick={() => {
                  setResult(null)
                  setAnalyzedClaim("")
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Analyze Another
              </button>
            </div>
            <AnalysisResult data={result} claim={analyzedClaim} />
          </section>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>
            Infodote - Building digital immunity through critical thinking.
          </p>
          <p className="mt-1">UniHack 2026 Project</p>
        </footer>
      </div>
    </main>
  )
}
