"use client"

import { useState, useEffect, useCallback } from "react"
import { ClaimInput } from "@/components/claim-input"
import { ExampleChips } from "@/components/example-chips"
import { AnalysisResult, type AnalysisData } from "@/components/analysis-result"
import { analyzeClaim } from "@/lib/api"
import { Shield, Sparkles, Target, BookOpen } from "lucide-react"

const quotes = [
  { text: "The unexamined life is not worth living.", author: "Socrates" },
  { text: "It is the mark of an educated mind to be able to entertain a thought without accepting it.", author: "Aristotle" },
  { text: "The important thing is not to stop questioning...", author: "Albert Einstein" },
  { text: "What we know is a drop, what we don't know is an ocean.", author: "Isaac Newton" },
  { text: "Sometimes people don't want to hear the truth because they don't want their illusions destroyed.", author: "Friedrich Nietzsche" },
  { text: "A wise man speaks because he has something to say; a fool because he has to say something.", author: "Plato" }
]

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<AnalysisData | null>(null)
  const [analyzedClaim, setAnalyzedClaim] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [randomQuote, setRandomQuote] = useState(quotes[0])

  const cycleQuote = useCallback(() => {
    setRandomQuote(q => {
      const others = quotes.filter(x => x !== q)
      return others[Math.floor(Math.random() * others.length)]
    })
  }, [])

  useEffect(() => {
    if (!isLoading) return
    const handler = () => cycleQuote()
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [isLoading, cycleQuote])

  const handleAnalyze = async (claim: string) => {
    setIsLoading(true)
    setResult(null)
    setError(null)
    setAnalyzedClaim(claim)
    setRandomQuote(quotes[Math.floor(Math.random() * quotes.length)])

    try {
      const data = await analyzeClaim(claim)
      setResult(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Analysis failed"
      setError(message)
      console.error("Analysis failed:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-neutral-800">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex items-center justify-center border border-white/10 rounded-xl bg-white/5">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-medium tracking-tight text-white">Infodote</h1>
              <p className="text-xs text-neutral-500 font-light">Your Digital Immunity</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-light tracking-wide text-neutral-500 uppercase">
            <Sparkles className="h-3 w-3" />
            <span className="hidden sm:inline">Purveyors of critical thinking</span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Hero Section */}
        {!result && !isLoading && (
          <section className="text-center mb-20 pt-16">
            <h2 className="text-5xl sm:text-6xl font-semibold bg-gradient-to-b from-white to-neutral-500 bg-clip-text text-transparent mb-6 pb-2 text-balance tracking-tight leading-[1.1]">
              Build your digital immunity.
            </h2>
            <p className="text-lg text-neutral-400 max-w-2xl mx-auto mb-12 text-pretty font-light">
              Analyze claims, detect misinformation techniques, and strengthen your
              critical thinking with AI-powered fact-checking.
            </p>

            {/* Features */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-neutral-400 mb-12">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span className="text-sm font-medium">Detect Techniques</span>
              </div>
              <div className="w-px h-4 bg-neutral-800" />
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Verified Sources</span>
              </div>
              <div className="w-px h-4 bg-neutral-800" />
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="text-sm font-medium">Learn as You Go</span>
              </div>
            </div>
          </section>
        )}

        {/* Claim Input Section */}
        <section className="mb-12 max-w-3xl mx-auto">
          <ClaimInput onSubmit={handleAnalyze} isLoading={isLoading} />
          {error && !isLoading && (
            <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              {error}
            </div>
          )}
          {!result && !isLoading && (
            <div className="mt-6">
              <ExampleChips onSelect={handleAnalyze} />
            </div>
          )}
        </section>

        {/* Loading State */}
        {isLoading && (
          <section className="text-center py-24">
            <div className="inline-flex flex-col items-center gap-6">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border border-white/10 border-t-white animate-spin" />
                <Shield className="h-5 w-5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="space-y-4 max-w-sm mt-4">
                <p className="text-white font-medium tracking-tight">Fostering critical thought...</p>
                <div className="text-neutral-400 font-light text-sm italic">
                  "{randomQuote.text}"
                  <span className="block mt-2 font-normal text-neutral-600 not-italic">— {randomQuote.author}</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Results */}
        {result && !isLoading && (
          <section>
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
              <h3 className="text-xl font-medium text-white tracking-tight">Analysis Results</h3>
              <button
                onClick={() => {
                  setResult(null)
                  setAnalyzedClaim("")
                }}
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Analyze Another
              </button>
            </div>
            <AnalysisResult data={result} claim={analyzedClaim} />
          </section>
        )}

        {/* Footer */}
        <footer className="mt-32 pt-12 border-t border-white/5 text-center text-sm text-neutral-500 font-light">
          <p>
            Infodote - Building digital immunity through critical thinking.
          </p>
          <p className="mt-2 text-neutral-600">UniHack 2026 Project</p>
        </footer>
      </div>
    </main>
  )
}
