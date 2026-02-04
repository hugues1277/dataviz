import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { apiPlugin } from './src/api/apiPlugin';
import { authApiPlugin } from './src/api/authApiPlugin';
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Detect if running in Tauri mode (via environment variable or command)
// Tauri sets TAURI_DEV=true in dev mode and TAURI_PLATFORM in build
// const isTauri = process.env.TAURI_DEV === 'true' || process.env.TAURI_PLATFORM !== undefined;



export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const isTauri = env.VITE_IS_TAURI_APP === 'true';
  console.log('isTauri', isTauri);

  return isTauri ? {
    server: {
      port: 3001,
      // Tauri requires localhost for security, web can use 0.0.0.0
      host: 'localhost',
      strictPort: true,
      // HMR configured to work with Tauri
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 3001,
      },
    },
    plugins: [react(), tailwindcss(), apiPlugin(), authApiPlugin()],
    define: {
      __TAURI__: JSON.stringify(isTauri),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    optimizeDeps: {
      // Exclure PGlite de l'optimisation pour éviter les erreurs de bundle FS
      exclude: ['@electric-sql/pglite'],
    },
    // Clear screen disabled to avoid conflicts with Tauri
    clearScreen: false,
    envPrefix: ['VITE_'],
  } : {
    server: {
      port: 3001,
      host: '0.0.0.0',
    },
    plugins: [react(), tailwindcss(), apiPlugin(), authApiPlugin()],
    define: {
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
  };
});
