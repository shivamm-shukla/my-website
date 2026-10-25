import type { NextConfig } from "next";

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
  },
};

export default config;
