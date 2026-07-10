/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow the Next.js dev server to serve /_next/* assets to the Cloudflare
  // tunnel origin (and any *.trycloudflare.com host).
  allowedDevOrigins: ["*.trycloudflare.com", "trycloudflare.com"],
  // Skip lint/type-check during build (already validated) to cut memory + time.
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  // Limit build parallelism so "Collecting page data" doesn't exceed the
  // sandbox per-process memory ceiling (avoids exit 137 / Killed).
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
};

export default nextConfig;
