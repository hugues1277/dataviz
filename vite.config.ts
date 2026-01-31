import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { apiPlugin } from './src/api/apiPlugin';
import { authApiPlugin } from './src/api/authApiPlugin';
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  // Detect if running in Tauri mode (via environment variable or command)
  // Tauri sets TAURI_DEV=true in dev mode and TAURI_PLATFORM in build
  const isTauri = process.env.TAURI_DEV === 'true' || process.env.TAURI_PLATFORM !== undefined;

  return {
    server: {
      port: 3001,
      // Tauri requires localhost for security, web can use 0.0.0.0
      host: isTauri ? 'localhost' : '0.0.0.0',
      strictPort: true,
      // HMR configured to work with Tauri
      hmr: isTauri ? {
        protocol: 'ws',
        host: 'localhost',
        port: 3001,
      } : undefined,
    },
    plugins: [react(), tailwindcss(), apiPlugin(), authApiPlugin()],
    define: {
      // Define __TAURI__ for TypeScript/JavaScript code
      __TAURI__: JSON.stringify(isTauri),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    // Clear screen disabled to avoid conflicts with Tauri
    clearScreen: false,
    // Environment prefixes for Tauri
    envPrefix: ['VITE_', 'TAURI_'],
  };
});
