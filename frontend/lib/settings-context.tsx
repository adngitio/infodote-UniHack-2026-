"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { clearCache } from "@/lib/api"

type Theme = "black" | "slate" | "warm" | "light"
type FontSize = "sm" | "md" | "lg"
type Density = "compact" | "detailed"

interface SettingsContextValue {
  theme: Theme
  setTheme: (t: Theme) => void
  fontSize: FontSize
  setFontSize: (s: FontSize) => void
  density: Density
  setDensity: (d: Density) => void
  showConfidence: boolean
  setShowConfidence: (v: boolean) => void
  autoScroll: boolean
  setAutoScroll: (v: boolean) => void
  clearAllData: () => void
  clearCount: number
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

const SETTINGS_KEY = "infodote_settings"

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("black")
  const [fontSize, setFontSizeState] = useState<FontSize>("md")
  const [density, setDensityState] = useState<Density>("detailed")
  const [showConfidence, setShowConfidenceState] = useState(true)
  const [autoScroll, setAutoScrollState] = useState(true)
  const [clearCount, setClearCount] = useState(0)

  useEffect(() => {
    const saved = load(SETTINGS_KEY, {} as Partial<SettingsContextValue>)
    if (saved.theme) setThemeState(saved.theme as Theme)
    if (saved.fontSize) setFontSizeState(saved.fontSize as FontSize)
    if (saved.density) setDensityState(saved.density as Density)
    if (saved.showConfidence !== undefined) setShowConfidenceState(saved.showConfidence as boolean)
    if (saved.autoScroll !== undefined) setAutoScrollState(saved.autoScroll as boolean)
  }, [])

  // Apply theme and font size to document root so whole app (and rem-based text) scales
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute("data-theme", theme)
    root.setAttribute("data-font", fontSize)
  }, [theme, fontSize])

  function persist(patch: Partial<SettingsContextValue>) {
    try {
      const current = load(SETTINGS_KEY, {} as Record<string, unknown>)
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...current, ...patch }))
    } catch {}
  }

  const setTheme = (t: Theme) => { setThemeState(t); persist({ theme: t }) }
  const setFontSize = (s: FontSize) => { setFontSizeState(s); persist({ fontSize: s }) }
  const setDensity = (d: Density) => { setDensityState(d); persist({ density: d }) }
  const setShowConfidence = (v: boolean) => { setShowConfidenceState(v); persist({ showConfidence: v }) }
  const setAutoScroll = (v: boolean) => { setAutoScrollState(v); persist({ autoScroll: v }) }

  const clearAllData = () => {
    localStorage.removeItem(SETTINGS_KEY)
    localStorage.removeItem("infodote_history")
    setThemeState("black")
    setFontSizeState("md")
    setDensityState("detailed")
    setShowConfidenceState(true)
    setAutoScrollState(true)
    clearCache()
    setClearCount(c => c + 1)
  }

  return (
    <SettingsContext.Provider value={{
      theme, setTheme,
      fontSize, setFontSize,
      density, setDensity,
      showConfidence, setShowConfidence,
      autoScroll, setAutoScroll,
      clearAllData,
      clearCount,
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider")
  return ctx
}