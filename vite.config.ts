/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/mast/',
  plugins: [react()],
  test: {
    environment: 'node',
  },
})
