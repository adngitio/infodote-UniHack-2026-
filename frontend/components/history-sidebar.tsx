"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Settings } from "lucide-react"
import { SettingsPanel } from "./settings-panel"

export interface HistoryItem {
  id: string
  claim: string
  verdict: string
  timestamp: string   // ISO string for localStorage serialisation
}

interface HistorySidebarProps {
  history: HistoryItem[]
  onSelect: (item: HistoryItem) => void
  onClearHistory: () => void
  collapsed: boolean
  onToggle: () => void
  activeId?: string
  className?: string
}

function verdictDot(verdict: string) {
  switch (verdict.toLowerCase()) {
    case "true":        return "bg-white"
    case "false":       return "bg-neutral-400"
    case "misleading":  return "bg-neutral-300"
    default:            return "bg-neutral-600"
  }
}

export function HistorySidebar({
  history, onSelect, onClearHistory,
  collapsed, onToggle,
  activeId, className
}: HistorySidebarProps) {
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <>
      <aside
        className={cn(
          "hidden lg:flex flex-col h-[calc(100vh-56px)] sticky top-14 shrink-0 border-r border-white/5 transition-all duration-300 ease-in-out overflow-hidden z-40 bg-black/40 backdrop-blur-sm",
          collapsed ? "w-14" : "w-60",
          className
        )}
      >
        {/* Expanded content */}
        {!collapsed && (
          <div className="flex flex-col flex-1 px-3 py-4 min-h-0">
            {/* Label */}
            <p className="px-1 mb-2 text-xs font-light tracking-widest text-neutral-500 uppercase">
              Past Claims
            </p>

            {/* History list - suppressHydrationWarning: client may add inline styles (scrollbar/extension) */}
            <nav
              className="flex flex-col gap-0.5 flex-1 overflow-y-auto min-h-0 pr-0.5 custom-scrollbar"
              suppressHydrationWarning
            >
              {history.length === 0 && (
                <p className="text-sm text-neutral-700 font-light px-2 py-4 text-center">
                  No analyses yet.<br />Submit a claim to begin.
                </p>
              )}
              {history.map(item => (
                <button
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className={cn(
                    "group text-left px-3 py-2.5 rounded-xl border transition-all",
                    activeId === item.id
                      ? "bg-white/10 border-white/20"
                      : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/10"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <span className={cn("mt-[5px] h-1.5 w-1.5 rounded-full shrink-0", verdictDot(item.verdict))} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] text-white font-light line-clamp-2 leading-relaxed">
                        {item.claim}
                      </p>
                      <p className="mt-0.5 text-[11px] text-neutral-600 font-light">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </nav>

            {/* Settings at bottom */}
            <div className="mt-4 pt-3 border-t border-white/5">
              <button
                onClick={() => setSettingsOpen(true)}
                className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-neutral-500 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all font-light"
              >
                <Settings className="h-4 w-4 shrink-0" />
                <span className="text-sm">Settings</span>
              </button>
            </div>
          </div>
        )}

        {/* Collapsed: only settings icon */}
        {collapsed && (
          <div className="flex flex-col items-center py-4 flex-1">
            <div className="flex-1" />
            <button
              onClick={() => setSettingsOpen(true)}
              className="flex items-center justify-center h-8 w-8 rounded-lg text-neutral-600 hover:text-neutral-300 hover:bg-white/5 transition-all"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        )}
      </aside>

      {settingsOpen && (
        <SettingsPanel
          onClose={() => setSettingsOpen(false)}
          history={history}
          onClearHistory={onClearHistory}
        />
      )}
    </>
  )
}
