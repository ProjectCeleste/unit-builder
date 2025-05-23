import fs from "fs"
import crypto from "crypto"

export async function saveFile(path, contents) {
  fs.writeFile(
    path,
    typeof contents == "string" ? contents : JSON.stringify(contents),
    "utf8",
    err => {
      if (err) throw err
    }
  )
}

export function findByAttribute(arr, attributeName, value) {
  for (let i = 0; i < arr.length; i++) {
    const obj = arr[i]
    if (obj[attributeName] === value) {
      return obj
    }
  }
  return undefined
}

export function hash(data) {
  return crypto
    .createHash("sha1")
    .update(data)
    .digest("base64")
    .replace(/[\W]/g, "")
    .substr(0, 8)
}

export function convertIconName(icon) {
  return hash(icon.substring(icon.lastIndexOf("/") + 1))
}

export function convertMarkup(text) {
  return text
    .replace(/\\n/g, "<br>")
    .replace(
      /<color=0\.32 0\.65 1\.0>(.*?)<\/color>/g,
      '<span class="is-highlight">$1</span>'
    )
    .replace(
      /<color=0\.0 1\.0 0\.0>(.*?)<\/color>/g,
      '<span class="is-positive">$1</span>'
    )
    .replace(
      /<color=1\.0 0\.0 0\.0>(.*?)<\/color>/g,
      '<span class="is-negative">$1</span>'
    )
    .replace(
      /<color=1\.0 1\.0 0\.0>(.*?)<\/color>/g,
      '<span class="is-neutral">$1</span>'
    )
    .replace(/<\/color>/g, "") // Fix for persian spearman champion
    .replace("{E^", "") // Fix for Gatherer Elephant
    .replace("^}{C08^", " ") // Fix for Gatherer Elephant
    .replace("^}", " ") // Fix for Gatherer Elephant
}

export function convertRarity(rarity) {
  switch (rarity) {
    case "common":
      return 0
    case "uncommon":
      return 1
    case "rare":
      return 2
    case "epic":
      return 3
    case "legendary":
      return 4
    default:
      return 0
  }
}

export function max(arr, attributeName) {
  return Math.max.apply(
    Math,
    arr.map(v => v[attributeName])
  )
}
