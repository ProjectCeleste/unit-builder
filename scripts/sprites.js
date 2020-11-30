const { src, dest, parallel } = require("gulp")
const responsive = require("gulp-responsive")
const spritesmith = require("gulp.spritesmith")
const merge = require("merge-stream")

function toRoundedPercent(value) {
  return (value * 100)
    .toFixed(6)
    .replace(/0+$/, "")
    .replace(/\.$/, "")
    .replace(/(.*)/, "$1%")
    .replace(/^0%$/, "0")
}

/**
 * Generates the CSS for a sprite.
 */
const cssTemplate = (name, size) => data => {
  const sharedClass = [
    `.sprite--${name} {`,
    `  background-image: url("/assets/sprites/${name}.webp");`,
    `  width: ${size}px;`,
    `  height: ${size}px;`,
    `}`
  ].join("\n")

  data.sprites.sort((a, b) => {
    if (a.offset_x !== b.offset_x) {
      return b.offset_x - a.offset_x
    }
    return b.offset_y - a.offset_y
  })

  const iconSelectorLength =
    11 + name.length + Math.max(...data.sprites.map(s => s.name.length))

  const iconClasses = data.sprites
    .map(entry => {
      const { x, y, width, total_width, height, total_height } = entry
      const percentY = toRoundedPercent(y / (total_height - height) || 0)
      const percentX = toRoundedPercent(x / (total_width - width) || 0)

      return [
        `.sprite--${name}--${entry.name.replace(/\s/g, "-")}`.padEnd(
          iconSelectorLength
        ) + "{",
        `  background-position: ${percentX} ${percentY} !important;`.trim(),
        `}`
      ].join(" ")
    })
    .join("\n")

  return [sharedClass, iconClasses].join("\n") + "\n"
}

/**
 * Generates a single sprite.
 */
const sprite = (name, size, extraIn) => {
  const paths = {
    in: `src/assets/${name}/*.png`,
    out: {
      img: "public/assets/sprites",
      css: "src/styles/sprites"
    }
  }
  const config = { base: `src/assets/` }
  const imageSizes = {
    "**": {
      width: size,
      height: size,
      quality: 100
    }
  }
  const imageConfig = {
    silent: true
  }

  const input = [paths.in]
  if (extraIn) {
    input.push(extraIn)
  }

  const fn = () => {
    const spriteData = src(input, config)
      .pipe(responsive(imageSizes, imageConfig))
      .pipe(
        spritesmith({
          imgName: `${name}.png`,
          cssName: `_${name}.scss`,
          cssTemplate: cssTemplate(name, size),
          algorithm: "binary-tree"
        })
      )

    const imgStream = spriteData.img.pipe(dest(paths.out.img))
    const cssStream = spriteData.css.pipe(dest(paths.out.css))
    return merge(imgStream, cssStream)
  }
  fn.displayName = `sprites.${name}`

  return fn
}

/**
 * `gulp sprites`
 */
module.exports = parallel(
  sprite("icons", 32),
  sprite("units", 64),
  sprite("upgrades", 64),
  sprite("advisors", 64),
  sprite("gear", 64, "src/assets/slot/*.png")
)
