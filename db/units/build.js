import { downloadImage, getUnits, getTechtree, getEquipments } from "../api.js"
import { convertEffects } from "../effects.js"
import { stringtablex, findLang } from "../lang.js"
import { unitTypes } from "../unit_types.js"
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
      units.filter(unit => !results[civ].some(u => u.id === unit.id))
    )
  }

  for (let civ in results) {
    results[civ].sort(compareUnits).sort(compareUnitTypes)
  }

  
  const enneris = results['roman'].find(u => u.id === 'Ro_Shp_Enneris')
  delete enneris.stats['DamageSiegeMeleeAttack']

  
  const gr_Bldg_Fortress = results['greek'].find(u => u.id === 'Gr_Bldg_Fortress')
  gr_Bldg_Fortress.inactiveActions[0] = 'BurningAttack'

  const eg_Bldg_Fortress = results['egyptian'].find(u => u.id === 'Eg_Bldg_Fortress')
  eg_Bldg_Fortress.inactiveActions[0] = 'BurningAttack'

  const ce_Bldg_Fortress = results['celtic'].find(u => u.id === 'Ce_Bldg_Fortress')
  ce_Bldg_Fortress.inactiveActions[0] = 'BurningAttack'

  const pe_Bldg_Fortress = results['persian'].find(u => u.id === 'Pe_Bldg_Fortress')
  pe_Bldg_Fortress.inactiveActions[0] = 'BurningAttack'

  const ro_Bldg_Fortress = results['roman'].find(u => u.id === 'Ro_Bldg_Fortress')
  ro_Bldg_Fortress.inactiveActions[0] = 'BurningAttack'

  const ba_Bldg_Fortress = results['babylonian'].find(u => u.id === 'Ba_Bldg_Fortress')
  ba_Bldg_Fortress.inactiveActions[0] = 'BurningAttack'
  



  return { front: results, server: await buildUnitsForServer(results) }
}

async function buildUnitsForServer(units) {
  console.log("Building units for server...")
  const apiUnits = await getUnits()
  const result = {}
  for (let civ in units) {
    for (let unit of units[civ]) {
      result[unit.id] = findByAttribute(apiUnits, "name", unit.id).Icon.replace(
        /\\/g,
        "/"
      )
    }
  }

  return result
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
        let effect = tech.Effects ? tech.Effects.effect : undefined
        if (effect) {
          if (!Array.isArray(effect)) {
            effect = [effect]
          }
          for (let j = 0; j < effect.length; j++) {
            const ef = effect[j]
            if (ef.subtype === "Enable" && ef.target.type === "ProtoUnit") {
              const unit = findByAttribute(units, "name", ef.target.text)
              if (unit) {
                const u = await convertUnit(unit, tech, equipment)
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

async function convertUnit(unit, tech, equipment) {
  const icon = unit.Icon.replace(/\\/g, "/").toLowerCase()
  const iconDst = convertIconName(icon)
  await downloadImage(icon + ".png", "../src/assets/units/" + iconDst + ".png")

  const [stats, inactiveActions] = await convertUnitStats(unit)
  const additionalStats = (
    await convertEffects(
      tech.Effects.effect,
      equipment.civ.toLowerCase(),
      false
    )
  ).filter(e => e.target === unit.name )
    
  additionalStats.forEach(e => {
    if (
      (e.type.startsWith("Armor") && e.type !== "ArmorVulnerability") ||
      e.type === "TargetSpeedBoostResist" ||
      e.type === "ConvertResist"
    ) {
      stats[e.type] = 1 - 1 / e.amount
    } else {
      stats[e.type] = e.amount
    }
  })

  const u = {
    id: unit.name,
    name: findLang(stringtablex, unit.DisplayNameID),
    types: unit.UnitType.filter(t => unitTypes.includes(t)),
    icon: iconDst,
    slots: convertSlots(unit),
    stats: stats,
    inactiveActions: inactiveActions
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

function compareUnitTypes(a, b) {
  // Buildings shown after units
  const aIsBuilding = a.types.includes("Building")
  const bIsBuilding = b.types.includes("Building")
  if (aIsBuilding && !bIsBuilding) {
    return 1
  }

  if (!aIsBuilding && bIsBuilding) {
    return -1
  }
  return 0
}

function includeUnit(tech, unit) {
  return !unit.id.includes("WallStraight")
}
