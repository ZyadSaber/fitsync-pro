import path from "node:path";
import fs from "node:fs";
import { pathToFileURL } from "node:url";
import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { env } from "./env.js";

type RenderFn = (url: string) => { html: string };

const MARKETING_ROOT = path.join(env.repoRoot, "apps", "marketing");
// build:marketing emits relative to the Vite root (apps/marketing).
const MARKETING_DIST_CLIENT = path.join(MARKETING_ROOT, "dist", "client");
const MARKETING_DIST_SERVER = path.join(MARKETING_ROOT, "dist", "server");
// dashboard vite.config sets an absolute build.outDir of <repo>/dist/dashboard.
const DASHBOARD_DIST = path.join(env.repoRoot, "dist", "dashboard");

/** The dashboard SPA is mounted under this base path; marketing owns everything else. */
const DASHBOARD_BASE = "/application";
const isDashboard = (url: string) => {
  const p = url.split("?")[0];
  return p === DASHBOARD_BASE || p.startsWith(`${DASHBOARD_BASE}/`);
};

/**
 * Wires marketing SSR + dashboard static serving onto the Express app.
 * Must be called AFTER the /api routes are mounted and BEFORE the error handler.
 */
export async function setupSsr(app: Express) {
  if (env.isProd) {
    await setupProd(app);
  } else {
    await setupDev(app);
  }
}

// ── Development: Vite middleware mode, on-the-fly SSR ────────────────────────
async function setupDev(app: Express) {
  const { createServer } = await import("vite");
  const vite = await createServer({
    configFile: path.join(MARKETING_ROOT, "vite.config.ts"),
    root: MARKETING_ROOT,
    server: { middlewareMode: true },
    appType: "custom",
  });

  app.use(vite.middlewares);

  app.use("*", async (req: Request, res: Response, next: NextFunction) => {
    const url = req.originalUrl;
    try {
      const template = await vite.transformIndexHtml(
        url,
        fs.readFileSync(path.join(MARKETING_ROOT, "index.html"), "utf-8")
      );
      const { render } = (await vite.ssrLoadModule("/src/entry-server.tsx")) as { render: RenderFn };
      const { html } = render(url);
      res
        .status(200)
        .type("html")
        .send(template.replace("<!--app-html-->", html));
    } catch (err) {
      vite.ssrFixStacktrace(err as Error);
      next(err);
    }
  });
}

// ── Production: serve built bundles ─────────────────────────────────────────
async function setupProd(app: Express) {
  // Dashboard SPA static assets, served under /app (matches Vite `base: "/app/"`).
  app.use(DASHBOARD_BASE, express.static(DASHBOARD_DIST, { index: false }));
  // Marketing client assets (JS/CSS hashed under /assets) at the root.
  app.use(express.static(MARKETING_DIST_CLIENT, { index: false }));

  const template = fs.readFileSync(path.join(MARKETING_DIST_CLIENT, "index.html"), "utf-8");
  const { render } = (await import(
    pathToFileURL(path.join(MARKETING_DIST_SERVER, "entry-server.js")).href
  )) as { render: RenderFn };

  app.use("*", (req: Request, res: Response) => {
    const url = req.originalUrl;
    // Any /app/* route falls through to the dashboard SPA shell (client routing).
    if (isDashboard(url)) {
      return res.sendFile(path.join(DASHBOARD_DIST, "index.html"));
    }
    // Everything else is rendered by the marketing SSR app (incl. its 404).
    const { html } = render(url);
    return res
      .status(200)
      .type("html")
      .send(template.replace("<!--app-html-->", html));
  });
}
