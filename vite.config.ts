import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(), 
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg', 'placeholder.svg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/zeyxhvrymjdypgfporuy\.supabase\.co\/storage\/v1\/object\/public\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'supabase-images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 Year
              },
            },
          },
        ],
      },
      manifest: {
        name: 'AgriLink Kenya',
        short_name: 'AgriLink',
        description: 'Directly connecting Kenyan farmers with buyers for fair trade.',
        theme_color: '#10b981',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'favicon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon'
          },
          {
            src: 'placeholder.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ].filter(Boolean),
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            if (id.includes('recharts')) {
              return 'charts';
            }
            if (id.includes('@supabase')) {
              return 'supabase-vendor';
            }
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
