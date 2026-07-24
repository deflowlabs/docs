# DeFlow Labs — Documentation Site

Official documentation for the DeFlow settlement platform.

## Tech Stack

- **Framework:** Nuxt 4 (Vue 3)
- **Content:** Nuxt Content v3 (Markdown in Git)
- **Editor:** Nuxt Studio (visual content editing)
- **Styling:** Tailwind CSS v4
- **Fonts:** Geist + Geist Mono via `@nuxt/fonts`
- **Deployment:** Vercel (ISR)

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Content Structure

All documentation content is stored as Markdown files in the `content/` directory:

```
content/
├── index.md                     # Home page
├── 1.getting-started/           # Account setup, verification, walkthrough
├── 2.trading/                   # Deal lifecycle, escrow, settlement
├── 3.rewards/                   # VIP tiers, referrals, ranks
├── 4.security/                  # Zero-PII, smart contract security
├── 5.partners/                  # Partner program, contact
└── 6.support/                   # FAQ, glossary
```

## Adding Content

1. Create a new `.md` file in the appropriate `content/` subdirectory
2. Add frontmatter with `title` and `description`
3. Write content using standard Markdown
4. Use MDC components for callouts and step guides:

```md
::callout{type="tip"}
Your content here.
::

::step-guide
:::step{title="Step Title" n="1"}
Step content.
:::
::
```

## Nuxt Studio

In development, a floating button appears to open the visual editor. For production, configure the `studio` section in `nuxt.config.ts` with your GitHub repository details.

## License

Proprietary © DeFlow Labs
