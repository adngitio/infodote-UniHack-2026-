import type { AnalysisData } from "@/components/analysis-result"

// Use same-origin proxy when no env set so the browser doesn't call localhost:8000 directly
const API_BASE =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : ""

interface BackendAnalysisResponse {
  claim: string
  verdict: string
  technique: string
  explanation: string
  literacy_lesson: string
  reasoning: string
  bias_score?: number
  soundness_score?: number
  provocation_score?: number
  sources: Array<{
    claim: string
    source: string
    url: string
    similarity_score?: number
    bias_score?: number
  }>
}

interface BackendErrorResponse {
  error?: string
  detail?: string | Array<{ msg: string }>
}

function normalizeVerdict(verdict: string): AnalysisData["verdict"] {
  const v = verdict.toLowerCase()
  if (v === "true" || v === "false" || v === "misleading" || v === "unverified")
    return v
  return "unverified"
}

const cache = new Map<string, AnalysisData>()

export function getCached(claim: string): AnalysisData | null {
  return cache.get(claim.trim().toLowerCase()) ?? null
}

export async function clearCache(): Promise<void> {
  cache.clear()
  try {
    const url = API_BASE ? `${API_BASE}/clear-cache` : "/api/clear-cache"
    await fetch(url, { method: "POST" })
  } catch {}
}

export async function analyzeClaim(claim: string): Promise<AnalysisData> {
  let response: Response
  try {
    const url = API_BASE ? `${API_BASE}/analyse` : "/api/analyse"
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ claim }),
    })
  } catch (e) {
    const msg =
      e instanceof TypeError && e.message === "Failed to fetch"
        ? "Could not reach the API. Is the backend running? (e.g. `cd backend && python3 -m uvicorn main:app --reload --port 8000`)"
        : e instanceof Error
          ? e.message
          : "Network error"
    throw new Error(msg)
  }

  const body = (await response.json().catch(() => ({}))) as
    | BackendAnalysisResponse
    | BackendErrorResponse

  if (!response.ok) {
    const err =
      "error" in body && typeof body.error === "string"
        ? body.error
        : "detail" in body && typeof body.detail === "string"
          ? body.detail
          : `Request failed (${response.status})`
    throw new Error(err)
  }

  if ("error" in body && body.error) {
    throw new Error(body.error)
  }

  const data = body as BackendAnalysisResponse

  const result: AnalysisData = {
    verdict: normalizeVerdict(data.verdict),
    technique: data.technique ?? "Unknown",
    explanation: data.explanation ?? "",
    literacyLesson: data.literacy_lesson ?? "",
    biasScore: data.bias_score ?? 0,
    soundnessScore: data.soundness_score ?? 0,
    provocationScore: data.provocation_score ?? 0,
    matchedSources: (data.sources ?? []).map((s) => ({
      title: s.source,
      url: s.url,
      snippet: s.claim,
      relevanceScore: s.similarity_score ?? 0,
      biasScore: s.bias_score ?? 50,
    })),
  }
  cache.set(claim.trim().toLowerCase(), result)
  return result
}
