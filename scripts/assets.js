import { mkdir, readdir, rm, writeFile } from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"

// Same quality as the former gulp-webp (imagemin-webp) default
const WEBP_QUALITY = 75

const META_OUT = "public/assets/meta"
const SPRITES_OUT = "public/assets/sprites"
const SPRITES_CSS_OUT = "src/styles/sprites"

async function listPngs(dir) {
  const files = await readdir(dir).catch(() => [])
  return files
    .filter(f => f.toLowerCase().endsWith(".png"))
    .sort()
    .map(f => path.join(dir, f))
}

/**
 * Writes a resized PNG and its WebP counterpart.
 */
async function writeIcon(input, size, outName) {
  const resized = sharp(input).resize(size, size)
  await resized
    .clone()
    .png()
    .toFile(path.join(META_OUT, `${outName}.png`))
  await resized
    .clone()
    .webp({ quality: WEBP_QUALITY })
    .toFile(path.join(META_OUT, `${outName}.webp`))
}

/**
 * Generates multiple sizes of the app icon and the maskable icon.
 */
async function meta() {
  const sizes = [
    16, 32, 36, 48, 57, 60, 70, 72, 76, 96, 114, 120, 128, 144, 150, 152, 180,
    192, 310, 512
  ]
  const maskableSizes = [192, 512]

  await rm(META_OUT, { recursive: true, force: true })
  await mkdir(META_OUT, { recursive: true })

  await Promise.all([
    ...sizes.map(s =>
      writeIcon("src/assets/favicon/favicon-512.png", s, `favicon-${s}`)
    ),
    ...maskableSizes.map(s =>
      writeIcon("src/assets/favicon/maskable-icon.png", s, `maskable-icon-${s}`)
    )
  ])
  console.log(`meta: ${sizes.length + maskableSizes.length} icons`)
}

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
function cssTemplate(name, size, sprites) {
  const sharedClass = [
    `.sprite--${name} {`,
    `  background-image: url("/assets/sprites/${name}.webp");`,
    `  width: ${size}px;`,
    `  height: ${size}px;`,
    `}`
  ].join("\n")

  sprites.sort((a, b) => {
    if (a.x !== b.x) {
      return b.x - a.x
    }
    return b.y - a.y
  })

  const iconSelectorLength =
    11 + name.length + Math.max(...sprites.map(s => s.name.length))

  const iconClasses = sprites
    .map(entry => {
      const { x, y, totalWidth, totalHeight } = entry
      const percentY = toRoundedPercent(y / (totalHeight - size) || 0)
      const percentX = toRoundedPercent(x / (totalWidth - size) || 0)

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
 * Generates a single sprite sheet (WebP) and its SCSS.
 * All icons are resized to the same square size and laid out on a grid.
 */
async function sprite(name, size, extraDir) {
  const files = [
    ...(await listPngs(`src/assets/${name}`)),
    ...(extraDir ? await listPngs(extraDir) : [])
  ]
  if (!files.length) {
    throw new Error(
      `No images found for sprite "${name}". Run "npm run db" first to download them.`
    )
  }

  const columns = Math.ceil(Math.sqrt(files.length))
  const rows = Math.ceil(files.length / columns)
  const totalWidth = columns * size
  const totalHeight = rows * size

  const sprites = await Promise.all(
    files.map(async (file, i) => ({
      name: path.basename(file, path.extname(file)),
      x: (i % columns) * size,
      y: Math.floor(i / columns) * size,
      totalWidth,
      totalHeight,
      input: await sharp(file).resize(size, size).png().toBuffer()
    }))
  )

  await sharp({
    create: {
      width: totalWidth,
      height: totalHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite(sprites.map(s => ({ input: s.input, left: s.x, top: s.y })))
    .webp({ quality: WEBP_QUALITY })
    .toFile(path.join(SPRITES_OUT, `${name}.webp`))

  await writeFile(
    path.join(SPRITES_CSS_OUT, `_${name}.scss`),
    cssTemplate(name, size, sprites)
  )
  console.log(`sprites.${name}: ${files.length} images`)
}

async function sprites() {
  await mkdir(SPRITES_OUT, { recursive: true })
  await Promise.all([
    sprite("icons", 32),
    sprite("units", 64),
    sprite("upgrades", 64),
    sprite("advisors", 64),
    sprite("milestones", 64),
    sprite("gear", 64, "src/assets/slot")
  ])
}

const tasks = { meta, sprites }
const selected = process.argv.slice(2)

for (const task of selected.length ? selected : Object.keys(tasks)) {
  if (!tasks[task]) {
    throw new Error(`Unknown task "${task}". Available: ${Object.keys(tasks)}`)
  }
  await tasks[task]()
}
