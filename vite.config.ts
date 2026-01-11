import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // Production build optimizations
  build: {
    // Enable minification
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info", "console.debug"],
      },
      mangle: true,
    },

    // Code splitting for optimal loading
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          // Vendor chunk for React
          react: ["react", "react-dom"],
          // Socket.io client
          socket: ["socket.io-client"],
          // Radix UI components
          radix: [
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-popover",
            "@radix-ui/react-tooltip",
          ],
        },
      },
    },

    // Target modern browsers for smaller bundle
    target: "es2020",

    // Report compressed size
    reportCompressedSize: true,

    // Chunk size warning threshold (KB)
    chunkSizeWarningLimit: 150,

    // CSS code splitting
    cssCodeSplit: true,

    // Source maps for debugging (disable for production if needed)
    sourcemap: false,
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ["react", "react-dom", "socket.io-client"],
  },
});
