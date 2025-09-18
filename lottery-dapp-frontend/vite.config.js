import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    'process.env': {},
    'process.version': '"v18.0.0"'
  },
  resolve: {
    alias: {
      buffer: 'buffer'
    }
  },
  optimizeDeps: {
    include: ['buffer', 'bn.js/lib/bn.js'],
    exclude: ['@coral-xyz/anchor']
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
})
