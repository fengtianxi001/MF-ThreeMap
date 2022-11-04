import { defineConfig } from "vite";
import { NgmiPolyfill } from "vite-plugin-ngmi-polyfill";

export default defineConfig({
  plugins: [NgmiPolyfill()],
});
