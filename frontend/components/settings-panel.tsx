"use client"

import { useSettings } from "@/lib/settings-context"
import { X, Moon, Sun, Monitor, Type, LayoutGrid, Download, Trash2, Shield } from "lucide-react"
import { cn } from "@/lib/utils"
import type { HistoryItem } from "./history-sidebar"

interface SettingsPanelProps {
  onClose: () => void
  history: HistoryItem[]
  onClearHistory: () => void
}

export function SettingsPanel({ onClose, history, onClearHistory }: SettingsPanelProps) {
  const { 
    theme, setTheme, 
    fontSize, setFontSize, 
    density, setDensity,
    showConfidence, setShowConfidence,
    autoScroll, setAutoScroll,
    clearAllData 
  } = useSettings()

  const exportHistory = () => {
    const data = JSON.stringify(history, null, 2)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `infodote-history-${new Date().toISOString().split("T")[0]}.json`
    a.click()
  }

  const handleClearAll = () => {
    if (confirm("This will permanently delete your entire analysis history and cache. Are you sure?")) {
      clearAllData()
      onClearHistory()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-neutral-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-neutral-400" />
            <h2 className="text-lg font-medium text-white tracking-tight">System Settings</h2>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 text-neutral-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto max-h-[85vh]">
          {/* Appearance Section */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-light tracking-widest text-neutral-500 uppercase">Appearance</h3>
            
            <div className="space-y-6">
              {/* Theme Selection */}
              <div className="space-y-3">
                <label className="text-sm text-neutral-300 font-light">Accent Theme</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "black", label: "Pure", icon: Moon, color: "#000000" },
                    { id: "slate", label: "Slate", icon: Monitor, color: "#0f1117" },
                    { id: "warm", label: "Warm", icon: Sun, color: "#0e0c0a" },
                    { id: "light", label: "Light", icon: Sun, color: "#f5f5f7" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id as any)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all",
                        theme === t.id ? "bg-white/10 border-white/20" : "bg-white/5 border-transparent hover:border-white/10"
                      )}
                    >
                      <div className="h-4 w-4 rounded-full border border-white/10" style={{ background: t.color }} />
                      <span className="text-[10px] font-light text-neutral-400">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div className="space-y-3">
                <label className="text-sm text-neutral-300 font-light">Text Hierarchy</label>
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                  {(["sm", "md", "lg"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setFontSize(s)}
                      className={cn(
                        "flex-1 py-1.5 text-xs font-light rounded-lg transition-all",
                        fontSize === s ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-300"
                      )}
                    >
                      {({ sm: "Small", md: "Medium", lg: "Large" })[s]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Functional Section */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-light tracking-widest text-neutral-500 uppercase">Analysis Engine</h3>
            
            <div className="space-y-3">
              <button 
                onClick={() => setDensity(density === "compact" ? "detailed" : "compact")}
                className="flex items-center justify-between w-full p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <LayoutGrid className="h-4 w-4 text-neutral-500 group-hover:text-neutral-300" />
                  <span className="text-sm text-neutral-300 font-light">Ultra-Compact Layout</span>
                </div>
                <div className={cn(
                  "w-8 h-4 rounded-full transition-colors relative",
                  density === "compact" ? "bg-white" : "bg-neutral-700"
                )}>
                  <div className={cn(
                    "absolute top-0.5 bottom-0.5 w-3 rounded-full bg-black transition-all",
                    density === "compact" ? "right-0.5" : "left-0.5"
                  )} />
                </div>
              </button>

              <button 
                onClick={() => setShowConfidence(!showConfidence)}
                className="flex items-center justify-between w-full p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-neutral-500 group-hover:text-neutral-300" />
                  <span className="text-sm text-neutral-300 font-light">Show Statistical Confidence</span>
                </div>
                <div className={cn(
                  "w-8 h-4 rounded-full transition-colors relative",
                  showConfidence ? "bg-white" : "bg-neutral-700"
                )}>
                  <div className={cn(
                    "absolute top-0.5 bottom-0.5 w-3 rounded-full bg-black transition-all",
                    showConfidence ? "right-0.5" : "left-0.5"
                  )} />
                </div>
              </button>
            </div>
          </section>

          {/* Data Section */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-light tracking-widest text-neutral-500 uppercase">Data & Privacy</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={exportHistory}
                className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 text-neutral-300 hover:text-white transition-all"
              >
                <Download className="h-4 w-4" />
                <span className="text-xs font-light">Export History</span>
              </button>
              <button 
                onClick={handleClearAll}
                className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-red-950/20 border border-red-500/10 text-red-400 hover:bg-red-950/40 transition-all"
              >
                <Trash2 className="h-4 w-4" />
                <span className="text-xs font-light text-neutral-400">Clear All</span>
              </button>
            </div>
          </section>
        </div>

        <div className="p-4 bg-black/40 text-center">
          <p className="text-[9px] text-neutral-600 font-light uppercase tracking-widest">
            Privacy First — All data stored locally in your browser
          </p>
        </div>
      </div>
    </div>
  )
}
