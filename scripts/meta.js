const { src, dest, series } = require("gulp")
const del = require("del")
const responsive = require("gulp-responsive")

const paths = {
  in: "src/assets/favicon/favicon-512.png",
  out: "public/assets/meta"
}

/**
 * Deletes all current app icons.
 */
const deleteAppIcons = () => del(paths.out + "/*")

/**
 * Generates multiple sizes of the app icon.
 */
const generateAppIcons = () => {
  const sizes = [
    16,
    32,
    36,
    48,
    57,
    60,
    70,
    72,
    76,
    96,
    114,
    120,
    128,
    144,
    150,
    152,
    180,
    192,
    310,
    512
  ]

  const images = sizes.map(size => ({
    rename: `favicon-${size}.png`,
    width: size,
    height: size,
    quality: 100
  }))

  return src(paths.in)
    .pipe(responsive({ "*": images }, { silent: true }))
    .pipe(dest(paths.out))
}

/**
 * `gulp meta`
 */
module.exports = series(deleteAppIcons, generateAppIcons)
