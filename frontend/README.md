# Infodote Frontend

**Your Digital Immunity** - An AI-powered claim analysis and fact-checking tool built for UniHack 2026.

## Overview

Infodote helps users analyze claims, detect misinformation techniques, and build digital literacy through AI-powered fact-checking. The "Antidote" metaphor promotes digital immunity against misinformation.

## Quick Start

### Prerequisites

- Node.js 18.17 or later
- pnpm (recommended), npm, or yarn

### Installation

**The easiest way** to get started is to use the provided setup script, which automatically checks your environment, installs `pnpm` globally if necessary, and installs all frontend dependencies:

```bash
# Clone the repository
git clone https://github.com/LeeJieHeng/v0-infodote-frontend-plan.git
cd v0-infodote-frontend-plan

# Run the automated setup script
chmod +x setup.sh
./setup.sh

# Start the development server
cd frontend
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Create production build
npm build

# Start production server
npm start
```

## Project Structure

```
infodote-frontend/
├── app/
│   ├── globals.css          # Theme and design tokens
│   ├── layout.tsx           # Root layout with metadata
│   └── page.tsx             # Main application page
├── components/
│   ├── analysis-result.tsx  # Full analysis display
│   ├── claim-input.tsx      # Claim text input
│   ├── example-chips.tsx    # Quick-select demo claims
│   ├── source-card.tsx      # Source display card
│   ├── technique-pill.tsx   # Technique indicator
│   ├── verdict-badge.tsx    # Verdict display (True/False/Misleading)
│   └── ui/                  # shadcn/ui base components
├── lib/
│   ├── api.ts               # API layer (mock data for now)
│   └── utils.ts             # Utility functions
└── public/                  # Static assets
```

## Tech Stack

| Technology | Version |
|------------|---------|
| Next.js | 16.1.6 |
| React | 19.2.4 |
| Tailwind CSS | 4.2.0 |
| TypeScript | 5.7.3 |
| shadcn/ui | Latest |
| Lucide React | 0.564.0 |

## Features

- **Claim Input** - Submit any claim for analysis
- **Verdict Badges** - Visual indicators (True, False, Misleading, Unverified)
- **Technique Detection** - Identifies misinformation techniques used
- **Literacy Lessons** - Educational content for digital immunity
- **Source Matching** - Displays verified sources with relevance scores
- **Example Claims** - Quick-select chips for demo purposes

## Backend Integration

The frontend currently uses mock data in `lib/api.ts`. To connect to your FastAPI backend:

1. Open `lib/api.ts`
2. Uncomment the fetch call in the `analyzeClaim` function
3. Point it to your backend API endpoint
4. Ensure your backend returns the `AnalysisData` interface format

See `DOCUMENTATION.md` for detailed integration instructions.

## Documentation

For complete technical documentation including:
- Component API reference
- Type definitions
- Theming guide
- Backend integration steps

See [DOCUMENTATION.md](./DOCUMENTATION.md)

## Built with v0

This repository is linked to [v0](https://v0.app). Continue developing:

[Continue working on v0](https://v0.app/chat/projects/prj_B5dpQ6lp2osKYInOacjqePo0ucYW)

## License

MIT - UniHack 2026 Project
