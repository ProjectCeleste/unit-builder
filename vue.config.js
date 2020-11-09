module.exports = {
  css: {
    loaderOptions: {
      scss: {
        prependData: `
            @import "@/styles/main.scss";
        `
      }
    }
  }
}
