import fs from "fs"

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
  for (let obj in Object.values(arr)) {
    if (obj[attributeName] === value) {
      return obj
    }
  }
  return undefined
}
