import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  logLevel: 'error',
  plugins: [
    base44({
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      hmrNotifier: true,
      navigationNotifier: true,
      analyticsTracker: true,
      visualEditAgent: true
    }),
    react(),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(rootDir, 'index.html'),
        services: resolve(rootDir, 'services.html'),
        work: resolve(rootDir, 'built.html'),
        about: resolve(rootDir, 'about.html'),
        contact: resolve(rootDir, 'contact.html'),
        'startup-marketing-pittsburgh': resolve(rootDir, 'startup-marketing-pittsburgh.html'),
        'small-business-marketing-pittsburgh': resolve(rootDir, 'small-business-marketing-pittsburgh.html'),
        'business-photography-pittsburgh': resolve(rootDir, 'business-photography-pittsburgh.html'),
        'business-videography-pittsburgh': resolve(rootDir, 'business-videography-pittsburgh.html')
      }
    }
  }
});