# Infodote Frontend Documentation

Complete technical documentation for the Infodote frontend application.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Component Reference](#component-reference)
4. [API Integration](#api-integration)
5. [Theming](#theming)
6. [Type Definitions](#type-definitions)
7. [Future Backend Integration](#future-backend-integration)

---

## Overview

Infodote is a claim analysis tool that uses the "Antidote" metaphor to promote digital immunity and literacy. Users can submit claims (e.g., "5G towers cause health problems") and receive:

- **Verdict**: True, False, Misleading, or Unverified
- **Technique Detection**: Identifies misinformation techniques used
- **Explanation**: Detailed analysis of why the claim is rated as such
- **Literacy Lesson**: Educational content to build critical thinking skills
- **Matched Sources**: Verified sources with relevance scores

---

## Architecture

### Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js | 16.1.6 |
| React | React | 19.2.4 |
| Styling | Tailwind CSS | 4.2.0 |
| UI Components | shadcn/ui + Radix UI | Latest |
| Icons | Lucide React | 0.564.0 |
| Language | TypeScript | 5.7.3 |

### File Structure

```
/vercel/share/v0-project/
├── app/
│   ├── globals.css          # Design tokens and theme configuration
│   ├── layout.tsx           # Root layout, metadata, fonts
│   └── page.tsx             # Main application entry point
├── components/
│   ├── analysis-result.tsx  # Complete analysis display component
│   ├── claim-input.tsx      # User input form component
│   ├── example-chips.tsx    # Example claim selector
│   ├── source-card.tsx      # Individual source display
│   ├── technique-pill.tsx   # Technique badge component
│   ├── verdict-badge.tsx    # Verdict indicator component
│   └── ui/                  # shadcn/ui base components
├── lib/
│   ├── api.ts               # API layer (mock + real integration)
│   └── utils.ts             # Utility functions (cn helper)
└── public/                  # Static assets
```

### Data Flow

```
User Input → ClaimInput → page.tsx (state) → analyzeClaim() → API
                                                              ↓
UI Update ← AnalysisResult ← page.tsx (state) ← AnalysisData response
```

---

## Component Reference

### 1. VerdictBadge

**File**: `components/verdict-badge.tsx`

Displays the verdict of a claim analysis with appropriate styling and icons.

**Props**:
```typescript
interface VerdictBadgeProps {
  verdict: VerdictType  // "true" | "false" | "misleading" | "unverified"
  className?: string
}
```

**Usage**:
```tsx
<VerdictBadge verdict="false" />
<VerdictBadge verdict="misleading" className="mt-2" />
```

**Verdict Configurations**:
| Verdict | Label | Icon | Color |
|---------|-------|------|-------|
| true | Verified True | CheckCircle2 | Primary (teal) |
| false | False | XCircle | Destructive (red) |
| misleading | Misleading | AlertTriangle | Warning (amber) |
| unverified | Unverified | HelpCircle | Muted (gray) |

---

### 2. TechniquePill

**File**: `components/technique-pill.tsx`

Displays the detected misinformation technique.

**Props**:
```typescript
interface TechniquePillProps {
  technique: string    // e.g., "False Causation", "Cherry Picking"
  className?: string
}
```

**Usage**:
```tsx
<TechniquePill technique="False Causation" />
```

**Supported Techniques** (examples):
- False Causation
- Cherry Picking
- Appeal to Authority
- Anecdotal Evidence
- Straw Man
- Conspiracy Theory
- Science Denial

---

### 3. SourceCard

**File**: `components/source-card.tsx`

Displays a matched source with metadata and relevance score.

**Props**:
```typescript
interface SourceCardProps {
  title: string           // Source title
  url: string             // Full URL to source
  snippet: string         // Relevant text excerpt
  relevanceScore: number  // 0-1 score (displayed as percentage)
  className?: string
}
```

**Usage**:
```tsx
<SourceCard
  title="NASA Climate Evidence"
  url="https://climate.nasa.gov/evidence"
  snippet="NASA presents multiple independent lines of evidence..."
  relevanceScore={0.98}
/>
```

**Features**:
- Extracts and displays domain name
- Shows relevance score as percentage badge
- External link icon with hover states
- Opens in new tab with security attributes

---

### 4. ClaimInput

**File**: `components/claim-input.tsx`

Text area with submit button for entering claims.

**Props**:
```typescript
interface ClaimInputProps {
  onSubmit: (claim: string) => void  // Callback with claim text
  isLoading?: boolean                 // Disables input during analysis
  className?: string
}
```

**Usage**:
```tsx
<ClaimInput 
  onSubmit={handleAnalyze} 
  isLoading={isAnalyzing} 
/>
```

**Features**:
- Multi-line textarea with placeholder
- Submit button with loading state
- Disabled state during analysis
- "Powered by AI" indicator

---

### 5. ExampleChips

**File**: `components/example-chips.tsx`

Quick-select chips for example claims (useful for demos).

**Props**:
```typescript
interface ExampleChipsProps {
  onSelect: (claim: string) => void  // Callback with selected claim
  className?: string
}
```

**Usage**:
```tsx
<ExampleChips onSelect={handleAnalyze} />
```

**Default Example Claims**:
1. "5G towers cause health problems"
2. "Vaccines contain microchips"
3. "Climate change is a hoax"
4. "The moon landing was faked"
5. "Drinking lemon water cures cancer"
6. "Earth is flat"

---

### 6. AnalysisResult

**File**: `components/analysis-result.tsx`

Comprehensive display of analysis results including verdict, technique, explanation, literacy lesson, and sources.

**Props**:
```typescript
interface AnalysisResultProps {
  data: AnalysisData  // Full analysis response
  claim: string       // Original claim text
  className?: string
}
```

**Usage**:
```tsx
<AnalysisResult 
  data={analysisResponse} 
  claim="5G towers cause health problems" 
/>
```

**Sections Rendered**:
1. **Claim Analyzed** - Shows the original claim in quotes
2. **Verdict + Technique** - VerdictBadge and TechniquePill side by side
3. **Explanation** - Detailed analysis text
4. **Digital Immunity Lesson** - Educational content (highlighted card)
5. **Verified Sources** - List of SourceCard components

---

## API Integration

### Current Mock Implementation

**File**: `lib/api.ts`

The API layer currently uses mock data with simulated network delay for frontend development.

```typescript
// Main export function
export async function analyzeClaim(claim: string): Promise<AnalysisData>
```

**Mock Response Delay**: 1.5-3 seconds (randomized)

**Specific Mock Responses**:
| Claim Contains | Verdict | Technique |
|----------------|---------|-----------|
| "vaccines contain microchips" | false | Conspiracy Theory |
| "climate change is a hoax" | false | Science Denial |
| (default) | random | random |

### API Response Interface

```typescript
interface AnalysisData {
  verdict: "true" | "false" | "misleading" | "unverified"
  technique: string
  explanation: string
  literacyLesson: string
  matchedSources: Array<{
    title: string
    url: string
    snippet: string
    relevanceScore: number  // 0.0 to 1.0
  }>
}
```

---

## Theming

### Design Tokens

**File**: `app/globals.css`

The theme uses OKLCH color space for consistent, perceptually uniform colors.

**Core Color Palette**:
| Token | Description | OKLCH Value |
|-------|-------------|-------------|
| `--background` | Page background | `oklch(0.12 0.01 260)` |
| `--foreground` | Primary text | `oklch(0.98 0 0)` |
| `--primary` | Brand color (teal) | `oklch(0.72 0.19 160)` |
| `--destructive` | Error/False (red) | `oklch(0.65 0.25 25)` |
| `--warning` | Warning/Misleading (amber) | `oklch(0.75 0.18 85)` |
| `--info` | Info/Technique (blue) | `oklch(0.60 0.15 240)` |
| `--success` | Success/True (teal) | `oklch(0.72 0.19 160)` |

**Custom Infodote Tokens**:
```css
--success: oklch(0.72 0.19 160);
--success-foreground: oklch(0.12 0.01 260);
--warning: oklch(0.75 0.18 85);
--warning-foreground: oklch(0.12 0.01 260);
--info: oklch(0.60 0.15 240);
--info-foreground: oklch(0.98 0 0);
```

---

## Type Definitions

### VerdictType

```typescript
type VerdictType = "true" | "false" | "misleading" | "unverified"
```

### AnalysisData

```typescript
interface AnalysisData {
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
```

### Component Props Summary

| Component | Required Props | Optional Props |
|-----------|---------------|----------------|
| VerdictBadge | `verdict` | `className` |
| TechniquePill | `technique` | `className` |
| SourceCard | `title`, `url`, `snippet`, `relevanceScore` | `className` |
| ClaimInput | `onSubmit` | `isLoading`, `className` |
| ExampleChips | `onSelect` | `className` |
| AnalysisResult | `data`, `claim` | `className` |

---

## Future Backend Integration

### Step 1: Update API Function

Replace the mock implementation in `lib/api.ts`:

```typescript
export async function analyzeClaim(claim: string): Promise<AnalysisData> {
  const response = await fetch('/api/analyse', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({ claim }),
  })
  
  if (!response.ok) {
    throw new Error('Analysis failed')
  }
  
  return response.json()
}
```

### Step 2: Add Next.js API Route (Optional Proxy)

If you need to proxy requests to your FastAPI backend, create `app/api/analyse/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  const response = await fetch(`${BACKEND_URL}/analyse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  
  const data = await response.json()
  return NextResponse.json(data)
}
```

### Step 3: Environment Variables

Add to `.env.local`:
```
BACKEND_URL=http://localhost:8000
```

### Expected Backend Response Format

Your FastAPI backend should return:

```json
{
  "verdict": "false",
  "technique": "Conspiracy Theory",
  "explanation": "This claim is demonstrably false...",
  "literacyLesson": "Be skeptical of claims involving...",
  "matchedSources": [
    {
      "title": "Vaccine Ingredients and Manufacturing",
      "url": "https://www.cdc.gov/vaccines/ingredients",
      "snippet": "The CDC provides complete ingredient lists...",
      "relevanceScore": 0.97
    }
  ]
}
```

---

## Development Commands

```bash
# Development server
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

---

## Troubleshooting

### Component not rendering correctly

1. Ensure all imports are correct
2. Check that the `AnalysisData` interface matches your backend response
3. Verify Tailwind classes are being processed

### Styling issues

1. Check `globals.css` for custom token definitions
2. Ensure the theme variables are properly defined
3. Verify the `cn()` utility is being used for conditional classes

### API connection errors

1. Check CORS settings on your backend
2. Verify the API URL is correct
3. Ensure the response format matches `AnalysisData` interface

---

*Documentation generated for Infodote Frontend - UniHack 2026*
