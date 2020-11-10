/**
 * Static mapping of effect subtypes to display names.
 */
const displayNames = {
  ActionEnable: "Enables Self-Heal Action",
  AreaDamageReduction: "Splash Damage Reduction",
  BuildingWorkRate: "Train/Research Rate",
  BuildPoints: "Build Time",
  ConvertResist: "Conversion Resistance",
  CostAll: "Cost",
  Damage: "Damage",
  DamageBonusReduction: "Bonus Damage Protection",
  HitPercent: "Critical Hit Chance",
  Hitpoints: "Health",
  LOS: "Line-of-sight",
  MaximumRange: "Maximum Range",
  MaximumVelocity: "Movement Speed",
  TargetSpeedBoost: "Snare",
  TargetSpeedBoostResist: "Snare Resist",
  TrainPoints: "Train Time"
}

/**
 * Returns the display name for an effect.
 */
export function convertEffectName(effect) {
  if (displayNames[effect.subtype]) {
    return displayNames[effect.subtype]
  }
  if (effect.subtype === "Armor") {
    if (effect.damagetype === "Ranged") {
      return "Pierce Armor"
    }
    if (effect.damagetype === "Siege") {
      return "Crush Armor"
    }
    if (effect.damagetype === "Hand") {
      return "Melee-Infantry Armor"
    }
    if (effect.damagetype === "Cavalry") {
      return "Melee-Cavalry Armor"
    }
  }
  if (effect.subtype === "WorkRate") {
    if (effect.action === "Gather") {
      if (
        effect.unittype === "AbstractFarm" ||
        effect.unittype === "AbstractFish" ||
        effect.unittype === "AbstractFruit" ||
        effect.unittype === "Fish" ||
        effect.unittype === "Herdable" ||
        effect.unittype === "Huntable"
      ) {
        return "Gathering Food"
      }
      if (effect.unittype === "Tree") {
        return "Gathering Wood"
      }
      if (effect.unittype === "Gold") {
        return "Gathering Gold"
      }
      if (effect.unittype === "Stone") {
        return "Gathering Stone"
      }
    }
    if (effect.action === "FishGather") {
      return "Gathering Food"
    }
    if (effect.action === "Convert") {
      if (effect.unittype === "ConvertableCavalry") {
        return "Convert Cavalry Rate"
      }
      if (effect.unittype === "ConvertableSiege") {
        return "Convert Siege Rate"
      }
      if (effect.unittype === "ConvertableInfantry") {
        return "Convert Infantry Rate"
      }
    }
    if (effect.action === "Trade") {
      return "Trade"
    }
    if (effect.action === "Heal") {
      return "Healing"
    }
    if (effect.action === "Build") {
      if (effect.unittype === "Building") {
        return "Buildings Construction Speed"
      }
      if (effect.unittype === "UnitTypeBldgWatchPost") {
        return "Watch Post Construction Speed"
      }
    }
    if (effect.action === "Empower") {
      if (effect.unittype === "Dropsite") {
        return "Empower Dropoff"
      }
      if (effect.unittype === "ActionTrain") {
        return "Empower Train Rate"
      }
      if (effect.unittype === "ActionBuild") {
        return "Empower Build Rate"
      }
    }
    if (effect.action === "SelfHeal") {
      return "Regen. Rate"
    }
  }
  if (effect.subtype === "DamageBonus") {
    if (effect.unittype === "AbstractInfantry") {
      return "Infantry Bonus Damage"
    }
    if (effect.unittype === "AbstractCavalry") {
      return "Cavalry Bonus Damage"
    }
    if (effect.unittype === "Building") {
      return "Building Bonus Damage"
    }
    if (effect.unittype === "Ship") {
      return "Ship Bonus Damage"
    }
    if (effect.unittype === "AbstractArcher") {
      return "Ranged Bonus Damage"
    }
  }

  throw new Error(JSON.stringify(effect, null, 2))
}
