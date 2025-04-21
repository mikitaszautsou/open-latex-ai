import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  publicDir: "assets",
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "pwa-192x192.png",
        "pwa-512x512.png",
        "pwa-512x512.png",
        "favicon-640x320.png",
      ],
      devOptions: {
        enabled: true,
        type: "module",
      },
      manifest: {
        name: "Husky Chat",
        short_name: "App",
        description: "Your app description",
        theme_color: "#ffffff",
        scope: "/",
        start_url: "/",
        orientation: "portrait",
        display: "standalone",
        icons: [
          {
            src: "assets/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "assets/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "assets/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        screenshots: [
          {
            src: "assets/favicon-640x320.png",
            sizes: "640x320",
            type: "image/png",
            form_factor: "wide",
          },
          {
            src: "assets/favicon-360x640.png",
            sizes: "360x640",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
