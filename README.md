# DeFlow Labs — Documentation Site

> Official documentation for the DeFlow settlement platform. Built with Nuxt 4, Nuxt Content v3, and Nuxt UI v3.

[![Nuxt](https://img.shields.io/badge/Nuxt-4-00DC82?logo=nuxtdotjs&logoColor=white)](https://nuxt.com/)
[![Nuxt Content](https://img.shields.io/badge/Nuxt_Content-v3-00DC82)](https://content.nuxt.com/)
[![Nuxt UI](https://img.shields.io/badge/Nuxt_UI-v3-00DC82)](https://ui.nuxt.com/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000?logo=vercel&logoColor=white)](https://vercel.com/)

**Live:** [docs.deflowlabs.io](https://docs.deflowlabs.io)

## Overview

The documentation site provides comprehensive guides for users, partners, and developers:

- **Getting Started** — Platform overview, account creation, identity verification, walkthrough
- **User Guide** — Trading lifecycle, rewards system, security policies, partner program, FAQ
- **Developer Docs** — API reference and integration guides *(coming soon)*

### Key Features

- 🔍 Full-text search via `UContentSearch` with keyboard shortcut (`⌘K`)
- 🌗 Dark/light mode with "Atmospheric Institutional" design system
- 📊 Interactive Mermaid diagrams with zoom, pan, and fullscreen
- 📱 Fully responsive with mobile hamburger menu
- 📑 Table of contents with scroll-aware highlighting
- ⬅️ ➡️ Previous/Next page navigation via `UContentSurround`

## Tech Stack

| Layer | Technology |
|:------|:-----------|
| Framework | Nuxt 4 (Vue 3) |
| Content | Nuxt Content v3 (Markdown in Git) |
| UI | Nuxt UI v3 (components, typography, search) |
| Styling | Tailwind CSS v4 |
| Diagrams | Mermaid.js (client-side rendering) |
| Deployment | Vercel (fully pre-rendered, static) |

## Getting Started

### Prerequisites

- Node.js ≥ 18

### Setup

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev
```

### Production Build

```bash
# Build with full pre-rendering (all pages)
npm run build
```

## Content Structure

Documentation is authored in Markdown and organized into numbered sections. The numeric prefixes control ordering and are stripped from URLs.

```
content/
├── 0.index.md                              # Welcome page
├── 1.getting-started/
│   ├── 1.what-is-deflow.md
│   ├── 2.creating-your-account.md
│   ├── 3.identity-verification.md
│   └── 4.platform-walkthrough.md
├── 2.user-guide/
│   ├── 1.trading/
│   │   ├── 1.otc-deal-lifecycle.md
│   │   ├── 2.creating-a-deal.md
│   │   ├── 3.escrow-and-funding.md
│   │   └── 4.settlement.md
│   ├── 2.rewards/
│   │   ├── 1.vip-tiers.md
│   │   ├── 2.referral-program.md
│   │   └── 3.ranks-system.md
│   ├── 3.security/
│   │   ├── 1.zero-pii-policy.md
│   │   └── 2.smart-contract-security.md
│   ├── 4.partners/
│   │   ├── 1.partner-program.md
│   │   └── 2.contact.md
│   └── 5.support/
│       ├── 1.faq.md
│       └── 2.glossary.md
└── 3.developer-docs/
    └── index.md                            # Placeholder (Coming Soon)
```

## Custom Components

### MDC Components (used in Markdown)

| Component | Usage |
|:----------|:------|
| `::callout{type}` | Renders a `UAlert` — types: `note`, `tip`, `warning`, `danger` |
| `::step-guide` / `:::step{title n}` | Numbered procedure steps |
| `` ```mermaid `` | Interactive diagrams with zoom/pan/fullscreen |

### Vue Components

| Component | Purpose |
|:----------|:--------|
| `ProsePre` | Intercepts fenced code blocks; renders `mermaid` blocks as diagrams |
| `MermaidDiagram` | Client-side Mermaid renderer with zoom controls and fullscreen |
| `ProseCallout` | Styled alert boxes for documentation callouts |
| `StepGuide` / `Step` | Numbered step-by-step procedure display |

## Architecture

```
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│   Markdown     │────▶│   Nuxt Build   │────▶│   Vercel       │
│   (content/)   │     │   (pre-render) │     │   (static)     │
└────────────────┘     └────────┬───────┘     └────────────────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
              ┌─────▼─────┐ ┌──▼──┐ ┌─────▼─────┐
              │  Nuxt UI  │ │ MDC │ │  Mermaid  │
              │  (search, │ │     │ │  (client) │
              │   nav)    │ │     │ │           │
              └───────────┘ └─────┘ └───────────┘
```

## Adding New Pages

1. Create a Markdown file in the appropriate `content/` directory
2. Add YAML frontmatter with `title` and `description`
3. Use numeric prefixes for ordering (e.g., `5.new-page.md`)
4. The page is automatically indexed, searchable, and pre-rendered

## License

Proprietary © DeFlow Labs
