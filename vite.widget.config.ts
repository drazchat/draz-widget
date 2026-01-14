import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import path from "path";

/**
 * Vite configuration for building the embeddable widget bundle.
 * Outputs a single IIFE script with CSS injected that can be embedded on any website.
 */
export default defineConfig({
  plugins: [react(), tailwindcss(), cssInjectedByJsPlugin()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // Define environment variables for production
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },

  build: {
    // Output to dist-widget folder
    outDir: "dist-widget",

    // Library configuration for IIFE output
    lib: {
      entry: path.resolve(__dirname, "src/widget.entry.tsx"),
      name: "DrazWidget",
      fileName: () => "draz-widget.js",
      formats: ["iife"],
    },

    // Rollup options
    rollupOptions: {
      output: {
        // Inline dynamic imports (no code splitting)
        inlineDynamicImports: true,
      },
    },

    // Inline CSS into JS (no separate CSS file)
    cssCodeSplit: false,

    // Minification
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info", "console.debug"],
      },
      mangle: true,
    },

    // Target modern browsers
    target: "es2020",

    // No source maps for production embed
    sourcemap: false,

    // Report size
    reportCompressedSize: true,
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ["react", "react-dom", "socket.io-client"],
  },
});
