import { addUnitType } from "./unit_types.js"
import { addExtraUpgrade } from "./upgrades/build.js"

const effects = {}
const ignoredEffects = [
  "Enable",
  "Market",
  "TributePenalty",
  "UpdateVisual",
  "CostBuildingTechs",
  "CostBuildingAll",
  "ResourceTrickleRate",
  "Resource"
]

const ignoredTargets = ["TechAll"]

export function convertEffects(effects, civ, isAdvisor) {
  if (!Array.isArray(effects)) {
    effects = [effects]
  }
  const res = []
  for (let i = 0; i < effects.length; i++) {
    const e = effects[i]
    let type = e.subtype
    if (!type || ignoredEffects.includes(type)) {
      if (civ && e.type === "TechStatus") {
        if (e.status === "obtainable" && isAdvisor) {
          // Tech is not available through equipments.xml
          // so add it as extra upgrade for upgrades generation
          addExtraUpgrade(e.text, civ)
          res.push({
            type: "UnlockUpgrade",
            tech: e.text
          })
        } else if (e.status === "unobtainable") {
          res.push({
            type: "DisableUpgrade",
            tech: e.text
          })
        }
      }
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
        case "Repair":
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
    } else if (type === "Haste") {
      type = "AttackSpeed"
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
      if (ignoredTargets.includes(e.Target.type)) {
        continue
      }
      effect.target = e.Target.text
      addUnitType(e.Target.text)
    } else {
      effect.scaling = e.scaling
    }

    // The egyptian empower effects scale differently
    if (e.action === "Empower") {
      effect.amount = (effect.amount - 1) * 11 + 1
      if (effect.scaling !== undefined) {
        effect.scaling *= 11
      }
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
      icon: template.icon,
      sort: template.sort
    }

    if (template.lowerIsBetter) {
      effects[name].lowerIsBetter = true
    }
  }
}

export function getEffects() {
  return effects
}

export function duplicateEffects(effect, index, self) {
  return (
    index ===
    self.findIndex(e => e.type === effect.type && e.target === effect.target)
  )
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
    effectName === "BuildingWorkRate" ||
    effectName === "WorkRateRepair"
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
    effectName === "Trade" ||
    effectName === "WorkRateRepair"
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
  WorkRateSelfHeal: { name: "Regen. Rate", icon: "WorkRateSelfHeal", sort: 1 },
  GatherFood: { name: "Gathering Food", icon: "GatherFood", sort: 2 },
  GatherGold: { name: "Gathering Gold", icon: "GatherGold", sort: 8 },
  GatherTree: { name: "Gathering Wood", icon: "GatherTree", sort: 7 },
  GatherStone: { name: "Gathering Stone", icon: "GatherStone", sort: 9 },
  GatherHuntable: { name: "Gathering Huntable", icon: "GatherFood", sort: 3 },
  GatherHerdable: { name: "Gathering Herdable", icon: "GatherFood", sort: 4 },
  GatherAbstractFruit: { name: "Gathering Berries", icon: "Berry", sort: 2 },
  GatherAbstractFarm: { name: "Gathering Farms", icon: "GatherFood", sort: 5 },
  GatherAbstractFish: { name: "Gathering Fish", icon: "Fish", sort: 6 },
  YieldTree: { name: "Wood Conservation", icon: "YieldTree", sort: 17 },
  YieldGold: { name: "Gold Conservation", icon: "YieldGold", sort: 18 },
  YieldStone: { name: "Stone Conservation", icon: "YieldStone", sort: 19 },
  YieldAbstractFish: {
    name: "Fish Conservation",
    icon: "YieldAbstractFish",
    sort: 16
  },
  YieldHuntable: { name: "Huntable Conservation", icon: "TODO", sort: 15 },
  YieldAbstractFruit: {
    name: "Berry Bushes Conservation",
    icon: "YieldAbstractFruit",
    sort: 14
  },
  AutoGatherFood: { name: "Generating Food", icon: "GatherFood", sort: 10 },
  AutoGatherGold: { name: "Generating Gold", icon: "GatherGold", sort: 12 },
  AutoGatherTree: { name: "Generating Wood", icon: "GatherTree", sort: 11 },
  AutoGatherStone: { name: "Generating Stone", icon: "GatherStone", sort: 13 },
  CarryCapacityFood: {
    name: "Food Carrying Capacity",
    icon: "CarryCapacityFood",
    sort: 20
  },
  CarryCapacityWood: {
    name: "Wood Carrying Capacity",
    icon: "CarryCapacityWood",
    sort: 21
  },
  CarryCapacityGold: {
    name: "Gold Carrying Capacity",
    icon: "CarryCapacityGold",
    sort: 22
  },
  CarryCapacityStone: {
    name: "Stone Carrying Capacity",
    icon: "CarryCapacityStone",
    sort: 23
  },
  DamageArea: { name: "Splash Area", icon: "DamageArea", sort: 46 },
  AreaDamageReduction: {
    name: "Splash Damage Reduction",
    icon: "AreaDamageReduction",
    sort: 73
  },
  BuildingWorkRate: {
    name: "Train/Research Rate",
    icon: "BuildPoints",
    sort: 67
  },
  BuildPoints: {
    name: "Build Time",
    icon: "BuildPoints",
    sort: 81,
    lowerIsBetter: true
  },
  ConvertResist: {
    name: "Conversion Resistance",
    icon: "ConvertResist",
    sort: 74
  },
  CostAll: { name: "Cost", icon: "Cost", sort: 0, lowerIsBetter: true },
  CostFood: {
    name: "Food Cost",
    icon: "CostFood",
    sort: 0,
    lowerIsBetter: true
  },
  CostWood: {
    name: "Wood Cost",
    icon: "CostWood",
    sort: 0,
    lowerIsBetter: true
  },
  CostGold: {
    name: "Gold Cost",
    icon: "CostGold",
    sort: 0,
    lowerIsBetter: true
  },
  CostStone: {
    name: "Stone Cost",
    icon: "CostStone",
    sort: 0,
    lowerIsBetter: true
  },
  PopulationCount: {
    name: "Population",
    icon: "PopulationCount",
    sort: 0,
    lowerIsBetter: true
  },
  BuildLimit: { name: "Build Limit", icon: "BuildLimit", sort: 79 },
  Damage: { name: "Damage", icon: "DamageHand", sort: 0 },
  DamageMeleeAttack: { name: "Melee Damage", icon: "DamageHand", sort: 0 },
  DamageRangedAttack: { name: "Pierce Damage", icon: "DamageRanged", sort: 0 },
  DamageBonusReduction: {
    name: "Bonus Damage Protection",
    icon: "DamageBonusReduction",
    sort: 72
  },
  HitPercent: { name: "Critical Hit Chance", icon: "CriticalHit", sort: 30 },
  Hitpoints: { name: "Health", icon: "Hitpoints", sort: 0 },
  LOS: { name: "Line-of-sight", icon: "LOS", sort: 76 },
  MaximumRange: { name: "Maximum Range", icon: "MaximumRange", sort: 45 },
  MinimumRange: { name: "Minimum Range", icon: "MaximumRange", sort: 44 },
  MaximumRangeConvert: {
    name: "Maximum Conversion Range",
    icon: "MaximumRange",
    sort: 56
  },
  MaximumRangeChaos: {
    name: "Maximum Chaos Range",
    icon: "MaximumRange",
    sort: 57
  },
  MaximumRangeHeal: {
    name: "Maximum Healing Range",
    icon: "MaximumRange",
    sort: 60
  },
  MaximumVelocity: {
    name: "Movement Speed",
    icon: "MaximumVelocity",
    sort: 77
  },
  TargetSpeedBoost: {
    name: "Snare",
    icon: "TargetSpeedBoost",
    sort: 43,
    lowerIsBetter: true
  },
  TargetSpeedBoostResist: {
    name: "Snare Resist",
    icon: "SnareResist",
    sort: 75
  },
  TrainPoints: {
    name: "Train Time",
    icon: "BuildPoints",
    sort: 80,
    lowerIsBetter: true
  },
  ArmorRanged: { name: "Pierce Armor", icon: "ArmorRanged", sort: 69 },
  ArmorSiege: { name: "Crush Armor", icon: "ArmorSiege", sort: 71 },
  ArmorHand: { name: "Melee-Infantry Armor", icon: "ArmorHand", sort: 68 },
  ArmorCavalry: { name: "Melee-Cavalry Armor", icon: "ArmorCavalry", sort: 70 },
  ConvertStandardConvertable: {
    name: "Conversion Rate",
    icon: "ConvertStandardConvertable",
    sort: 48,
    lowerIsBetter: true
  },
  ConvertConvertableCavalry: {
    name: "Convert Cavalry Rate",
    icon: "ConvertStandardConvertable",
    sort: 49,
    lowerIsBetter: true
  },
  ConvertConvertableSiege: {
    name: "Convert Siege Rate",
    icon: "ConvertStandardConvertable",
    sort: 50,
    lowerIsBetter: true
  },
  ConvertConvertableInfantry: {
    name: "Convert Infantry Rate",
    icon: "ConvertStandardConvertable",
    sort: 51,
    lowerIsBetter: true
  },
  ChaosStandardConvertable: { name: "Chaos Rate", icon: "Chaos", sort: 52 },
  ChaosConvertableCavalry: {
    name: "Cavalry Chaos Rate",
    icon: "Chaos",
    sort: 53,
    lowerIsBetter: true
  },
  ChaosConvertableSiege: { name: "Siege Chaos Rate", icon: "Chaos", sort: 54 },
  ChaosConvertableInfantry: {
    name: "Infantry Chaos Rate",
    icon: "Chaos",
    sort: 55,
    lowerIsBetter: true
  },
  Trade: { name: "Trade", icon: "Cost", sort: 61 },
  RateHeal: { name: "Healing", icon: "RateHeal", sort: 58 },
  RateHealInCombat: { name: "Healing", icon: "RateHeal", sort: 59 },
  Build: {
    name: "Buildings Construction Speed",
    icon: "ConstructionSpeed",
    sort: 62
  },
  WorkRateRepair: {
    name: "Repair Speed",
    icon: "ConstructionSpeed",
    sort: 64
  },
  BuildWatchPost: {
    name: "Watch Post Construction Speed",
    icon: "WatchPostConstruction",
    sort: 63
  },
  EmpowerDropsite: {
    name: "Empower Dropoff",
    icon: "EmpowerDropsite",
    sort: 64
  },
  EmpowerActionTrain: {
    name: "Empower Train Rate",
    icon: "EmpowerActionTrain",
    sort: 65
  },
  EmpowerActionBuild: {
    name: "Empower Build Rate",
    icon: "EmpowerActionBuild",
    sort: 66
  },
  DamageBonusAbstractInfantry: {
    name: "Bonus vs. Infantry",
    icon: "DamageBonusAbstractInfantry",
    sort: 30
  },
  DamageBonusAbstractCavalry: {
    name: "Bonus vs. Cavalry",
    icon: "DamageBonusAbstractCavalry",
    sort: 31
  },
  DamageBonusBuilding: {
    name: "Bonus vs. Building",
    icon: "DamageBonusBuilding",
    sort: 35
  },
  DamageBonusShip: {
    name: "Bonus vs. Ship",
    icon: "DamageBonusShip",
    sort: 38
  },
  DamageBonusAbstractArcher: {
    name: "Bonus vs. Ranged",
    icon: "DamageBonusAbstractArcher",
    sort: 34
  },
  DamageBonusGr_Cav_Sarissophoroi: {
    name: "Bonus vs. Sarissophoroi",
    icon: "DamageBonusAbstractCavalry",
    sort: 32
  },
  DamageBonusUnitTypeBldgStorehouse: {
    name: "Bonus vs. Storehouse",
    icon: "DamageBonusBuilding",
    sort: 36
  },
  DamageBonusAbstractArtillery: {
    name: "Bonus vs. Siege",
    icon: "DamageBonusAbstractArtillery",
    sort: 37
  },
  DamageBonusHuntable: {
    name: "Bonus vs. Huntable",
    icon: "DamageBonusHuntable",
    sort: 39
  },
  DamageBonusUnitTypeVillager1: {
    name: "Bonus vs. Villager",
    icon: "DamageBonusUnitTypeVillager1",
    sort: 40
  },
  DamageBonusAbstractPriest: {
    name: "Bonus vs. Priests",
    icon: "DamageBonusAbstractPriest",
    sort: 41
  },
  DamageBonusEg_Cav_CamelRider: {
    name: "Bonus vs. Camel Rider",
    icon: "DamageBonusAbstractCavalry",
    sort: 33
  },
  AttackSpeed: { name: "Rate-of-fire", icon: "DamageOverTime", sort: 0 },
  DamageHand: { name: "Melee-Infantry DPS", icon: "DamageHand", sort: 24 },
  DamageRanged: { name: "Pierce DPS", icon: "DamageRanged", sort: 25 },
  DamageCavalry: { name: "Melee-Cavalry DPS", icon: "DamageCavalry", sort: 26 },
  DamageSiege: { name: "Crush DPS", icon: "DamageSiege", sort: 27 },
  DamageSiegeMeleeAttack: {
    name: "Melee Crush DPS",
    icon: "DamageSiege",
    sort: 28
  },
  DamageSiegeRangedAttack: {
    name: "Ranged Crush DPS",
    icon: "DamageSiege",
    sort: 29
  },
  MaximumContained: {
    name: "Transport Capacity",
    icon: "PopulationCount",
    sort: 78
  },
  AOERadius: {
    name: "Charge Attack Damage Area",
    icon: "DamageArea",
    sort: 47
  },
  ArmorVulnerability: {
    name: "Ignore Armor",
    icon: "ArmorVulnerability",
    sort: 42
  },
  UnlockUpgrade: {
    name: "Unlocks upgrade",
    icon: "NONE",
    sort: 0
  },
  DisableUpgrade: {
    name: "Disables upgrade",
    icon: "NONE",
    sort: 0
  }
}

function getTemplate(effectName) {
  if (templates[effectName]) {
    return templates[effectName]
  }
  throw `Effect '${effectName}' is not handled`
}
