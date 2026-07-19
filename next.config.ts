import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // ─── Security Headers ────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevents MIME-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Prevents clickjacking
          { key: "X-Frame-Options", value: "DENY" },
          // Forces HTTPS for 1 year
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          // Controls referrer info
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Restricts browser features
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Basic Content Security Policy
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // unsafe-eval needed by Next.js dev
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
              "frame-ancestors 'none'",
            ].join("; "),
          },
          // Prevent XSS in older browsers
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
    ]
  },

  // ─── Image Optimization ──────────────────────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // ─── Performance ─────────────────────────────────────────────────────────
  compress: true,
  poweredByHeader: false, // Remove "X-Powered-By: Next.js" header

  // ─── TypeScript / ESLint ─────────────────────────────────────────────────
  typescript: {
    ignoreBuildErrors: false,
  },
}

export default nextConfig
