import { defineConfig } from 'vite';

export default defineConfig({
  server: { 
    https: false,
    port: 3001,
    cors: true,
    fs: {
      allow: ['./dist', './src', './public', './models'],
    }
  },
  
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