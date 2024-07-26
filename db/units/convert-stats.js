import { getTactics } from "../api.js"
import { addEffect } from "../effects.js"

const gatherStats = [
  "GatherGold",
  "GatherTree",
  "GatherStone",
  "GatherHuntable",
  "GatherHerdable",
  "GatherAbstractFruit",
  "GatherAbstractFarm",
  "GatherAbstractFish"
]

export async function convertUnitStats(unit) {
  const stats = {}
  const inactiveActions = []
  if (unit.MaxHitpoints) {
    stats["Hitpoints"] = unit.MaxHitpoints
  }

  //Action effects and bonuses
  if (Array.isArray(unit.ProtoAction)) {
    for (let keyAction in unit.ProtoAction) {
      const action = unit.ProtoAction[keyAction]
      parseAction(action, stats, inactiveActions)
    }
  } else if (unit.ProtoAction) {
    parseAction(unit.ProtoAction, stats, inactiveActions)
  }

  //Armor
  if (Array.isArray(unit.Armor)) {
    for (let keyArmor in unit.Armor) {
      const armor = unit.Armor[keyArmor]
      if (armor.value === 0) {
        delete stats["Armor" + armor.type]
      } else {
        stats["Armor" + armor.type] = armor.value
      }
    }
  } else if (unit.Armor) {
    if (unit.Armor.value === 0) {
      delete stats["Armor" + unit.Armor.type]
    } else {
      stats["Armor" + unit.Armor.type] = unit.Armor.value
    }
  }

  if (unit.LOS) {
    stats["LOS"] = unit.LOS
  }
    
  /*For Charge actions because they are not available on unit by default, sometimes can be upgraded*/

  if (unit.name === 'Ro_Inf_Centurion' || unit.name === 'Ro_Cav_Decurion') {
        stats["ConvertResist"] = 2
    }
    else if (unit.UnitType.includes('AbstractPriest') || 
            unit.UnitType.includes('AbstractArtillery')) {
            stats["ConvertResist"] = 2
    }
    else if (unit.UnitType.includes("ConvertableInfantry") || 
    unit.UnitType.includes("ConvertableCavalry") || 
    unit.UnitType.includes("ConvertableSiege") || 
    unit.UnitType.includes("ConvertableBuilding") || 
    unit.UnitType.includes("StandardConvertable")) {
      stats["ConvertResist"] = 1
    }
    else {
      stats["ConvertResist"] = 1000
  }
  if (unit.name === 'Eg_Spc_PriestSet' ) {
    /*stats["ChaosStandardConvertable"] = 10*/
    inactiveActions.push("MaximumRangeConvert")
    inactiveActions.push("MaximumRangeConvert2")
  }
    

  if (unit.MaxVelocity) {
    stats["MaximumVelocity"] = unit.MaxVelocity
  }

  if (unit.MaxContained) {
    stats["MaximumContained"] = unit.MaxContained
  }

  if (unit.BuildLimit && !unit.name.endsWith("_Bldg_TownCenter")) {
    stats["BuildLimit"] = unit.BuildLimit
  }

  if (unit.Train && stats["Build"] === undefined) {
    if (
      unit.Train.some(
        t =>
          t.name.startsWith("UnitTypeBldg") &&
          t.name !== "UnitTypeBldgWatchPost"
      )
    ) {
      stats["Build"] = 0
    }
  }
  if(unit.name.startsWith("Ce") && unit.UnitType.includes("Military")) {
    stats.AndrastaRiteBuff  = 1.15
    stats.RatisRiteBuff  = 1.5
    stats.RudiobusRiteBuff  = 1.15
  }

  if (unit.TrainPoints && unit.TrainPoints !== -1) {
    stats.TrainPoints = unit.TrainPoints
    if(unit.name.startsWith("Ba")){
      stats.Training_Garden4Age2  = unit.TrainPoints
      stats.Training_Garden8Age3  = unit.TrainPoints
      stats.Training_Garden12Age4  = unit.TrainPoints
    }
    if(unit.name.startsWith("Ce")){
      stats.DamaraRiteBuff  = 0.7
    }
  } else if (unit.BuildPoints && unit.BuildPoints !== -1) {
    stats.BuildPoints = unit.BuildPoints
  }

  if (unit.CarryCapacity && canCarry(stats)) {
    for (let i = 0; i < unit.CarryCapacity.length; i++) {
      const cap = unit.CarryCapacity[i]
      const resource =
        cap.resourcetype.charAt(0).toUpperCase() + cap.resourcetype.slice(1)
      stats["CarryCapacity" + resource] = cap.quantity
    }
  }

  if (unit.Tactics) {
    const tactics = await getTactics(unit.Tactics)
    if (tactics.action && tactics.tactic) {
      tactics.action
        .filter(a => {
          if (tactics.tactic.action.some(ta => ta.text === a.name.text)) {
            return true
          }
          return false
        })
        .forEach(t => convertTactic(t, stats, inactiveActions))
   }
  }

  stats.PopulationCount = unit.PopulationCount
  if (unit.Cost) {
    stats["CostFood"] = 0
    stats["CostWood"] = 0
    stats["CostGold"] = 0
    stats["CostStone"] = 0
    for (let i = 0; i < unit.Cost.length; i++) {
      const c = unit.Cost[i]
      const resource =
        c.resourcetype.charAt(0).toUpperCase() + c.resourcetype.slice(1)

      stats["Cost" + resource] = c.quantity
    }
  }

  for (let key in stats) {
    if (key !== "Cost") {
      addEffect(key)
    }
  }

  //add a default effects that are needed
  addEffect("CostFood")
  addEffect("CostWood")
  addEffect("CostGold")
  addEffect("CostStone")
  addEffect("DamageBonusAbstractArtilleryRangedAttack")
  addEffect("MaxDmgMaxContained")
  addEffect("CaravanGoldPerSec150")
  addEffect("CaravanGoldPerSec300")
  addEffect("CaravanGoldPerSec500")
  addEffect("CaravanGoldPerSec300_100")
  addEffect("CaravanGoldPerSec300_100_Carry")
  addEffect("CaravanGoldPerSec300_50")
  addEffect("CaravanGoldPerSec300_50_Carry")
  addEffect("CaravanGoldCoop")
  addEffect("FishBoatTimeToFish")
  addEffect("FishBoatTimeToTravel_100Size")
  addEffect("FishBoatFishPerSec_100Size")

  //Too much effort. I am going to just MeleeAttack the TA.
  if (unit.name === "No_Inf_ThrowingAxeman") {
    stats["DamageRanged"] = stats["DamageHand"]
    delete stats["DamageHand"]
  }
  if (unit.name.endsWith("Civ_Caravan") || unit.name.endsWith("Civ_UtilityBoat")) {
    stats["CaravanGoldPerSec150"] = 1
    stats["CaravanGoldPerSec300"] = 1
    stats["CaravanGoldPerSec500"] = 1
    stats["CaravanGoldCoop"] = 1.224744871
  }
  if (unit.name.endsWith("Civ_Caravan")) {
    stats["CaravanGoldPerSec300_50"] = 1
    stats["CaravanGoldPerSec300_50_Carry"] = 1
  }
  if (unit.name.endsWith("Civ_UtilityBoat")) {
    stats["CaravanGoldPerSec300_100"] = 1
    stats["CaravanGoldPerSec300_100_Carry"] = 1
  }
  if (unit.name.endsWith("Civ_FishingBoat")) {
    stats["FishBoatTimeToFish"] = 1
    stats["FishBoatTimeToTravel_100Size"] = 1
    stats["FishBoatFishPerSec_100Size"] = 1
  }
  
  //Microsoft does some scaling up to lvl 40
  if (unit.UnitType.includes("UnitTypeVillager1")) {
    if (stats["DamageHand"]) {stats["DamageHand"] = stats["DamageHand"] * 1.505}
    if (stats["DamageSiegeMeleeAttack"]) {stats["DamageSiegeMeleeAttack"] = stats["DamageSiegeMeleeAttack"] * 1.505}
  }
  
  if (unit.UnitType.includes("UnitTypeShipUtility1")) {
    stats["DamageRanged"] = stats["DamageRanged"] * 1.353
  }
  
  if (unit.UnitType.includes("UnitTypeShipFishing1")) {
    stats["DamageRanged"] = stats["DamageRanged"] * 1.353
  }

  if (unit.UnitType.includes("AbstractWall")) {
    stats["Hitpoints"] = stats["Hitpoints"] * 1.77
  }
   

  return [stats, inactiveActions]
}

export function parseAction(action, stats, inactiveActions) {
  const ignoredEffects = [
    "DamageBonusUnitTypeMobileStorehouse1",
    /*"DamageBonusDeerMeleeAttack",
    "DamageBonusAntelopeMeleeAttack",
    "DamageBonusDeerAlpineMeleeAttack",
    "DamageBonusCamelMeleeAttack",*/
    "GatherCon_Res_BerryBush_C",
    "DamageBonusAbstractInfantryPoisonAttack",
    "DamageBonusShipBurningAttack",
    "DamageBonusAbstractArtilleryBuildingAttack",
    "DamageBonusBuildingBuildingAttack"
  ]

  const name = action.Name
  if (action.DamageType) {
    if (action.DamageType === "Siege") {
      let actionName = name
      if (actionName === "ChopAttack" || actionName === "BuildingAttack") {
        actionName = "MeleeAttack"
      }
      stats["Damage" + action.DamageType + actionName] = action.Damage
      if (action.Active === 0) {
        inactiveActions.push("Damage" + action.DamageType + actionName)
      }
    } else {
      let type = "Damage" + action.DamageType
      if (action.Name === "BurningAttack" || action.Name === "PoisonAttack") {
        type = name
        /*
        inactiveActions.push(type)
        inactiveActions.push(type + "DamageOverTimeDuration")
        inactiveActions.push(type + "DamageOverTimeRate")
        */
      }
      stats[type] = action.Damage
      if (action.Active === 0) {
        inactiveActions.push(type)
        inactiveActions.push(type + "DamageOverTimeDuration")
        inactiveActions.push(type + "DamageOverTimeRate")
      }
    }

    if (action.DamageArea > 0) {
      stats[name + "DamageArea"] = action.DamageArea
      if (action.Active === 0) {
        inactiveActions.push(name + "DamageArea")
      }
    }

    
  } else if (action.Damage) {
    const damageType = findDamageType(stats)
    if (damageType) {
      switch (name) {
        case "RangedAttack":
        case "RangedAttack2":
          stats[damageType] = action.Damage
          break
        case "MeleeAttack":
          stats[damageType] = action.Damage
          break
        // Other?
      }
      if (action.Active === 0) {
        inactiveActions.push(damageType)
      }
    }
  }

  if (action.DamageBonus) {
    if (Array.isArray(action.DamageBonus)) {
      for (let keyDmgBonus in action.DamageBonus) {
        const bonus = action.DamageBonus[keyDmgBonus]
        if (ignoredEffects.indexOf("DamageBonus" + bonus.type + name) === -1) {
          stats["DamageBonus" + bonus.type + name] = bonus.amount
          if (action.Active === 0) {
            inactiveActions.push("DamageBonus" + bonus.type + name)
          }
        }
      }
      delete stats["DamageBonusAbstractArcherPoisonAttack"]
    } else if (
      ignoredEffects.indexOf("DamageBonus" + action.DamageBonus.type + name) === -1
    ) {
      stats["DamageBonus" + action.DamageBonus.type + name] = action.DamageBonus.amount
      if (action.Active === 0) {
        inactiveActions.push("DamageBonus" + action.DamageBonus.type + name)
      }
    }
    delete stats["DamageBonusAbstractArcherPoisonAttack"]
  }

  if (name === "Convert") {
    if (Array.isArray(action.Rate)) {
      for (let i = 0; i < action.Rate.length; i++) {
        const rate = action.Rate[i]

        /*if (rate.type === "StandardConvertable") {*/
          const range = action.MaxRange[i]

          stats[name + rate.type] = rate.amount
          stats["MaximumRangeConvert"] = range
        /*}*/
      }
    }
  } else if (action.MaxRange && action.MaxRange.length) {
    if (name === "Heal" || name === "AreaHeal") {
      stats["Rate" + name] = action.Rate[0].amount
      stats["MaximumRange" + name] = action.MaxRange[0]
      if (action.Active === 0) {
        inactiveActions.push("Rate" + name)
        inactiveActions.push("MaximumRange" + name)
        inactiveActions.push(name + "Area")
        inactiveActions.push("RateAreaHealInCombat")
      }
    } else if (name !== "MeleeAttack") {
      if (name === "RangedAttack2") {
        stats.MaximumRange2 = action.MaxRange[0]
        if (action.Active === 0) {
          inactiveActions.push("MaximumRange2")
        }
      } else if (name === "BurningAttack") {
        //do nothing
      } else {
        stats.MaximumRange = action.MaxRange[0]
        if (action.Active === 0) {
          inactiveActions.push("MaximumRange")
        }
      }
    }
    else if (name === "MeleeAttack") {
      /*if (action.MaxRange[0] > 1) {*/
        stats.MaximumRangeMeleeAttack = action.MaxRange[0]
        if (action.Active === 0) {
          inactiveActions.push("MaximumRangeMeleeAttack")
        }
     /* }*/
    }
  }

  if (action.MinRange) {
    stats.MinimumRange = action.MinRange
  }

  if (name === "SelfHeal") {
    stats.WorkRateSelfHeal = action.Rate[0].amount
  }

  if (name === "Sacrifice") {
    if (Array.isArray(action.Rate)) {
      for (let i = 0; i < action.Rate.length; i++) {
        const rate = action.Rate[i]
        stats["Sacrifice" + rate.type] = 1
      }
    }
  
  }

  if (name === "Gather") {
    if (Array.isArray(action.Rate)) {
      for (let keyGather in action.Rate) {
        const gather = action.Rate[keyGather]
        const gatherType = name + gather.type
        if (ignoredEffects.indexOf(gatherType) === -1) {
          if (gatherType === "GatherEconomic") {
            gatherStats
              .filter(e => !Object.keys(stats).includes(e))
              .forEach(e => {
                stats[e] = gather.amount
              })
          } else {
            stats[gatherType] = gather.amount
          }
        }
      }
    }
  } else if (name === "FishGather") {
    stats["GatherAbstractFish"] = action.Rate[0].amount
  } else if (name === "Trade") {
    const rate = action.Rate.find(
      r => r.type === "AbstractTownCenter" || r.type === "AbstractDock"
    )
    if (rate) {
      stats[name] = rate.amount
    }
  } else if (name === "AutoGather") {
    const rate = action.Rate[0]
    if (rate.type === "Wood") {
      stats["AutoGatherTree"] = rate.amount
    } else {
      stats["AutoGather" + rate.type] = rate.amount
    }
    if (action.Active === 0) {
      inactiveActions.push("AutoGatherTree")
      inactiveActions.push("AutoGather" + rate.type)
    }
  } else if (name === "Build") {
    const rate = action.Rate[0]
    let type = "Build"
    if (rate.type === "UnitTypeBldgWatchPost") {
      type = "BuildWatchPostOrBarracks"
      stats["Build"] = 0
      inactiveActions.push("Build")
    }
    else if (rate.type === "UnitTypeBldgBarracks") {
      type = "BuildWatchPostOrBarracks"
      stats["Build"] = 0
      inactiveActions.push("Build")
    }
    stats[type] = rate.amount
  } 
  else if (name === "Charge") {
    stats["ChargeAbility"] = action.Active
    inactiveActions.push("ChargeAbility")
  }


}

export function findDamageType(stats) {
  for (let key in stats) {
    if (
      key.indexOf("Damage") === 0 &&
      key.indexOf("DamageBonus") !== 0 &&
      key != "DamageArea"
    ) {
      return key
    }
  }
  return undefined
}

function convertTactic(tactic, stats, inactiveActions) {
  switch (tactic.type) {
    case "AutoRangedModify": {
          stats[tactic.name.text + tactic.modifyType + "Range"] =  parseFloat(tactic.maxRange)
          stats[tactic.name.text + tactic.modifyType] =  parseFloat(tactic.modifyMultiplier)
        
        if (tactic.active === "0"){
          inactiveActions.push(tactic.name.text + tactic.modifyType + "Range")
          inactiveActions.push(tactic.name.text + tactic.modifyType)
        }
      break
    }
    case "Empower":
      for (let i = 0; i < tactic.rate.length; i++) {
        const rate = tactic.rate[i]
        if (
          rate.type === "Dropsite" ||
          rate.type === "ActionTrain" ||
          rate.type === "ActionBuild"
        ) {
          stats[tactic.type + rate.type] = parseFloat(rate.text)
        }
      }
      break
    case "Attack":
      if (tactic.targetSpeedBoost) {
        const snare = parseFloat(tactic.targetSpeedBoost)
        if (snare !== 1) {
          stats["TargetSpeedBoost" + tactic.name.text] = snare
        }
      }
      if (tactic.hitPercentType === "CriticalAttack") {
        stats["HitPercentDamageMultiplier" + tactic.anim] = parseFloat(tactic.hitPercentDamageMultiplier)
      }
      if (tactic.anim === "RangedAttack" && stats["DamageRanged"]) {
          if (tactic.perfectAccuracy === "1") {
            stats["PerfectAccuracy"] = 1
          } else {
            stats["PerfectAccuracy"] = 0
          }
          if(inactiveActions.includes("DamageRanged")){
            inactiveActions.push("PerfectAccuracy")
          }
      }
      if (tactic.timer !== null) {
        stats["AttackCooldown" + tactic.anim] = parseFloat(tactic.timer)
      }
      if (tactic.activeIfContainsUnits === "1") {
        stats["AttackIfContainsUnits" + tactic.anim] = 1
        if(inactiveActions.includes("DamageRanged")){
          inactiveActions.push("AttackIfContainsUnits" + tactic.anim)
        }
      }
      if (tactic.scaleByContainedUnits === "1") {
        stats["ScaleByContainedUnits" + tactic.anim] = 1
        if (stats["MaximumContained"] ) {
          stats["MaxDmgMaxContained"] = stats["DamageRanged"] * stats["MaximumContained"] 
        } else {
          stats["MaxDmgMaxContained"] = stats["DamageRanged"] 
        }
        if(inactiveActions.includes("DamageRanged")){
          inactiveActions.push("MaxDmgMaxContained")
          inactiveActions.push("ScaleByContainedUnits" + tactic.anim)
        }
      }
      if (
        tactic.name.text === "BurningAttack" ||
        tactic.name.text === "PoisonAttack"
      ) {
        if (!stats[tactic.name.text]) {
          inactiveActions.push(tactic.name.text)
          inactiveActions.push(tactic.name.text + "DamageOverTimeDuration")
          inactiveActions.push(tactic.name.text + "DamageOverTimeRate")
        }
        stats[tactic.name.text] =
          parseFloat(tactic.damageOverTimeDuration) *
          parseFloat(tactic.damageOverTimeRate)
        stats[tactic.name.text + "DamageOverTimeDuration"] = parseFloat(tactic.damageOverTimeDuration)
        stats[tactic.name.text + "DamageOverTimeRate"] = parseFloat(tactic.damageOverTimeRate)
      }
      break
    case "Build": {
      const rate = tactic.rate.find(r => r.type === "UnitTypeBldgWatchPost")
      if (rate) {
        if (stats.BuildWatchPost !== undefined) {
          stats.BuildWatchPost = parseFloat(rate.text)
        }
      } else if (stats.Build !== undefined) {
        stats.Build = parseFloat(tactic.rate[0].text)
      }
      break
    }
    case "Charge": {

      if (!stats["ChargeAbility"]) {
        stats["ChargeAbility"] = 0
        inactiveActions.push("ChargeAbility")
        inactiveActions.push("ChargeDamageMultiplier")
        inactiveActions.push("ChargeRange")
        inactiveActions.push("ChargeSpeedBoost")
        inactiveActions.push("ChargeCooldown")
      } 
        stats["ChargeDamageMultiplier"] = parseFloat(tactic.damageBonus.text)
        stats["ChargeRange"] = parseFloat(tactic.maxRange)
        stats["ChargeSpeedBoost"] = parseFloat(tactic.targetSpeedBoost)
        stats["ChargeCooldown"] = parseFloat(tactic.timer)
        break
    }
    case "Heal":
      if (tactic.name.text === "SelfHeal") {
        if (tactic.active !== "1") {
          break
        }
        if (!stats.WorkRateSelfHeal) {
          stats.WorkRateSelfHeal = parseFloat(tactic.rate[0].text)
          break          
        }
      }
      if (tactic.affectsTargetsInCombat === "") {
        const healType = "Rate" + tactic.name.text
        if (tactic.active === "0") {
          inactiveActions.push(healType + "InCombat")
          inactiveActions.push("MaximumRange" + tactic.name.text)
        }
        if (!stats[healType]) {
          stats[healType] = parseFloat(tactic.rate[0].text)
          stats[healType + "InCombat"] = parseFloat(tactic.rate[0].text)
          stats["MaximumRange" + tactic.name.text] = parseFloat(tactic.maxRange)
        }
        stats[healType + "InCombat"] = stats[healType]
        delete stats[healType]
      }
      if (tactic.aoeHealRadius) {
        stats[tactic.name.text + "Area"] = parseFloat(tactic.aoeHealRadius)
      }
      if (tactic.damageBonus) {
        stats["HealdamageBonus" + tactic.damageBonus.type] = parseFloat(tactic.damageBonus.text)
      }
      break
    case "Convert": {
      if (tactic.anim === "Chaos") {
        stats.ChaosStandardConvertable = stats.ConvertStandardConvertable
        /*delete stats.ConvertStandardConvertable*/
        if (stats.ConvertConvertableCavalry !== undefined) {
          stats.ChaosConvertableCavalry = stats.ConvertConvertableCavalry
          delete stats.ConvertConvertableCavalry
        }
        if (stats.ConvertConvertableSiege !== undefined) {
          stats.ChaosConvertableSiege = stats.ConvertConvertableSiege
          delete stats.ConvertConvertableSiege
        }
        if (stats.ConvertConvertableInfantry !== undefined) {
          stats.ChaosConvertableInfantry = stats.ConvertConvertableInfantry
          delete stats.ConvertConvertableInfantry
        }
        if (stats.MaximumRangeConvert !== undefined) {
          stats.MaximumRangeChaos = stats.MaximumRangeConvert
          delete stats.MaximumRangeConvert
        }
      }

      else {
        if (Array.isArray(tactic.rate)) {
          for (let i = 0; i < tactic.rate.length; i++) {
            const rate = tactic.rate[i]

            if(tactic.active !== "0"){
              if (!stats[tactic.type + rate.type]){
                stats[tactic.type + rate.type] = parseFloat(rate.text)
              }
            }
          }
        }
      }
      break
    }
  }
}

function canCarry(stats) {
  for (let key in stats) {
    if (key.startsWith("Gather") || key === "Trade") {
      return true
    }
  }
  return false
}
