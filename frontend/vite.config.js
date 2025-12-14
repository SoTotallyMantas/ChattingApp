import { defineConfig } from 'vite'

import react from '@vitejs/plugin-react';

export default {
  plugins: [
    react(),

    
    {
      name: 'webrtc-adapter-global',
      resolveId(id) {
        if (id === 'virtual:webrtc-adapter-global') {
          return id;
        }
      },
      load(id) {
        if (id === 'virtual:webrtc-adapter-global') {
          return `
            import adapter from 'webrtc-adapter';
            if (typeof window !== 'undefined') {
              window.adapter = adapter;
            }
          `;
        }
      }
    }
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'janus-gateway': ['janus-gateway'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['webrtc-adapter', 'janus-gateway'],
  },
};

