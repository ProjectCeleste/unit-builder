import { downloadImage, getUnits, getTechtree, getEquipments, getNuggets } from "../api.js"
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
  
  const powerNuggets = await getNuggets()

  const resultsCons = {}

  for (let i = 0; i < powerNuggets.length; i++) {
    const power = powerNuggets[i]
    if (power.type === "TempUnit") {
      const consUnits = await convertConsUnit(power)
      const civs = ["greek","egyptian","celtic","persian","babylonian","roman","norse"]
      
      for (let i = 0; i < civs.length; i++) { 
        if (!resultsCons[civs[i]]) {
          resultsCons[civs[i]] = []   
        }      
        resultsCons[civs[i]] = resultsCons[civs[i]].concat(
          consUnits.filter(consUnit => !resultsCons[civs[i]].some(u => u.id === consUnit.id))
        )
      }
      
     /*
      results["celtic"] = results["celtic"].concat(
        consUnits.filter(unit => !results["celtic"].some(u => u.id === unit.id))
      )*/
    }
  }

  for (let civ in results) {
    results[civ].sort(compareUnits).sort(compareUnitTypes)
  }

  for (let civ in resultsCons) {
    resultsCons[civ].sort(compareUnits).sort(compareUnitTypes)
    results[civ] = results[civ].concat(resultsCons[civ])
  }
  
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


async function convertConsUnit(power) {
  const units = await getUnits()
  const techtree = await getTechtree()
  const equipments = await getEquipments()

  //Dummy for Consumable Units
  var deerTech = findByAttribute(techtree, "name", "Ce_Ct_UnitDeer1")
  const deerEquip = findByAttribute(equipments, "id", 653)

  const results = []

  for (let j = 0; j < power.createunit.length; j++) {
    const createUnit = power.createunit[j]
    if (createUnit.text.startsWith("Con") && !createUnit.text.startsWith("Con_Spyglass") && !createUnit.text.startsWith("Con_Res_") ) {
      const consUnit = findByAttribute(units, "name", createUnit.text)
        if (consUnit) {
          deerTech.Effects.effect[0].target.text = createUnit.text
            for (let keyAction in consUnit.ProtoAction) {
              const action = consUnit.ProtoAction[keyAction]
              if (consUnit["Trait1"]){
                if (consUnit["Trait1"].startsWith("ConCommon"))   {action.Damage = action.Damage * 1.171}
                if (consUnit["Trait1"].startsWith("ConUncommon")) {action.Damage = action.Damage * 1.331}
                if (consUnit["Trait1"].startsWith("ConRare"))     {action.Damage = action.Damage * 1.551}
                if (consUnit["Trait1"].startsWith("ConEpic"))     {action.Damage = action.Damage * 1.821}
              }            
            }
            if (consUnit["Trait1"]){
              if (consUnit["Trait1"].startsWith("ConCommon"))   {consUnit.MaxHitpoints = consUnit.MaxHitpoints * 1.171}
              if (consUnit["Trait1"].startsWith("ConUncommon")) {consUnit.MaxHitpoints = consUnit.MaxHitpoints * 1.331}
              if (consUnit["Trait1"].startsWith("ConRare"))     {consUnit.MaxHitpoints = consUnit.MaxHitpoints * 1.551}
              if (consUnit["Trait1"].startsWith("ConEpic"))     {consUnit.MaxHitpoints = consUnit.MaxHitpoints * 1.821}
            }            
          delete consUnit["Trait1"]
          if (!consUnit.UnitType.includes("Consumable")) {
            consUnit.UnitType.push("Consumable")
          }
          const u = await convertUnit(consUnit, deerTech, deerEquip)
            results.push(u)
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
      e.type === "TargetSpeedBoostResist"
    ) {
      stats[e.type] = 1 - 1 / e.amount
    } else {
      stats[e.type] = e.amount
    }
  })

  const u = {
    id: unit.name,
    name: findLang(stringtablex, unit.DisplayNameID),
    //types: unit.UnitType.filter(t => unitTypes.includes(t)),
    types: unit.UnitType,
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
