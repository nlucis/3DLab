import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  server: { 
    https: true,
    port: 3001,
    cors: true,
  },

plugins: [
  basicSsl()
],
  build: {
    rollupOptions: {
      plugins: [],
      
      output: {
        dir: "dist",
        manualChunks: {}
      },
    },
  },
});