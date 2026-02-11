import type { NextConfig } from "next";

const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",  // Next.js hydration requires unsafe-inline
  "style-src 'self' 'unsafe-inline'",   // Tailwind CSS requires unsafe-inline
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self' https://api.dronacharya.app https://*.dronacharya.app",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: cspDirectives },
];

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
