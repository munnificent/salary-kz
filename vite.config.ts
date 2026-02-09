import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  // Базовый путь для GitHub Pages
  base: '/salary-kz/',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Оптимизация: разбиение на чанки для ускорения загрузки
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'recharts'],
        },
      },
    },
    // Минификация кода
    minify: 'esbuild',
    sourcemap: false,
  },
})