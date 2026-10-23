import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// base "./" so the build works under GitHub Pages' /crate-job/ path and from a local file.
export default defineConfig({
  plugins: [react()],
  base: "./",
});
