# AGENTS.md — Laundry Project

## About

This project is a SaaS software platform designed for large-scale laundry service businesses, utilizing RFID and AI technologies to enhance operational efficiency and enable end-to-end, transparent tracking.

## Stack (verified from config)
- **Vite 8** + **React 19** + **TypeScript 6** + **Tailwind CSS 4**
- **Yarn Berry (v4)** — use `yarn` not `npm`/`pnpm`
- **react-router-dom v7** — `BrowserRouter` wired in `src/main.tsx`
- **Tailwind v4**: uses `@tailwindcss/vite` plugin; no PostCSS config needed — CSS entry is `@import "tailwindcss"` in `src/index.css`
- **shadcn MCP** configured via `opencode.json` — install components with `npx shadcn@latest add <name>`

## Commands
| Command | Action |
|---------|--------|
| `yarn dev` | Start Vite dev server |
| `yarn build` | `tsc -b && vite build` (typecheck then bundle) |
| `yarn lint` | ESLint v10 flat config (`eslint.config.js`) |
| `yarn preview` | Preview production build |

No test framework, no CI, no pre-commit hooks.


