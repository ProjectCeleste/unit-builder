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
  }
}
