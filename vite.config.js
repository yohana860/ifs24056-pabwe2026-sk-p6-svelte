import { defineConfig, loadEnv } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { svelteTesting } from "@testing-library/svelte/vite";
import tailwindcss from "@tailwindcss/vite";
import process from "process";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const baseUrl =
    env.VITE_DELCOM_BASEURL || "https://open-api.delcom.org/api/v1";

  return {
    plugins: [
      svelte({ prebundleSvelteLibraries: false }),
      tailwindcss(),
      svelteTesting(),
    ],
    server: { port: Number(env.APP_PORT) || 3004 },
    preview: { port: Number(env.APP_PORT) || 3004 },
    build: {
      chunkSizeWarningLimit: 1500,
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("lucide-svelte")) return "icons";
              if (id.includes("sweetalert2")) return "sweetalert";
              if (id.includes("svelte")) return "svelte-core";
              return "vendor";
            }
          },
        },
      },
    },
    define: {
      DELCOM_BASEURL: JSON.stringify(baseUrl),
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/setupTests.js",
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html", "lcov"],
        include: ["src/**/*.{js,svelte}"],
        exclude: [
          "src/main.js",
          "src/setupTests.js",
          "src/test-utils.js",
          "**/*.test.{js,jsx}",
          "node_modules/**",
          ".docs/**",
        ],
        thresholds: {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
      },
    },
  };
});