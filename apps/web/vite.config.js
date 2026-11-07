import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { proxy: Object.fromEntries(["/v1", "/auth", "/openapi.json"].map((path) => [path, "http://localhost:58000"])) },
});
