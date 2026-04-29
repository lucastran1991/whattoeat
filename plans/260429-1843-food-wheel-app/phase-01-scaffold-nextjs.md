# Phase 01 — Scaffold Next.js + Tailwind

## Context Links
- [plan.md](./plan.md)
- [brainstorm report](../reports/brainstorm-260429-1843-food-wheel-app.md)

## Overview
- **Priority:** P0 (blocks everything)
- **Status:** completed
- **Description:** Initialize Next.js 15 project with TypeScript + Tailwind in repo root. Install `react-custom-roulette`. Verify dev server runs.
- **Completion notes:** Scaffold created, Next.js 15 + Tailwind 4 + react-custom-roulette installed, dev server and build verified.

## Key Insights
- Repo currently has only `.git`, `.gitignore`, `README.md` — fresh slate
- Use `create-next-app` with App Router + TS + Tailwind preset (no src/app drift)
- Use `pnpm` (preferred) or `npm` — match user's environment

## Requirements
**Functional**
- `pnpm dev` (or `npm run dev`) serves Next.js on localhost:3000
- Tailwind classes work in default `app/page.tsx`
- TypeScript strict mode enabled

**Non-functional**
- Project root = repo root (no nested folder)
- Node ≥ 18.18 (Next 15 requirement)

## Architecture
Standard Next.js App Router skeleton:
```
/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── public/
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── tailwind.config.ts
├── package.json
└── README.md
```

## Related Code Files
**Create (via create-next-app)**
- All scaffold files above

**Modify**
- `README.md` — replace placeholder with project description

## Implementation Steps
1. From repo root, run: `pnpm dlx create-next-app@latest . --typescript --tailwind --app --eslint --no-src-dir --import-alias "@/*"`
   - When prompted about non-empty dir, accept (only `.git`, `.gitignore`, `README.md`)
2. Install wheel lib: `pnpm add react-custom-roulette`
3. Run `pnpm dev`, verify localhost:3000 renders default Next.js page
4. Run `pnpm build` to confirm compile succeeds
5. Update `README.md` with project name + brief description + run instructions
6. Commit: `chore: scaffold next.js + tailwind + react-custom-roulette`

## Todo List
- [x] Run create-next-app in repo root
- [x] Install `react-custom-roulette`
- [x] Verify `pnpm dev` works
- [x] Verify `pnpm build` works
- [x] Update README.md
- [x] Commit scaffold

## Success Criteria
- `pnpm dev` shows default Next.js page on localhost:3000
- `pnpm build` exits 0
- `package.json` contains: `next@^15`, `react@^19`, `tailwindcss@^3` or `^4`, `react-custom-roulette`
- TypeScript strict mode on in `tsconfig.json`

## Risk Assessment
| Risk | Mitigation |
|---|---|
| `react-custom-roulette` peer dep mismatch with React 19 | If install fails, pin React 18 in package.json or use `--legacy-peer-deps` |
| Tailwind v4 (alpha at scaffold time) breaks classes | Fall back to Tailwind v3 if issues |
| create-next-app refuses non-empty dir | Use `--force` or temp-move conflicting files |

## Security Considerations
- No secrets at this phase
- `.gitignore` already ignores `node_modules`, `.next`, `.env*`

## Next Steps
- Phase 02: Add dish data + types
