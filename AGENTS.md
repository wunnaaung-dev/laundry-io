# AGENTS.md — Laundry Project

## About

This project is a SaaS software platform designed for large-scale laundry service businesses, utilizing RFID and AI technologies to enhance operational efficiency and enable end-to-end, transparent tracking.

## Stack (verified from config)
- **Vite 8** + **React 19** + **TypeScript 6** + **Tailwind CSS 4**
- **Yarn Berry (v4)** — use `yarn` not `npm`/`pnpm`
- **react-router-dom v7** — `BrowserRouter` wired in `src/main.tsx`
- **Tailwind v4**: uses `@tailwindcss/vite` plugin; no PostCSS config needed — CSS entry is `@import "tailwindcss"` in `src/index.css`
- **shadcn MCP** configured via `opencode.json` — install components with `npx shadcn@latest add <name>`
- **Data** Use in zustand global store (no backend)

## Commands
| Command | Action |
|---------|--------|
| `yarn dev` | Start Vite dev server |
| `yarn build` | `tsc -b && vite build` (typecheck then bundle) |
| `yarn lint` | ESLint v10 flat config (`eslint.config.js`) |
| `yarn preview` | Preview production build |

No test framework, no CI, no pre-commit hooks.

## Component Rules

- **Always use shadcn/ui for components.** Whenever a UI component is needed (button, form, dialog, table, card, dashboard widget, page section, etc.), check the shadcn/ui registry first via the shadcn MCP before writing anything custom. Install with `npx shadcn@latest add <name>` rather than copy-pasting or hand-rolling markup. Only fall back to a custom build — on top of shadcn/Radix primitives — if no matching component or block exists in the registry.
- **One component per file.** Each React component must live in its own file, named after the component (e.g. `VehicleAssignmentForm.tsx` exports only `VehicleAssignmentForm`). Do not define multiple components in a single file, including small subcomponents — extract them into their own files even if only used locally. Barrel files (`index.ts`) may re-export for convenient imports but should not contain component logic.