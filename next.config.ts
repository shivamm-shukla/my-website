import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : null;

const config: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  reactStrictMode: true,
  experimental: {
    useTypeScriptCli: false,
    workerThreads: true,
    cpus: 2,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 390, 640, 768, 1024, 1280, 1440, 1920, 2560],
    remotePatterns: supabaseHost ? [{ protocol: "https", hostname: supabaseHost }] : [],
  },
  async headers() {
    return [{ source: "/(.*)", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
    ] }];
  },
};

export default config;
