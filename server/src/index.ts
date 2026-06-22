import express from "express";
import cookieParser from "cookie-parser";
import compression from "compression";
import { env } from "./env.js";
import { errorMiddleware, ok } from "./lib/apiResult.js";
import { authRouter } from "./routes/auth.js";
import { gymsRouter } from "./routes/gyms.js";
import { coachesRouter } from "./routes/coaches.js";
import { subscriptionsRouter } from "./routes/subscriptions.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { activityRouter } from "./routes/activity.js";
import { setupSsr } from "./ssr.js";

async function createServer() {
  const app = express();
  app.use(compression());
  app.use(express.json());
  app.use(cookieParser());

  // ── REST API ──────────────────────────────────────────────────────────────
  const api = express.Router();
  api.get("/health", (_req, res) => ok(res, { status: "ok", ts: Date.now() }));
  api.use("/auth", authRouter);
  api.use("/gyms", gymsRouter);
  api.use("/coaches", coachesRouter);
  api.use("/subscriptions", subscriptionsRouter);
  api.use("/admin", dashboardRouter);
  api.use("/activity", activityRouter);
  app.use("/api", api);

  // ── Marketing SSR (apps/marketing) + dashboard SPA static ───────────────────
  await setupSsr(app);

  // Error handler must be last.
  app.use(errorMiddleware);

  app.listen(env.port, () => {
    console.log(`[server] listening on http://localhost:${env.port} (${env.nodeEnv})`);
  });
}

createServer().catch((err) => {
  console.error("[server] failed to start:", err);
  process.exit(1);
});
