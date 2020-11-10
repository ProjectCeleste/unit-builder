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
  table.forEach(entry => {
    if (entry["_locid"] === locid) {
      return entry
    }
  })
}
