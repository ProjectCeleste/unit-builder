import { downloadImage, getUnits, getTechtree, getEquipments } from "../api.js"
import { stringtablex, findLang } from "../lang.js"
import { convertIconName, findByAttribute } from "../utils.js"
import { convertUnitStats } from "./convert-stats.js"

export async function buildUnits() {
  console.log("Building units...")
  const equipments = await getEquipments()

  const results = {}
  for (let i = 0; i < equipments.length; i++) {
    const e = equipments[i]
    const units = await convertEquipmentToUnits(e)
    const civ = e.civ.toLowerCase()
    if (!results[civ]) {
      results[civ] = []
    }

    // Filter out units that already exist in array
    results[civ] = results[civ].concat(
      units.filter(unit => !results[civ].some(u => u.name === unit.name))
    )
  }

  for (let civ in results) {
    results[civ].sort(compareUnits)
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
    for (let i = 0; i < equipment.reward.rank.length; i++) {
      const reward = equipment.reward.rank[i]
      const tech = findByAttribute(techtree, "name", reward.tech)
      if (tech) {
        let effect = tech.Effects ? tech.Effects.Effect : undefined
        if (effect) {
          if (!Array.isArray(effect)) {
            effect = [effect]
          }
          for (let j = 0; j < effect.length; j++) {
            const ef = effect[j]
            if (ef.subtype === "Enable" && ef.Target.type === "ProtoUnit") {
              const unit = findByAttribute(units, "name", ef.Target.text)
              if (unit) {
                const u = await convertUnit(unit)
                if (includeUnit(tech, u)) {
                  results.push(u)
                }
              }
            }
          }
        }
      }
    }
  }

  return results
}

async function convertUnit(unit) {
  const icon = unit.Icon.replace(/\\/g, "/").toLowerCase()
  const iconDst = convertIconName(icon)
  await downloadImage(icon + ".png", "../src/assets/units/" + iconDst + ".png") //TODO gulp sprite and webp
  const u = {
    id: unit.name,
    name: findLang(stringtablex, unit.DisplayNameID),
    // TODO relevant unit types
    icon: iconDst,
    slots: convertSlots(unit),
    stats: convertUnitStats(unit)
  }
  return u
}

function convertSlots(unit) {
  const slots = []
  for (let i = 1; i <= 5; i++) {
    const trait = unit["Trait" + i]
    if (trait) {
      slots.push(trait)
    }
  }
  return slots
}

function compareUnits(a, b) {
  return a.name.localeCompare(b.name)
}

function includeUnit(tech, unit) {
  return !unit.id.includes("WallStraight")
}
