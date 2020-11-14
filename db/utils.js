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
