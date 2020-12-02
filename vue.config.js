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

module.exports = {
  css: {
    loaderOptions: {
      scss: {
        prependData: `
            @import "@/styles/main.scss";
        `
      }
    }
  },
  pluginOptions: {
    sitemap: {
      outputDir: "public",
      urls: ["https://unitstats.projectceleste.com"],
      defaults: {
        lastmod: new Date().toISOString(),
        changefreq: "weekly",
        priority: 1.0
      }
    }
  },
  pwa: {
    name: "Unit Builder - Age of Empires Online",
    iconPaths: {
      favicon32: null,
      favicon16: null,
      appleTouchIcon: null,
      maskIcon: "assets/meta/maskable_icon.png",
      msTileImage: null
    },
    manifestOptions: {
      icons: manifestIcons,
      background_color: "#488489",
      categories: ["gaming"],
      description: "Simulate stats and compare any AoEO unit.",
      lang: "en-US",
      orientation: "portrait",
      short_name: "Unit Builder"
    },
    themeColor: "#488489",
    msTileColor: "#488489",
    workboxOptions: {
      clientsClaim: true
    }
  }
}
