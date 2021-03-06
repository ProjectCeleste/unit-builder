import { getStringtablex, getEquipmentStrings, getEconStrings } from "./api.js"

let stringtablex
let equipmentstrings
let econstrings

export async function fetchLang() {
  stringtablex = await getStringtablex()
  equipmentstrings = await getEquipmentStrings()
  econstrings = await getEconStrings()
}

export { stringtablex, equipmentstrings, econstrings }

export function findLang(table, locid) {
  if (typeof locid === "string") {
    locid = parseInt(locid)
  }
  const strings = table.string
  for (let i = 0; i < strings.length; i++) {
    const entry = strings[i]
    if (entry["_locid"] === locid) {
      return entry.text
    }
  }
}
