import { addUnitType } from "./unit_types.js"

const effects = {}
const ignoredEffects = ["Enable", "Market", "TributePenalty", "UpdateVisual"]

export function convertEffects(effects) {
  const res = []
  for (let i = 0; i < effects.length; i++) {
    const e = effects[i]
    let type = e.subtype
    if (!type || ignoredEffects.includes(type)) {
      continue
    }

    if (type === "WorkRate") {
      switch (e.action) {
        case "Gather":
        case "AutoGather":
        case "Empower":
        case "Convert":
          if (e.unittype === "BerryBush") {
            type = e.action + "AbstractFruit"
          } else if (e.unittype === "Fish") {
            type = e.action + "AbstractFish"
          } else {
            type = e.action + e.unittype
          }
          break
        case "FishGather":
          type = "GatherAbstractFish"
          break
        case "Trade":
          type = e.action
          break
        case "Heal":
          type = "RateHeal"
          break
        case "SelfHeal":
          type += e.action
          break
        case "Build":
          type =
            e.unittype === "UnitTypeBldgWatchPost" ? "BuildWatchPost" : e.action
          break
      }
    } else if (type === "Damage") {
      switch (e.action) {
        case "MeleeAttack":
        case "RangedAttack":
          type += e.action
          break
        case undefined:
          break
        default:
          throw `Damage ${e.action} not handled`
      }
    } else if (type === "CarryCapacity") {
      type += e.resource.charAt(0).toUpperCase() + e.resource.slice(1)
    } else if (type === "Cost") {
      type += e.resource
    } else if (type === "DamageBonus" || type === "Yield") {
      type += e.unittype
    } else if (type === "Armor") {
      type += e.damagetype
    } else if (
      (type === "MaximumRange" && e.action !== "RangedAttack") ||
      type === "ActionEnable"
    ) {
      type += e.action
    }
    const effect = {
      type: type,
      visible: e.visible,
      absolute: e.relativity === "Absolute",
      positive: e.bonus,
      amount: e.amount
    }

    if (e.Target && e.Target.type !== "Player") {
      effect.target = e.Target.text
      addUnitType(e.Target.text)
    } else {
      effect.scaling = e.scaling
    }

    res.push(effect)
  }

  for (let key in res) {
    addEffect(res[key].type)
  }

  return res
}

export function addEffect(name) {
  if (name.startsWith("Convert") && name !== "ConvertResist") {
    addEffect(name.replace("Convert", "Chaos"))
  }
  if (!effects[name]) {
    const template = getTemplate(name)
    effects[name] = {
      name: template.name,
      base: getBase(name),
      type: getType(name),
      icon: template.icon
    }
    // TODO lower is better for comparison
    // TODO sort value
  }
}

export function getEffects() {
  return effects
}

function getBase(effectName) {
  return effectName.startsWith("DamageBonus") ||
    effectName.startsWith("TargetSpeedBoost") ||
    effectName.startsWith("Empower") ||
    effectName.startsWith("ActionEnable") ||
    effectName.startsWith("Gather") ||
    effectName.startsWith("Yield") ||
    effectName === "HitPercent" ||
    effectName === "ConvertResist" ||
    effectName === "AttackSpeed" ||
    effectName === "Trade" ||
    effectName === "BuildingWorkRate"
    ? 1
    : 0
}

function getType(effectName) {
  if (effectName.startsWith("ActionEnable")) {
    return "action" // No value displayed, just effect name
  }
  if (
    effectName.startsWith("DamageBonus") ||
    effectName.startsWith("Empower") ||
    effectName.startsWith("Gather") ||
    effectName === "BuildingWorkRate" ||
    effectName === "TargetSpeedBoost" ||
    effectName === "Build" ||
    effectName.startsWith("Yield") ||
    effectName === "BuildWatchPost" ||
    effectName === "Trade"
  ) {
    return "multiplier" // starts with "x"
  }
  if (
    effectName.startsWith("WorkRate") ||
    effectName.startsWith("AutoGather") ||
    effectName.startsWith("RateHeal")
  ) {
    return "persecond" // ends with "/s"
  }
  if (
    effectName === "TargetSpeedBoostResist" ||
    effectName === "AreaDamageReduction" ||
    effectName === "DamageBonusReduction" ||
    effectName === "HitPercent"
  ) {
    return "percent" // ends with "%"
  }
  if (
    effectName === "TrainPoints" ||
    effectName === "BuildPoints" ||
    (effectName.startsWith("Convert") && effectName !== "ConvertResist") ||
    effectName.startsWith("Chaos")
  ) {
    return "time" // ends with "s"
  }

  return "normal" // value displayed with prefix nor suffix
}

const templates = {
  ActionEnableBurningAttack: {
    name: "Burning Damage over 8s",
    icon: "NONE",
    sort: 0
  },
  ActionEnableSelfHeal: {
    name: "Enables Self-Heal Action",
    icon: "WorkRateSelfHeal",
    sort: 0
  },
  ActionEnableCharge: { name: "Grants Charge Attack", icon: "NONE", sort: 0 },
  ActionEnableHeal: {
    name: "Grants Healing Action",
    icon: "WorkRateSelfHeal",
    sort: 0
  },
  ActionEnableMeleeAttack: {
    name: "Grants Ability to Attack Mobile Units",
    icon: "NONE",
    sort: 0
  },
  ActionEnableRangedAttack: {
    name: "Grants Ranged Attack",
    icon: "NONE",
    sort: 0
  },
  ActionEnableAreaHeal: { name: "Grants Area Healing", icon: "NONE", sort: 0 },
  ActionEnableMovementSpeedAuraVillager: {
    name: "Grants Movement Speed Aura",
    icon: "NONMaximumVelocityE",
    sort: 0
  },
  ActionEnableAutoGather: {
    name: "Generate 1 gold per second",
    icon: "Cost",
    sort: 0
  },
  WorkRateSelfHeal: { name: "Regen. Rate", icon: "WorkRateSelfHeal", sort: 0 },
  GatherFood: { name: "Gathering Food", icon: "GatherFood", sort: 0 },
  GatherGold: { name: "Gathering Gold", icon: "GatherGold", sort: 0 },
  GatherTree: { name: "Gathering Wood", icon: "GatherTree", sort: 0 },
  GatherStone: { name: "Gathering Stone", icon: "GatherStone", sort: 0 },
  GatherHuntable: { name: "Gathering Huntable", icon: "GatherFood", sort: 0 },
  GatherHerdable: { name: "Gathering Herdable", icon: "GatherFood", sort: 0 },
  GatherAbstractFruit: { name: "Gathering Berries", icon: "Berry", sort: 0 },
  GatherAbstractFarm: { name: "Gathering Farms", icon: "GatherFood", sort: 0 },
  GatherAbstractFish: { name: "Gathering Fish", icon: "Fish", sort: 0 },
  YieldTree: { name: "Wood Conservation", icon: "YieldTree", sort: 0 },
  YieldGold: { name: "Gold Conservation", icon: "YieldGold", sort: 0 },
  YieldStone: { name: "Stone Conservation", icon: "YieldStone", sort: 0 },
  YieldAbstractFish: {
    name: "Fish Conservation",
    icon: "YieldAbstractFish",
    sort: 0
  },
  YieldHuntable: { name: "Huntable Conservation", icon: "TODO", sort: 0 },
  YieldAbstractFruit: {
    name: "Berry Bushes Conservation",
    icon: "YieldAbstractFruit",
    sort: 0
  },
  AutoGatherFood: { name: "Generating Food", icon: "GatherFood", sort: 0 },
  AutoGatherGold: { name: "Generating Gold", icon: "GatherGold", sort: 0 },
  AutoGatherTree: { name: "Generating Wood", icon: "GatherTree", sort: 0 },
  AutoGatherStone: { name: "Generating Stone", icon: "GatherStone", sort: 0 },
  CarryCapacityFood: {
    name: "Food Carrying Capacity",
    icon: "CarryCapacityFood",
    sort: 0
  },
  CarryCapacityWood: {
    name: "Wood Carrying Capacity",
    icon: "CarryCapacityWood",
    sort: 0
  },
  CarryCapacityGold: {
    name: "Gold Carrying Capacity",
    icon: "CarryCapacityGold",
    sort: 0
  },
  CarryCapacityStone: {
    name: "Stone Carrying Capacity",
    icon: "CarryCapacityStone",
    sort: 0
  },
  DamageArea: { name: "Splash Area", icon: "DamageArea", sort: 0 },
  AreaDamageReduction: {
    name: "Splash Damage Reduction",
    icon: "AreaDamageReduction",
    sort: 0
  },
  BuildingWorkRate: {
    name: "Train/Research Rate",
    icon: "BuildPoints",
    sort: 0
  },
  BuildPoints: { name: "Build Time", icon: "BuildPoints", sort: 0 },
  ConvertResist: {
    name: "Conversion Resistance",
    icon: "ConvertResist",
    sort: 0
  },
  CostAll: { name: "Cost", icon: "Cost", sort: 0 },
  CostFood: { name: "Food Cost", icon: "CostFood", sort: 0 },
  CostWood: { name: "Wood Cost", icon: "CostWood", sort: 0 },
  CostGold: { name: "Gold Cost", icon: "CostGold", sort: 0 },
  CostStone: { name: "Stone Cost", icon: "CostStone", sort: 0 },
  PopulationCount: { name: "Population", icon: "PopulationCount", sort: 0 },
  BuildLimit: { name: "Build Limit", icon: "BuildLimit", sort: 0 },
  Damage: { name: "Damage", icon: "DamageHand", sort: 0 },
  DamageMeleeAttack: { name: "Melee Damage", icon: "DamageHand", sort: 0 },
  DamageRangedAttack: { name: "Pierce Damage", icon: "DamageRanged", sort: 0 },
  DamageBonusReduction: {
    name: "Bonus Damage Protection",
    icon: "DamageBonusReduction",
    sort: 0
  },
  HitPercent: { name: "Critical Hit Chance", icon: "CriticalHit", sort: 0 },
  Hitpoints: { name: "Health", icon: "Hitpoints", sort: 0 },
  LOS: { name: "Line-of-sight", icon: "LOS", sort: 0 },
  MaximumRange: { name: "Maximum Range", icon: "MaximumRange", sort: 0 },
  MinimumRange: { name: "Minimum Range", icon: "MaximumRange", sort: 0 },
  MaximumRangeConvert: {
    name: "Maximum Conversion Range",
    icon: "MaximumRange",
    sort: 0
  },
  MaximumRangeChaos: {
    name: "Maximum Chaos Range",
    icon: "MaximumRange",
    sort: 0
  },
  MaximumRangeHeal: {
    name: "Maximum Healing Range",
    icon: "MaximumRange",
    sort: 0
  },
  MaximumVelocity: { name: "Movement Speed", icon: "MaximumVelocity", sort: 0 },
  TargetSpeedBoost: { name: "Snare", icon: "TargetSpeedBoost", sort: 0 },
  TargetSpeedBoostResist: {
    name: "Snare Resist",
    icon: "SnareResist",
    sort: 0
  },
  TrainPoints: { name: "Train Time", icon: "BuildPoints", sort: 0 },
  ArmorRanged: { name: "Pierce Armor", icon: "ArmorRanged", sort: 0 },
  ArmorSiege: { name: "Crush Armor", icon: "ArmorSiege", sort: 0 },
  ArmorHand: { name: "Melee-Infantry Armor", icon: "ArmorHand", sort: 0 },
  ArmorCavalry: { name: "Melee-Cavalry Armor", icon: "ArmorCavalry", sort: 0 },
  ConvertStandardConvertable: {
    name: "Conversion Rate",
    icon: "ConvertStandardConvertable",
    sort: 0
  },
  ConvertConvertableCavalry: {
    name: "Convert Cavalry Rate",
    icon: "ConvertStandardConvertable",
    sort: 0
  },
  ConvertConvertableSiege: {
    name: "Convert Siege Rate",
    icon: "ConvertStandardConvertable",
    sort: 0
  },
  ConvertConvertableInfantry: {
    name: "Convert Infantry Rate",
    icon: "ConvertStandardConvertable",
    sort: 0
  },
  ChaosStandardConvertable: { name: "Chaos Rate", icon: "Chaos", sort: 0 },
  ChaosConvertableCavalry: {
    name: "Cavalry Chaos Rate",
    icon: "Chaos",
    sort: 0
  },
  ChaosConvertableSiege: { name: "Siege Chaos Rate", icon: "Chaos", sort: 0 },
  ChaosConvertableInfantry: {
    name: "Infantry Chaos Rate",
    icon: "Chaos",
    sort: 0
  },
  Trade: { name: "Trade", icon: "Cost", sort: 0 },
  RateHeal: { name: "Healing", icon: "RateHeal", sort: 0 },
  RateHealInCombat: { name: "Healing", icon: "RateHeal", sort: 0 },
  Build: {
    name: "Buildings Construction Speed",
    icon: "ConstructionSpeed",
    sort: 0
  },
  BuildWatchPost: {
    name: "Watch Post Construction Speed",
    icon: "WatchPostConstruction",
    sort: 0
  },
  EmpowerDropsite: {
    name: "Empower Dropoff",
    icon: "EmpowerDropsite",
    sort: 0
  },
  EmpowerActionTrain: {
    name: "Empower Train Rate",
    icon: "EmpowerActionTrain",
    sort: 0
  },
  EmpowerActionBuild: {
    name: "Empower Build Rate",
    icon: "EmpowerActionBuild",
    sort: 0
  },
  DamageBonusAbstractInfantry: {
    name: "Bonus vs. Infantry",
    icon: "DamageBonusAbstractInfantry",
    sort: 0
  },
  DamageBonusAbstractCavalry: {
    name: "Bonus vs. Cavalry",
    icon: "DamageBonusAbstractCavalry",
    sort: 0
  },
  DamageBonusBuilding: {
    name: "Bonus vs. Building",
    icon: "DamageBonusBuilding",
    sort: 0
  },
  DamageBonusShip: { name: "Bonus vs. Ship", icon: "DamageBonusShip", sort: 0 },
  DamageBonusAbstractArcher: {
    name: "Bonus vs. Ranged",
    icon: "DamageBonusAbstractArcher",
    sort: 0
  },
  DamageBonusGr_Cav_Sarissophoroi: {
    name: "Bonus vs. Sarissophoroi",
    icon: "DamageBonusAbstractCavalry",
    sort: 0
  },
  DamageBonusUnitTypeBldgStorehouse: {
    name: "Bonus vs. Storehouse",
    icon: "DamageBonusBuilding",
    sort: 0
  },
  DamageBonusAbstractArtillery: {
    name: "Bonus vs. Siege",
    icon: "DamageBonusAbstractArtillery",
    sort: 0
  },
  DamageBonusHuntable: {
    name: "Bonus vs. Huntable",
    icon: "DamageBonusHuntable",
    sort: 0
  },
  DamageBonusUnitTypeVillager1: {
    name: "Bonus vs. Villager",
    icon: "DamageBonusUnitTypeVillager1",
    sort: 0
  },
  DamageBonusAbstractPriest: {
    name: "Bonus vs. Priests",
    icon: "DamageBonusAbstractPriest",
    sort: 0
  },
  DamageBonusEg_Cav_CamelRider: {
    name: "Bonus vs. Camel Rider",
    icon: "DamageBonusAbstractCavalry",
    sort: 0
  },
  AttackSpeed: { name: "Rate-of-fire", icon: "DamageOverTime", sort: 0 },
  DamageHand: { name: "Melee-Infantry DPS", icon: "DamageHand", sort: 0 },
  DamageRanged: { name: "Pierce DPS", icon: "DamageRanged", sort: 0 },
  DamageCavalry: { name: "Melee-Cavalry DPS", icon: "DamageCavalry", sort: 0 },
  DamageSiege: { name: "Crush DPS", icon: "DamageSiege", sort: 0 },
  DamageSiegeMeleeAttack: {
    name: "Melee Crush DPS",
    icon: "DamageSiege",
    sort: 0
  },
  DamageSiegeRangedAttack: {
    name: "Ranged Crush DPS",
    icon: "DamageSiege",
    sort: 0
  },
  MaximumContained: {
    name: "Transport Capacity",
    icon: "PopulationCount",
    sort: 0
  },
  AOERadius: { name: "Charge Attack Damage Area", icon: "DamageArea", sort: 0 },
  ArmorVulnerability: {
    name: "Ignore Armor",
    icon: "ArmorVulnerability",
    sort: 0
  }
}

function getTemplate(effectName) {
  if (templates[effectName]) {
    return templates[effectName]
  }
  throw `Effect '${effectName}' is not handled`
}
