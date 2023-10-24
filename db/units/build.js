import { downloadImage, getUnits, getTechtree, getEquipments, getNuggets, getAdvisors } from "../api.js"
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

  const advisors = await getAdvisors()

  const resultsAdvisor = {}


  for (let i = 0; i < advisors.length; i++) {
    const a = advisors[i]
    if (a.techs.tech.startsWith("AdvisorUniqueUnit")) {
      const civ = convertCivilization(a)

      const advUnits = await convertAdvisorUnit(a)
      
      const civs = ["greek","egyptian","celtic","persian","babylonian","roman","norse"]

      if (civ === "undefined") {
        for (let i = 0; i < civs.length; i++) { 
          if (!resultsAdvisor[civs[i]]) {
            resultsAdvisor[civs[i]] = []   
          }      
          resultsAdvisor[civs[i]] = resultsAdvisor[civs[i]].concat(
            advUnits.filter(advUnit => !resultsAdvisor[civs[i]].some(u => u.id === advUnits.id))
          )
        }
      } else {
        if (!resultsAdvisor[civ]) {
          resultsAdvisor[civ] = []   
        }      
        resultsAdvisor[civ] = resultsAdvisor[civ].concat(
          advUnits.filter(advUnit => !resultsAdvisor[civ].some(u => u.id === advUnits.id))
        )
      }

    }
  }

  for (let civ in results) {
    results[civ].sort(compareUnits).sort(compareUnitTypes)
  }

  for (let civ in resultsCons) {
    resultsCons[civ].sort(compareUnits).sort(compareUnitTypes)
    results[civ] = results[civ].concat(resultsCons[civ])
  }

  for (let civ in resultsAdvisor) {
    resultsAdvisor[civ].sort(compareUnits).sort(compareUnitTypes)
    results[civ] = results[civ].concat(resultsAdvisor[civ])
  }
  
  return { front: results, server: await buildUnitsForServer(results) }
}


async function buildUnitsForServer(units) {
  console.log("Building units for server...")
  const apiUnits = await getUnits()
  const result = {}
  for (let civ in units) {civ
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
    if ((createUnit.text.startsWith("Con") && !createUnit.text.startsWith("Con_Spyglass") && !createUnit.text.startsWith("Con_Res_") )
        || createUnit.text === 'NPC_Halloween_HeadlessHorseman'
        || createUnit.text === 'NPC_Halloween_Unit_SoulGuardian'
        || createUnit.text === 'NPC_Halloween_Unit_EmeraldGuardian') {
      const consUnit = findByAttribute(units, "name", createUnit.text)
        if (consUnit) {
          deerTech.Effects.effect[0].target.text = createUnit.text
            for (let keyAction in consUnit.ProtoAction) {
              const action = consUnit.ProtoAction[keyAction]
              /*
              if (consUnit["Trait1"]){
                if (consUnit["Trait1"].startsWith("ConCommon"))   {action.Damage = action.Damage * 1.171}
                if (consUnit["Trait1"].startsWith("ConUncommon")) {action.Damage = action.Damage * 1.331}
                if (consUnit["Trait1"].startsWith("ConRare"))     {action.Damage = action.Damage * 1.551}
                if (consUnit["Trait1"].startsWith("ConEpic"))     {action.Damage = action.Damage * 1.821}
              }*/           
              if (consUnit.UnitType.includes("UnitUpgradeLevel13")) {action.Damage = action.Damage * 1.167}
              if (consUnit.UnitType.includes("UnitUpgradeLevel23")) {action.Damage = action.Damage * 1.255}
              if (consUnit.UnitType.includes("UnitUpgradeLevel33")) {action.Damage = action.Damage * 1.347}
              if (consUnit.UnitType.includes("UnitUpgradeLevel43")) {action.Damage = action.Damage * 1.43575} /* 1,4551 is implied when 43 levels....but for some reason that isnt the case.*/

              if (consUnit.UnitType.includes("UnitUpgrade1CraftedUncommon")) {action.Damage = action.Damage * 1.0598}
              if (consUnit.UnitType.includes("UnitUpgrade2Rare")) {action.Damage = action.Damage * 1.1496}
              if (consUnit.UnitType.includes("UnitUpgrade2Rare")) {action.Damage = action.Damage * 1.1496}
              if (consUnit.UnitType.includes("UnitUpgrade3Epic")) {action.Damage = action.Damage * 1.2693}
              
              if (consUnit.UnitType.includes("AbstractUniqueUnit")) {action.Damage = action.Damage * 1.15}
              
            }/*
            if (consUnit["Trait1"]){
              if (consUnit["Trait1"].startsWith("ConCommon"))   {consUnit.MaxHitpoints = consUnit.MaxHitpoints * 1.171}
              if (consUnit["Trait1"].startsWith("ConUncommon")) {consUnit.MaxHitpoints = consUnit.MaxHitpoints * 1.331}
              if (consUnit["Trait1"].startsWith("ConRare"))     {consUnit.MaxHitpoints = consUnit.MaxHitpoints * 1.551}
              if (consUnit["Trait1"].startsWith("ConEpic"))     {consUnit.MaxHitpoints = consUnit.MaxHitpoints * 1.821}
            }  */ 
            if (consUnit.UnitType.includes("UnitUpgradeLevel13")) {consUnit.MaxHitpoints = consUnit.MaxHitpoints * 1.167}
            if (consUnit.UnitType.includes("UnitUpgradeLevel23")) {consUnit.MaxHitpoints = consUnit.MaxHitpoints * 1.255}
            if (consUnit.UnitType.includes("UnitUpgradeLevel33")) {consUnit.MaxHitpoints = consUnit.MaxHitpoints * 1.347}
            if (consUnit.UnitType.includes("UnitUpgradeLevel43")) {consUnit.MaxHitpoints = consUnit.MaxHitpoints * 1.43575} /* 1,4551 is implied when 43 levels....but for some reason that isnt the case.*/

            if (consUnit.UnitType.includes("UnitUpgrade1CraftedUncommon")) {consUnit.MaxHitpoints = consUnit.MaxHitpoints * 1.0598}
            if (consUnit.UnitType.includes("UnitUpgrade2Rare")) {consUnit.MaxHitpoints = consUnit.MaxHitpoints * 1.1496}
            if (consUnit.UnitType.includes("UnitUpgrade2Rare")) {consUnit.MaxHitpoints = consUnit.MaxHitpoints * 1.1496}
            if (consUnit.UnitType.includes("UnitUpgrade3Epic")) {consUnit.MaxHitpoints = consUnit.MaxHitpoints * 1.2693}
            
            if (consUnit.UnitType.includes("AbstractUniqueUnit")) {consUnit.MaxHitpoints = consUnit.MaxHitpoints * 1.15}   
                        

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


async function convertAdvisorUnit(advisor) {
  const units = await getUnits()
  const techtree = await getTechtree()
  const equipments = await getEquipments()

  //Dummy for Consumable Units
  var deerTech = findByAttribute(techtree, "name", "Ce_Ct_UnitDeer1")
  const deerEquip = findByAttribute(equipments, "id", 653)

  const results = []
  

  const tech = findByAttribute(techtree, "name", advisor.techs.tech)
  if (tech) {
    
    const advUnit = findByAttribute(units, "name", tech.Effects.effect[0].target.text)
    if (advUnit) {
      advUnit.name = advUnit.name + "_a"
      deerTech.Effects.effect[0].target.text = advUnit.name
        for (let keyAction in advUnit.ProtoAction) {
          const action = advUnit.ProtoAction[keyAction]
          /*
          if (advUnit["Trait1"]){
            if (advUnit["Trait1"].startsWith("ConCommon"))   {action.Damage = action.Damage * 1.171}
            if (advUnit["Trait1"].startsWith("ConUncommon")) {action.Damage = action.Damage * 1.331}
            if (advUnit["Trait1"].startsWith("ConRare"))     {action.Damage = action.Damage * 1.551}
            if (advUnit["Trait1"].startsWith("ConEpic"))     {action.Damage = action.Damage * 1.821}
          } */           
          
          if (advUnit.UnitType.includes("UnitUpgradeLevel13")) {action.Damage = action.Damage * 1.167}
          if (advUnit.UnitType.includes("UnitUpgradeLevel23")) {action.Damage = action.Damage * 1.255}
          if (advUnit.UnitType.includes("UnitUpgradeLevel33")) {action.Damage = action.Damage * 1.347}
          if (advUnit.UnitType.includes("UnitUpgradeLevel43")) {action.Damage = action.Damage * 1.43575} /* 1,4551 is implied when 43 levels....but for some reason that isnt the case.*/

          if (advUnit.UnitType.includes("UnitUpgrade1CraftedUncommon")) {action.Damage = action.Damage * 1.0598}
          if (advUnit.UnitType.includes("UnitUpgrade2Rare")) {action.Damage = action.Damage * 1.1496}
          if (advUnit.UnitType.includes("UnitUpgrade2Rare")) {action.Damage = action.Damage * 1.1496}
          if (advUnit.UnitType.includes("UnitUpgrade3Epic")) {action.Damage = action.Damage * 1.2693}
          
          if (advUnit.UnitType.includes("AbstractUniqueUnit")) {action.Damage = action.Damage * 1.15}

        }
        /*
        if (advUnit["Trait1"]){
          if (advUnit["Trait1"].startsWith("ConCommon"))   {advUnit.MaxHitpoints = advUnit.MaxHitpoints * 1.171}
          if (advUnit["Trait1"].startsWith("ConUncommon")) {advUnit.MaxHitpoints = advUnit.MaxHitpoints * 1.331}
          if (advUnit["Trait1"].startsWith("ConRare"))     {advUnit.MaxHitpoints = advUnit.MaxHitpoints * 1.551}
          if (advUnit["Trait1"].startsWith("ConEpic"))     {advUnit.MaxHitpoints = advUnit.MaxHitpoints * 1.821}
        } */

        if (advUnit.UnitType.includes("UnitUpgradeLevel13")) {advUnit.MaxHitpoints = advUnit.MaxHitpoints * 1.167}
        if (advUnit.UnitType.includes("UnitUpgradeLevel23")) {advUnit.MaxHitpoints = advUnit.MaxHitpoints * 1.255}
        if (advUnit.UnitType.includes("UnitUpgradeLevel33")) {advUnit.MaxHitpoints = advUnit.MaxHitpoints * 1.347}
        if (advUnit.UnitType.includes("UnitUpgradeLevel43")) {advUnit.MaxHitpoints = advUnit.MaxHitpoints * 1.43575} /* 1,4551 is implied when 43 levels....but for some reason that isnt the case.*/

        if (advUnit.UnitType.includes("UnitUpgrade1CraftedUncommon")) {advUnit.MaxHitpoints = advUnit.MaxHitpoints * 1.0598}
        if (advUnit.UnitType.includes("UnitUpgrade2Rare")) {advUnit.MaxHitpoints = advUnit.MaxHitpoints * 1.1496}
        if (advUnit.UnitType.includes("UnitUpgrade2Rare")) {advUnit.MaxHitpoints = advUnit.MaxHitpoints * 1.1496}
        if (advUnit.UnitType.includes("UnitUpgrade3Epic")) {advUnit.MaxHitpoints = advUnit.MaxHitpoints * 1.2693}
        
        if (advUnit.UnitType.includes("AbstractUniqueUnit")) {advUnit.MaxHitpoints = advUnit.MaxHitpoints * 1.15}   

      delete advUnit["Trait1"]
      if (!advUnit.UnitType.includes("AdvisorUnit" + advisor.age.toString() + advisor.name)) {
        advUnit.UnitType.push("AdvisorUnit" + advisor.age.toString() + advisor.name)
      }
      const u = await convertUnit(advUnit, deerTech, deerEquip)
        results.push(u)
    }
  
  }

  return results
  
}


function convertCivilization(a) {
  if (!a.civilization) {
    return "undefined"
  }
  return a.civilization.replace("eCivMatchingType", "").toLowerCase()
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
