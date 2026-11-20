/**
 * Central API error handling — RR-05 redo (2026-10-10).
 *
 * Why this exists. The original handlers did
 *   `catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }`
 * which echoed raw internal detail to the client: Prisma validation
 * dumps include model names, field names and the submitted input;
 * other errors can carry hostnames, file paths or query fragments.
 *
 * The first sanitisation pass replaced the message but was a blind
 * replacement: every failure became a 500, and the raw error object
 * was still logged. This module does it properly:
 *
 *   1. CLASSIFICATION — validation, authorisation, missing-resource,
 *      conflict and server errors receive the correct status code and
 *      a safe, generic client message. Handler-authored `ApiError`
 *      instances pass through with their own status and message.
 *   2. REDACTED DIAGNOSTICS — the server log line carries a request
 *      reference, route, method, error class and, for Prisma errors,
 *      the stable error CODE (e.g. "P2025" — an enum value, not free
 *      text). The raw message, stack trace and query are never logged:
 *      they can contain personal data, SQL or secrets.
 *   3. REQUEST REFERENCE — every error response carries a short `ref`
 *      so a caller can quote it and ops can correlate it with the
 *      structured log line.
 */
import { NextResponse } from "next/server";

/** Handler-authored error: passes through with its own status + safe message. */
export class ApiError extends Error {
  constructor(status, clientMessage) {
    super(clientMessage);
    this.status = status;
    this.clientMessage = clientMessage;
  }
}

// Safe client-facing messages per status. Never derived from err.message.
const SAFE_MESSAGES = {
  400: "Invalid request",
  401: "Unauthenticated",
  403: "Forbidden",
  404: "Not found",
  409: "Conflict",
  422: "Invalid request",
  429: "Too many requests",
};

const isPrismaError = (err) =>
  typeof err?.name === "string" && err.name.startsWith("PrismaClient");

/**
 * Classify an unknown error into { status, clientMessage }.
 * The client never receives err.message.
 */
export function classifyError(err) {
  // Handler-authored errors win — the author chose both the status
  // and a message that is safe to show.
  if (err instanceof ApiError) {
    return { status: err.status, clientMessage: err.clientMessage };
  }
  // AuthError (src/lib/auth) and similar classes carry a numeric
  // status. Use it with a safe message, not the class's message.
  if (err && typeof err.status === "number" && SAFE_MESSAGES[err.status]) {
    return { status: err.status, clientMessage: SAFE_MESSAGES[err.status] };
  }
  if (isPrismaError(err)) {
    // P2025: record not found. P2002: unique constraint.
    // P2003/P2004: the request referenced a missing record or sent an
    //   invalid field — client fault, not server fault -> 400.
    // P2023: malformed id for the column type (e.g. non-uuid string)
    //   -> 400.
    // ValidationError: the request itself was malformed -> 400.
    if (err.code === "P2025") return { status: 404, clientMessage: "Not found" };
    if (err.code === "P2002") return { status: 409, clientMessage: "Conflict" };
    if (err.code === "P2003" || err.code === "P2004" || err.code === "P2023") {
      return { status: 400, clientMessage: "Invalid request" };
    }
    if (err.name === "PrismaClientValidationError") {
      return { status: 400, clientMessage: "Invalid request" };
    }
    return { status: 500, clientMessage: "Request failed" };
  }
  if (err && typeof err.status === "number" && err.status >= 400 && err.status < 500) {
    return { status: err.status, clientMessage: SAFE_MESSAGES[err.status] ?? "Request failed" };
  }
  return { status: 500, clientMessage: "Request failed" };
}

function requestRef() {
  return "req_" + crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

function routeOf(req) {
  try {
    return new URL(req.url).pathname;
  } catch {
    return "(unknown)";
  }
}

/**
 * Emit the structured, redacted diagnostic line WITHOUT building a
 * response. Use in catches whose response shape is a UI contract
 * (e.g. `{ ok: false, message }`) that must not change shape.
 *
 * `ctx` is an optional short label (e.g. "jev /tool-guard") that
 * gives helper-context failures an identity in the log.
 *
 * Never logs the raw message, stack or query: those can contain
 * personal data, SQL or secrets. Only the error CLASS and, for
 * Prisma, the stable CODE (an enum value like "P2025") are logged.
 */
export function logError(err, req, ctx) {
  const ref = requestRef();
  console.error(
    JSON.stringify({
      ref,
      route: routeOf(req),
      method: req?.method ?? "(unknown)",
      ...(ctx ? { ctx: String(ctx).slice(0, 80) } : {}),
      error: err?.name ?? "UnknownError",
      code: isPrismaError(err) ? err.code ?? null : null,
    })
  );
  return ref;
}

/**
 * Build the client response AND emit one structured, redacted
 * diagnostic line.
 *
 *   errorResponse(err, req)                  — classified status + safe message
 *   errorResponse(err, req, { status, message })
 *     — force a route-specific status/message (e.g. 502 for an
 *       upstream-fetch route) while STILL logging the original
 *       error's class and code for diagnosis. The forced message
 *       must be a static, handler-authored string.
 *
 * `req` is the Next.js request object; pass null (or omit) from
 * helper contexts that do not have it.
 */
export function errorResponse(err, req, forced) {
  // Next.js control-flow signals — redirect() and notFound() throw
  // marked errors carrying a "NEXT_*" digest. They must keep their own
  // outcome (307 / 404) and must never be turned into a JSON 500, so
  // they are re-thrown for the framework to handle.
  if (err && typeof err === "object" && typeof err.digest === "string" && err.digest.startsWith("NEXT_")) {
    throw err;
  }
  const { status, clientMessage } = forced
    ? { status: forced.status, clientMessage: forced.message }
    : classifyError(err);
  const ref = logError(err, req);
  return NextResponse.json({ error: clientMessage, ref }, { status });
}
