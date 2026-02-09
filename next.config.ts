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
    // Résolution des modules pour better-auth avec pnpm
    // Force la résolution de next/headers depuis le node_modules racine
    config.resolve.modules = [
      path.resolve(__dirname, 'node_modules'),
      'node_modules',
    ];
    return config;
  },
  // Configuration pour Better Auth - transpile better-auth pour éviter les problèmes de résolution
  transpilePackages: ['better-auth'],
};

export default nextConfig;
