import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { resolve } from 'node:path'

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
        main: resolve(__dirname, 'index.html'),
        services: resolve(__dirname, 'services.html'),
        work: resolve(__dirname, 'built.html'),
        about: resolve(__dirname, 'about.html'),
        contact: resolve(__dirname, 'contact.html'),
        'startup-marketing-pittsburgh': resolve(__dirname, 'startup-marketing-pittsburgh.html'),
        'small-business-marketing-pittsburgh': resolve(__dirname, 'small-business-marketing-pittsburgh.html'),
        'business-photography-pittsburgh': resolve(__dirname, 'business-photography-pittsburgh.html'),
        'business-videography-pittsburgh': resolve(__dirname, 'business-videography-pittsburgh.html')
      }
    }
  }
});