import { addEffect } from "../effects.js"

export function convertUnitStats(unit) {
  const stats = {}
  if (unit.MaxHitpoints) {
    stats["Hitpoints"] = unit.MaxHitpoints
  }

  //Action effects and bonuses
  if (Array.isArray(unit.ProtoAction)) {
    for (let keyAction in unit.ProtoAction) {
      const action = unit.ProtoAction[keyAction]
      parseAction(action, stats)
    }
  } else if (unit.ProtoAction) {
    parseAction(unit.ProtoAction, stats)
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

  if (unit.TrainPoints) {
    stats.TrainPoints = unit.TrainPoints
  } else if (unit.BuildPoints) {
    stats.BuildPoints = unit.BuildPoints
  }

  if (unit.CarryCapacity) {
    // TODO ignore carry capacity on certain units (not villager)
    for (let i = 0; i < unit.CarryCapacity.length; i++) {
      const cap = unit.CarryCapacity[i]
      const resource =
        cap.resourcetype.charAt(0).toUpperCase() + cap.resourcetype.slice(1)
      stats["CarryCapacity" + resource] = cap.quantity
    }
  }

  // TODO tactics (snare, empower, build, other ?)
  // TODO empower rates
  // <rate type="Dropsite">1.112</rate>
  // <rate type="UnitTypeBldgEmpowerable">1.112</rate>
  // <rate type="ActionTrain">1.112</rate>
  // <rate type="ActionBuild">1.112</rate>

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
  return stats
}

export function parseAction(action, stats) {
  const ignoredEffects = [
    "GatherEconomic",
    "DamageBonusUnitTypeMobileStorehouse1",
    "DamageBonusDeer",
    "DamageBonusAntelope",
    "DamageBonusDeerAlpine",
    "DamageBonusCamel",
    "GatherCon_Res_BerryBush_C"
  ]

  const name = action.Name

  if (action.DamageType) {
    stats["Damage" + action.DamageType] = action.Damage
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
    }
  }

  if (action.DamageArea === 0) {
    delete stats["DamageArea"]
  } else if (action.DamageArea) {
    stats["DamageArea"] = action.DamageArea
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
    if (name === "Heal") {
      stats["Rate" + name] = action.Rate[0].amount
      stats["MaximumRange" + name] = action.MaxRange[0]
    } else if (name !== "MeleeAttack") {
      stats.MaximumRange = action.MaxRange[0]
    }
  }

  if (name === "Gather") {
    if (Array.isArray(action.Rate)) {
      for (let keyGather in action.Rate) {
        const gather = action.Rate[keyGather]
        if (ignoredEffects.indexOf(name + gather.type) === -1) {
          stats[name + gather.type] = gather.amount
        }
      }
    }
  } else if (name === "FishGather") {
    stats[name] = action.Rate[0].amount
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
