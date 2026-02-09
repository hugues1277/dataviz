import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Configuration pour les alias de chemins avec Turbopack
  turbopack: {
    resolveAlias: {
      "@": path.resolve(__dirname),
    },
  },
  // Configuration pour les alias de chemins avec webpack (pour compatibilité)
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname),
    };
    return config;
  },
  // Configuration pour Better Auth - évite les problèmes de résolution de modules
  serverExternalPackages: ['better-auth'],
};

export default nextConfig;
