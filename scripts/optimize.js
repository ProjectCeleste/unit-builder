const { src, dest } = require("gulp")
const debug = require("gulp-debug")
const webp = require("gulp-webp")

const optimize = () =>
  src([`public/assets/meta/*.png`])
    .pipe(debug())
    .pipe(webp())
    .pipe(dest("public/assets/meta"))

/**
 * `gulp optimize`
 */
module.exports = optimize
