import { fileURLToPath, URL } from "node:url"
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { VitePWA } from "vite-plugin-pwa"

const iconSizes = ["16", "32", "96", "192", "512"]
const maskableIconSizes = ["192", "512"]

const manifestIcons = []

iconSizes.forEach(s => {
  manifestIcons.push({
    src: `/assets/meta/favicon-${s}.webp`,
    sizes: `${s}x${s}`,
    type: "image/webp"
  })
  manifestIcons.push({
    src: `/assets/meta/favicon-${s}.png`,
    sizes: `${s}x${s}`,
    type: "image/png"
  })
})

maskableIconSizes.forEach(s => {
  manifestIcons.push({
    src: `/assets/meta/maskable-icon-${s}.webp`,
    sizes: `${s}x${s}`,
    type: "image/webp",
    purpose: "maskable"
  })
  manifestIcons.push({
    src: `/assets/meta/maskable-icon-${s}.png`,
    sizes: `${s}x${s}`,
    type: "image/png",
    purpose: "maskable"
  })
})

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: "prompt",
      injectRegister: false,
      // Same file name as the Vue CLI service worker, so installed clients pick up the update
      filename: "service-worker.js",
      manifestFilename: "manifest.json",
      manifest: {
        name: "Unit Builder - Age of Empires Online",
        short_name: "Unit Builder",
        description: "Simulate stats and compare any AoEO unit.",
        icons: manifestIcons,
        theme_color: "#488489",
        background_color: "#488489",
        categories: ["gaming"],
        lang: "en-US",
        orientation: "portrait",
        display: "standalone",
        start_url: "/",
        scope: "/"
      },
      includeManifestIcons: false,
      workbox: {
        clientsClaim: true,
        globPatterns: ["**/*.{js,css,html,png,webp}"],
        globIgnores: ["**/robots*.txt", "**/sitemap.xml"],
        // The app bundle embeds the whole game database and exceeds the 2 MiB default
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024
      }
    })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/main.scss";\n`,
        quietDeps: true,
        // Bulma 0.9 and the existing styles still use @import and global color functions
        silenceDeprecations: ["import", "global-builtin", "color-functions"]
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 4096
  }
})
