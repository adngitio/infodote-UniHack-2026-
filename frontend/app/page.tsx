"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { cn } from "@/lib/utils"
import { ClaimInput } from "@/components/claim-input"
import { ExampleChips } from "@/components/example-chips"
import { AnalysisResult, type AnalysisData } from "@/components/analysis-result"
import { HistorySidebar, type HistoryItem } from "@/components/history-sidebar"
import { analyzeClaim, getCached } from "@/lib/api"
import { SettingsProvider, useSettings } from "@/lib/settings-context"
import { Shield, Sparkles, Target, BookOpen } from "lucide-react"

const HISTORY_KEY = "infodote_history"

const quotes = [
  { text: "The unexamined life is not worth living.", author: "Socrates" },
  { text: "It is the mark of an educated mind to be able to entertain a thought without accepting it.", author: "Aristotle" },
  { text: "The important thing is not to stop questioning...", author: "Albert Einstein" },
  { text: "What we know is a drop, what we don't know is an ocean.", author: "Isaac Newton" },
  { text: "Sometimes people don't want to hear the truth because they don't want their illusions destroyed.", author: "Friedrich Nietzsche" },
  { text: "A wise man speaks because he has something to say; a fool because he has to say something.", author: "Plato" },
]

function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed: HistoryItem[] = JSON.parse(raw)
    // Deduplicate by ID to fix existing key conflicts
    const unique = new Map<string, HistoryItem>()
    parsed.forEach(item => {
      if (item.id && !unique.has(item.id)) {
        unique.set(item.id, item)
      }
    })
    return Array.from(unique.values())
  } catch { return [] }
}

function saveHistory(items: HistoryItem[]) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(items)) } catch {}
}

function HomeInner() {
  const { autoScroll, density, theme, fontSize, showConfidence, clearCount } = useSettings()
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<AnalysisData | null>(null)
  const [analyzedClaim, setAnalyzedClaim] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [randomQuote, setRandomQuote] = useState(quotes[0])
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [activeHistoryId, setActiveHistoryId] = useState<string | undefined>()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Load persisted state on mount; sidebar always starts open on refresh/first open
  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  // Reset all UI state when user clears data
  useEffect(() => {
    if (clearCount === 0) return
    setHistory([])
    setResult(null)
    setAnalyzedClaim("")
    setError(null)
    setActiveHistoryId(undefined)
  }, [clearCount])

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev)

  const newAnalysis = () => {
    setResult(null)
    setAnalyzedClaim("")
    setError(null)
    setActiveHistoryId(undefined)
  }

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

  const displayResult = (data: AnalysisData, claim: string, histId?: string) => {
    setResult(data)
    setAnalyzedClaim(claim)
    if (histId) setActiveHistoryId(histId)
    if (autoScroll) {
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100)
    }
  }

  const handleAnalyze = async (claim: string) => {
    const cached = getCached(claim)
    if (cached) {
      displayResult(cached, claim)
      return
    }

    setIsLoading(true)
    setResult(null)
    setError(null)
    setAnalyzedClaim(claim)
    setRandomQuote(quotes[Math.floor(Math.random() * quotes.length)])

    try {
      console.log("Analyzing claim:", claim)
      const data = await analyzeClaim(claim)
      console.log("Analysis received:", data)

      const id = Math.random().toString(36).substring(2, 9) + Date.now().toString().slice(-4)
      const newItem: HistoryItem = { 
        id, 
        claim, 
        verdict: data.verdict, 
        timestamp: new Date().toISOString() 
      }
      
      setHistory(prev => {
        const updated = [newItem, ...prev.slice(0, 19)]
        saveHistory(updated)
        return updated
      })
      
      displayResult(data, claim, id)
    } catch (err) {
      console.error("Analysis error:", err)
      setError(err instanceof Error ? err.message : "Analysis failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleHistorySelect = (item: HistoryItem) => {
    setActiveHistoryId(item.id)
    const cached = getCached(item.claim)
    if (cached) displayResult(cached, item.claim, item.id)
    else handleAnalyze(item.claim)
  }

  const handleClearHistory = () => {
    setHistory([]); setActiveHistoryId(undefined)
    setResult(null); setAnalyzedClaim("")
    saveHistory([])
  }

  const showHero = !result && !isLoading
  const HEADER_H = "h-14"

  return (
    <div data-theme={theme} data-font={fontSize} className="min-h-screen text-white selection:bg-neutral-800 flex flex-col" style={{ backgroundColor: "rgb(var(--background))", color: "rgb(var(--foreground))" }}>

      {/* ── Header ────────────────────────────────────────────── */}
      <header className={`${HEADER_H} border-b border-white/5 bg-black/80 backdrop-blur-xl sticky top-0 z-50 flex items-center px-3 gap-3`}>

        {/* Shield logo — toggles sidebar */}
        <button
          onClick={toggleSidebar}
          title={sidebarCollapsed ? "Open sidebar" : "Close sidebar"}
          className="h-9 w-9 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all shrink-0"
        >
          <Shield className="h-4 w-4 text-white" />
        </button>

        {/* Infodote wordmark — clicking resets to new analysis */}
        <button
          onClick={newAnalysis}
          className="flex items-baseline gap-1.5 group"
          title="New analysis"
        >
          <span className="text-lg font-semibold tracking-[-0.04em] text-white group-hover:text-neutral-300 transition-colors">
            Info<span className="text-neutral-500 group-hover:text-neutral-400 transition-colors">dote</span>
          </span>
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Tagline */}
        <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-light tracking-widest text-neutral-600 uppercase">
          <Sparkles className="h-3 w-3" />
          <span>Purveyors of critical thinking</span>
        </div>
      </header>

      {/* ── Body row ────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 relative">

        {/* Sidebar */}
        <HistorySidebar
          history={history}
          onSelect={handleHistorySelect}
          onClearHistory={handleClearHistory}
          collapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
          activeId={activeHistoryId}
        />

        {/* Main scroll area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          <div className={cn(
            "max-w-3xl mx-auto px-6 transition-all duration-500",
            showHero ? "h-full flex flex-col justify-center py-6" : "py-12"
          )}>

            {/* Hero */}
            {showHero && (
              <section className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h2 className="text-4xl sm:text-6xl font-semibold bg-gradient-to-b from-white to-neutral-500 bg-clip-text text-transparent mb-4 pb-1 text-balance tracking-tight leading-[1.1]">
                  Build your digital immunity.
                </h2>
                <p className="text-base sm:text-lg text-neutral-400 max-w-xl mx-auto mb-8 text-pretty font-light leading-relaxed">
                  Analyze claims, detect misinformation techniques, and strengthen your critical thinking.
                </p>
                <div className="flex flex-wrap justify-center items-center gap-4 text-neutral-500 mb-8 opacity-60">
                  <div className="flex items-center gap-2">
                    <Target className="h-3.5 w-3.5" /><span className="text-xs font-light">Detect Techniques</span>
                  </div>
                  <div className="w-px h-3 bg-neutral-800" />
                  <div className="flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5" /><span className="text-xs font-light">Verified Sources</span>
                  </div>
                  <div className="w-px h-3 bg-neutral-800" />
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-3.5 w-3.5" /><span className="text-xs font-light">Learn as You Go</span>
                  </div>
                </div>
              </section>
            )}

            {/* Input Container */}
            <section className={cn(
              "transition-all duration-500 w-full",
              showHero ? "max-w-2xl mx-auto" : "mb-12"
            )}>
              <ClaimInput onSubmit={handleAnalyze} isLoading={isLoading} />
              {error && !isLoading && (
                <div className="mt-4 p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 text-sm font-light">
                  {error}
                </div>
              )}
              {!result && !isLoading && (
                <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-1000 delay-300 fill-mode-both">
                  <ExampleChips onSelect={handleAnalyze} />
                </div>
              )}
            </section>

            {/* Loading */}
            {isLoading && (
              <section className="text-center py-12 h-[300px] flex items-center justify-center">
                <div className="inline-flex flex-col items-center gap-6">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full border border-white/10 border-t-white/70 animate-spin" />
                    <Shield className="h-4 w-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div className="space-y-3 max-w-xs">
                    <p className="text-white text-sm font-medium tracking-tight">Fostering critical thought...</p>
                    <div className="text-neutral-400 font-light text-xs italic leading-relaxed">
                      &ldquo;{randomQuote.text}&rdquo;
                      <span className="block mt-1 font-normal text-neutral-600 not-italic text-[10px] tracking-wide">— {randomQuote.author}</span>
                    </div>
                    <p className="text-[10px] text-neutral-700 uppercase tracking-widest font-light mt-4">
                      Press any key for a new quote
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Results */}
            {result && !isLoading && (
              <section ref={resultsRef} className="animate-in fade-in zoom-in-95 duration-500">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                  <h3 className="text-xl font-medium text-white tracking-tight">Analysis Results</h3>
                  <button
                    onClick={newAnalysis}
                    className="text-sm text-neutral-400 hover:text-white transition-colors font-light"
                  >
                    Analyze Another
                  </button>
                </div>
                <AnalysisResult data={result} claim={analyzedClaim} density={density} showConfidence={showConfidence} />
              </section>
            )}

            {/* Footer */}
            <footer className={cn(
               "pt-8 text-center text-[10px] text-neutral-700 font-light transition-all",
               showHero ? "mt-4" : "mt-24 border-t border-white/5"
            )}>
              <p>Infodote — Building digital immunity through critical thinking.</p>
              <p className="mt-1 text-neutral-800">UniHack 2026 Project</p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <SettingsProvider>
      <HomeInner />
    </SettingsProvider>
  )
}
