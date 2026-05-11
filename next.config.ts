import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // SSR mode — enables API routes for secure server-side AI calls
  // Deploy to Vercel (free tier) instead of Cloudflare Pages
};

export default nextConfig;

if (process.env.NODE_ENV === "development" && !process.env.VERCEL) {
  import("@opennextjs/cloudflare").then((m) => m.initOpenNextCloudflareForDev());
}
