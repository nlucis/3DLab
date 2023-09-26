import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

import * as dotenv from 'dotenv';
dotenv.config();

export const ACCESS_TOKEN = process.env.CESIUM_ACCESS_TOKEN;

export default defineConfig({
  server: { 
    https: true,
    port: 3001,
    cors: true,
    headers: {
      cesium_access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhZDM0OTQ5Yi1lYjQ1LTRkMjQtYjllMC00YjkzOWNkZmIzMDYiLCJpZCI6ODIyOTgsImlhdCI6MTY4OTIxODI0MX0.5o0xQ4T4BCI8afp_0lXzjO_wa0kTOkc7dCdCGnJDiro'
    }
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