import { realpathSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const webpackModule = require("next/dist/compiled/webpack/webpack");
webpackModule.init();
const webpack = webpackModule.webpack;

if (process.platform === "win32") {
  const cwd = process.cwd();
  const isJunction = cwd.toLowerCase().startsWith("c:\\datumos");
  if (!isJunction) {
    try {
      const canonical = realpathSync.native(cwd);
      if (canonical && canonical !== cwd) {
        process.chdir(canonical);
        console.log(`[next.config] cwd canonicalized to ${canonical}`);
      }
    } catch {
      // non-fatal
    }
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep the local demonstration cache separate from other build processes.
  distDir: process.env.DATUM_DEMO_ISOLATED === "1" ? ".next-live-demo" : ".next",
  reactStrictMode: true,
  allowedDevOrigins: ["*.trycloudflare.com", "trycloudflare.com"],
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  webpack(config) {
    if (process.platform === "win32") {
      // Narrow guard (2026-09-28). The two replacement rules this replaces were
      // unanchored, so they matched ANY request path containing the project
      // folder name - including Next.js's own files under node_modules/next/dist.
      // Because the replacement string itself contained "DATUM INITIATIVE 2026",
      // a second match pass re-wrote the already-rewritten string, producing the
      // observed doubled path and corrupting BOTH the production build and
      // `next dev`. The predicate below restricts the rewrite to app source only.
      const projectRoot = realpathSync.native(process.cwd());
      const srcRoot = path.join(projectRoot, "src") + path.sep;
      config.plugins.push({
        apply(compiler) {
          const NormalModuleReplacementPlugin =
            compiler.webpack.NormalModuleReplacementPlugin;
          compiler.hooks.normalModuleFactory.tap("DatumOsPathRewriteGuard", (nmf) => {
            nmf.hooks.beforeResolve.tap("DatumOsPathRewriteGuard", (result) => {
              const request = result.request;
              if (typeof request !== "string") return;
              // Never touch dependencies, Next.js internals, or build output.
              const posix = request.split(path.sep).join("/");
              if (
                posix.includes("/node_modules/") ||
                posix.startsWith("next/") ||
                posix.startsWith("@") ||
                posix.includes("/.next/")
              ) {
                return;
              }
              // Only apply the original rewrite to requests inside app src.
              if (request.startsWith(srcRoot)) {
                result.request = request.replace(
                  /DATUM INITIATIVE 2026[\\/]DATUMOS/g,
                  "DATUM INITIATIVE 2026/DatumOS"
                );
              }
            });
          });
        },
      });
    }
    return config;
  },
};

export default nextConfig;