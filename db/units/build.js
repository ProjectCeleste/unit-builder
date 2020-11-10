import { downloadImage, getUnits, getTechtree, getEquipments } from "../api.js"
import { stringtablex, findLang } from "../lang.js"
import { findByAttribute } from "../utils.js"

export async function buildUnits() {
  const equipments = await getEquipments()

  const results = {}
  for (let e in Object.values(equipments)) {
    const units = await convertEquipmentToUnits(e)
    const civ = e.civ.toLowerCase()
    if (!results[civ]) {
      results[civ] = []
    }

    results[civ].concat(units)
  }

  for (let civ in Object.values(results)) {
    civ.sort(compareUnits)
  }

  // WARNING: tactics files not served by API, techtreex neither

  // equipment -> techtreex -> units
  return results
}

async function convertEquipmentToUnits(equipment) {
  const techtree = await getTechtree()
  const units = await getUnits()

  const results = []
  if (equipment.reward) {
    for (let reward in equipment.reward.rank) {
      const tech = findByAttribute(techtree, "name", reward.tech)
      if (tech) {
        for (let effect in tech.effects) {
          if (
            effect.subtype === "Enable" &&
            effect.target.type === "ProtoUnit"
          ) {
            const unit = findByAttribute(units, "name", effect.target.text)
            if (unit) {
              const u = convertUnit(unit)
              if (includeUnit(tech, u)) {
                results.push(u)
              }
            }
          }
        }
      }
    }
  }

  return results
}

function convertUnit(unit) {
  const icon = unit.Icon.replaceAll("\\", "/")
  downloadImage(icon + ".png", "../../src/assets/img/Art/" + icon + ".png") //TODO gulp sprite and webp
  const u = {
    id: unit.name,
    name: findLang(stringtablex, unit.DisplayNameID),
    // TODO relevant unit types
    icon: icon,
    stats: convertStats(unit)
  }
  return u
}

function convertStats() {
  return {}
}

function compareUnits(a, b) {
  return a.name.localeCompare(b.name)
}

function includeUnit(tech, unit) {
  return true
}
