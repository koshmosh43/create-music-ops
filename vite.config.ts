import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/')) return 'react-core'
          if (id.includes('recharts')) return 'charts'
          if (id.includes('@radix-ui') || id.includes('lucide-react')) return 'ui'
          if (id.includes('@tanstack') || id.includes('zod') || id.includes('zustand') || id.includes('remeda')) return 'data'
          return undefined
        },
      },
    },
  },
})
