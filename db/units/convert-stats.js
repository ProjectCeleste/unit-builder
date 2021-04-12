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

  if (unit.TrainPoints && unit.TrainPoints !== -1) {
    stats.TrainPoints = unit.TrainPoints
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
        .forEach(t => convertTactic(t, stats))
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
  addEffect("CostFood")
  addEffect("CostWood")
  addEffect("CostGold")
  addEffect("CostStone")
  return [stats, inactiveActions]
}

export function parseAction(action, stats, inactiveActions) {
  const ignoredEffects = [
    "DamageBonusUnitTypeMobileStorehouse1",
    "DamageBonusDeer",
    "DamageBonusAntelope",
    "DamageBonusDeerAlpine",
    "DamageBonusCamel",
    "GatherCon_Res_BerryBush_C"
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
        inactiveActions.push(actionName)
      }
    } else {
      let type = "Damage" + action.DamageType
      if (action.Name === "BurningAttack" || action.Name === "PoisonAttack") {
        type = name
      }
      stats[type] = action.Damage
      if (action.Active === 0) {
        inactiveActions.push(type)
      }
    }

    if (action.DamageArea === 0) {
      delete stats["DamageArea"]
    } else if (action.DamageArea) {
      stats["DamageArea"] = action.DamageArea
    }
  } else if (action.Damage) {
    const damageType = findDamageType(stats)
    if (damageType) {
      switch (name) {
        case "RangedAttack":
          stats[damageType] = action.Damage
          break
        case "MeleeAttack":
          stats[damageType] = action.Damage
          break
        // Other?
      }
      if (action.Active === 0) {
        inactiveActions.push(damageType.replace("Damage", ""))
      }
    }
  }

  if (action.DamageBonus) {
    if (Array.isArray(action.DamageBonus)) {
      for (let keyDmgBonus in action.DamageBonus) {
        const bonus = action.DamageBonus[keyDmgBonus]
        if (ignoredEffects.indexOf("DamageBonus" + bonus.type) === -1) {
          stats["DamageBonus" + bonus.type] = bonus.amount
        }
      }
    } else if (
      ignoredEffects.indexOf("DamageBonus" + action.DamageBonus.type) === -1
    ) {
      stats["DamageBonus" + action.DamageBonus.type] = action.DamageBonus.amount
    }
  }

  if (name === "Convert") {
    if (Array.isArray(action.Rate)) {
      for (let i = 0; i < action.Rate.length; i++) {
        const rate = action.Rate[i]

        if (rate.type === "StandardConvertable") {
          const range = action.MaxRange[i]

          stats[name + rate.type] = rate.amount
          stats["MaximumRangeConvert"] = range
        }
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
      }
    } else if (name !== "MeleeAttack") {
      stats.MaximumRange = action.MaxRange[0]
    }
  }

  if (action.MinRange) {
    stats.MinimumRange = action.MinRange
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
      inactiveActions.push(name)
    }
  } else if (name === "Build") {
    const rate = action.Rate[0]
    let type = "Build"
    if (rate.type === "UnitTypeBldgWatchPost") {
      type = "BuildWatchPost"
    }
    stats[type] = rate.amount
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

function convertTactic(tactic, stats) {
  switch (tactic.type) {
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
          stats.TargetSpeedBoost = snare
        }
      }
      if (
        tactic.name.text === "BurningAttack" ||
        tactic.name.text === "PoisonAttack"
      ) {
        if (tactic.active !== "1") {
          break
        }
        stats[tactic.name.text] =
          parseFloat(tactic.damageOverTimeDuration) *
          parseFloat(tactic.damageOverTimeRate)
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
    case "Heal":
      if (tactic.name.text === "SelfHeal") {
        if (tactic.active !== "1") {
          break
        }
        stats.WorkRateSelfHeal = parseFloat(tactic.rate[0].text)
        break
      }
      if (tactic.affectsTargetsInCombat === "") {
        const healType = "Rate" + tactic.name.text
        stats[healType + "InCombat"] = stats[healType]
        delete stats[healType]
      }
      if (tactic.aoeHealRadius) {
        stats[tactic.name.text + "Area"] = parseFloat(tactic.aoeHealRadius)
      }
      break
    case "Convert":
      if (tactic.anim === "Chaos") {
        stats.ChaosStandardConvertable = stats.ConvertStandardConvertable
        delete stats.ConvertStandardConvertable
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
