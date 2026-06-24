import type { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodError, type ZodSchema } from "zod";

/**
 * A typed error that carries an HTTP status. Throw it anywhere inside a route
 * handler and the central error middleware will turn it into a JSON response.
 */
export class AppError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "AppError";
  }
}

export const badRequest = (msg: string) => new AppError(400, msg);
export const unauthorized = (msg = "Unauthenticated") => new AppError(401, msg);
export const forbidden = (msg = "Forbidden") => new AppError(403, msg);
export const notFound = (msg = "Not found") => new AppError(404, msg);

/** Standard success envelope. */
export function ok<T>(res: Response, data: T, status = 200) {
  return res.status(status).json({ data });
}

/**
 * Wrap an async route handler so thrown errors flow to the error middleware
 * instead of crashing the process (Express 4 does not await handlers).
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Pull the named keys off `req.query`, returning each as a trimmed string.
 * Empty, missing, or non-string (e.g. repeated/array) values become `undefined`,
 * so endpoints get a clean `Partial<Record<K, string>>` to spread into filters.
 *
 *   const { search, plan, status } = queryParams(req, "search", "plan", "status");
 */
export function queryParams<const K extends string>(
  req: Request,
  ...keys: K[]
): Partial<Record<K, string>> {
  const out: Partial<Record<K, string>> = {};
  for (const key of keys) {
    const v = req.query[key];
    if (typeof v === "string" && v.trim()) out[key] = v.trim();
  }
  return out;
}

/**
 * Validate `req.body` with a Zod schema, returning typed data or throwing a 400.
 */
export function parseBody<T>(schema: ZodSchema<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw badRequest(result.error.issues[0]?.message ?? "Invalid request body");
  }
  return result.data;
}

/** Central Express error handler — register last. */
export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err instanceof ZodError) {
    return res.status(400).json({ error: err.issues[0]?.message ?? "Invalid input" });
  }
  console.error("[unhandled error]", err);
  const message = err instanceof Error ? err.message : "Internal server error";
  return res.status(500).json({ error: message });
}
