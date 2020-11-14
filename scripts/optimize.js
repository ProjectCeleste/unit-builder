const { src, dest, parallel, series } = require("gulp")
const del = require("del")
const debug = require("gulp-debug")
const webp = require("gulp-webp")

const optimizeMeta = () =>
  src([`public/assets/meta/*.png`])
    .pipe(debug())
    .pipe(webp())
    .pipe(dest("public/assets/meta"))

const optimizeSprites = () =>
  src([`public/assets/sprites/*.png`])
    .pipe(debug())
    .pipe(webp())
    .pipe(dest("public/assets/sprites"))

const deleteUnoptimizedSprites = () => del("public/assets/sprites/*.png")

/**
 * `gulp optimize`
 */
module.exports = parallel(
  optimizeMeta,
  series(optimizeSprites, deleteUnoptimizedSprites)
)
