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
      favicon32: null, // TODO proper PWA icons
      favicon16: null,
      appleTouchIcon: null,
      maskIcon: null,
      msTileImage: "assets/meta/favicon-144.png"
    },
    themeColor: "#488489",
    msTileColor: "488489"
  }
}
