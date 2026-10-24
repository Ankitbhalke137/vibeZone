import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  // Avatars / event images come from OCI Object Storage (pre-signed URLs) — Week 2
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.sslip.io" },
      { protocol: "https", hostname: "*.objectstorage.*.oraclecloud.com" },
    ],
  },
};

export default nextConfig;
