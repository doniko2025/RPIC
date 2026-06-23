//backend/next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
  },
  // FIX : section headers() supprimée — CORS géré exclusivement dans middleware.ts
  // pour éviter le double header "Access-Control-Allow-Origin"
};

export default nextConfig;
