<!-- BEGIN:stack-agent-rules -->
# Stack: Vite + Express + react-router-dom (migrated off Next.js)

This project was migrated away from Next.js. Do **not** reintroduce Next.js APIs
(`next/*`, `next-intl`, Server Actions, App Router, `revalidatePath`). The stack is:

- **Server**: Express (`server/`), TypeScript ESM run via `tsx`. REST API under
  `/api/*`, raw SQL via `pg` (parameterized — never interpolate), custom JWT auth.
- **Marketing**: Vite SSR app (`apps/marketing`) — `react-router` + React 19 native
  `<title>`/`<meta>` for SEO.
- **Dashboard**: Vite SPA (`apps/dashboard`) — `react-router`, `react-i18next`,
  TanStack Query, custom JWT via `lib/api.ts`.

Key conventions:
- Use `react-router` (v7) for all routing. Import `StaticRouter` from `react-router`
  (no `react-router-dom/server` subpath in v7).
- The dashboard aliases `next/navigation` / `next/link` / etc. to compat shims in
  `apps/dashboard/src/compat/` so legacy components keep working — prefer editing the
  shim over touching every component. (i18n is **not** shimmed: components use
  `react-i18next` directly — next-intl has been removed.)
- New REST endpoints: add a repository in `server/src/db/repositories/`, a router in
  `server/src/routes/`, validate the body with a Zod schema from `validations/`, and
  return the `{ data }` / `{ error }` envelope via `lib/apiResult.ts`.
- See `CLAUDE.md` for full architecture and migration status.
<!-- END:stack-agent-rules -->
