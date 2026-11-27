import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["unpdf", "pdfjs-dist", "pptxgenjs", "pdf-lib"],
  eslint: { ignoreDuringBuilds: true },
  poweredByHeader: false,
  experimental: {
    // Keep recently visited pages in the client router cache so going back to
    // a document you just looked at is instant instead of a fresh round-trip.
    staleTimes: { dynamic: 30 },
  },
};

export default nextConfig;
