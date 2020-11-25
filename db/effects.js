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
      absolute: e.relativity === "Absolute", // TODO relativity == "Assign" is always when subtype is ActionEnable
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
  if (!effects[name]) {
    effects[name] = {
      name: getDisplayName(name),
      base: getBase(name),
      type: getType(name),
      icon: getIcon(name)
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
    effectName === "BuildWatchPost"
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
    effectName.startsWith("Convert") || // TODO conversion rate should be named conversion time (display like in-game or not?)
    effectName.startsWith("Chaos")
  ) {
    return "time" // ends with "s"
  }

  return "normal" // value displayed with prefix nor suffix
}

const displayNames = {
  ActionEnableBurningAttack: "Burning Damage over 8s",
  ActionEnableSelfHeal: "Enables Self-Heal Action",
  ActionEnableCharge: "Grants Charge Attack",
  ActionEnableHeal: "Grants Healing Action",
  ActionEnableMeleeAttack: "Grants Ability to Attack Mobile Units",
  ActionEnableRangedAttack: "Grants Ranged Attack",
  ActionEnableAreaHeal: "Grants Area Healing",
  ActionEnableMovementSpeedAuraVillager: "Grants Movement Speed Aura",
  ActionEnableAutoGather: "Generate 1 gold per second",
  WorkRateSelfHeal: "Regen. Rate",
  GatherFood: "Gathering Food",
  GatherGold: "Gathering Gold",
  GatherTree: "Gathering Wood",
  GatherStone: "Gathering Stone",
  GatherHuntable: "Gathering Huntable",
  GatherHerdable: "Gathering Herdable",
  GatherAbstractFruit: "Gathering Berries",
  GatherAbstractFarm: "Gathering Farms",
  GatherAbstractFish: "Gathering Fish",
  YieldTree: "Wood Conservation",
  YieldGold: "Gold Conservation",
  YieldStone: "Stone Conservation",
  YieldAbstractFish: "Fish Conservation",
  YieldHuntable: "Huntable Conservation",
  YieldAbstractFruit: "Berry Bushes Conservation",
  AutoGatherFood: "Generating Food",
  AutoGatherGold: "Generating Gold",
  AutoGatherTree: "Generating Wood",
  AutoGatherStone: "Generating Stone",
  CarryCapacityFood: "Food Carrying Capacity",
  CarryCapacityWood: "Wood Carrying Capacity",
  CarryCapacityGold: "Gold Carrying Capacity",
  CarryCapacityStone: "Stone Carrying Capacity",
  DamageArea: "Splash Area",
  AreaDamageReduction: "Splash Damage Reduction",
  BuildingWorkRate: "Train/Research Rate",
  BuildPoints: "Build Time",
  ConvertResist: "Conversion Resistance",
  CostAll: "Cost",
  CostFood: "Food Cost",
  CostWood: "Wood Cost",
  CostGold: "Gold Cost",
  CostStone: "Stone Cost",
  PopulationCount: "Population",
  BuildLimit: "Build Limit",
  Damage: "Damage",
  DamageMeleeAttack: "Melee Damage",
  DamageRangedAttack: "Pierce Damage",
  DamageBonusReduction: "Bonus Damage Protection",
  HitPercent: "Critical Hit Chance",
  Hitpoints: "Health",
  LOS: "Line-of-sight",
  MaximumRange: "Maximum Range",
  MinimumRange: "Minimum Range",
  MaximumRangeConvert: "Maximum Conversion Range",
  MaximumRangeHeal: "Maximum Healing Range",
  MaximumVelocity: "Movement Speed",
  TargetSpeedBoost: "Snare",
  TargetSpeedBoostResist: "Snare Resist",
  TrainPoints: "Train Time",
  ArmorRanged: "Pierce Armor",
  ArmorSiege: "Crush Armor",
  ArmorHand: "Melee-Infantry Armor",
  ArmorCavalry: "Melee-Cavalry Armor",
  ConvertStandardConvertable: "Conversion Rate",
  ConvertConvertableCavalry: "Convert Cavalry Rate",
  ConvertConvertableSiege: "Convert Siege Rate",
  ConvertConvertableInfantry: "Convert Infantry Rate",
  Trade: "Trade",
  RateHeal: "Healing (Out of Combat)",
  RateHealInCombat: "Healing",
  Build: "Buildings Construction Speed",
  BuildWatchPost: "Watch Post Construction Speed",
  EmpowerDropsite: "Empower Dropoff",
  EmpowerActionTrain: "Empower Train Rate",
  EmpowerActionBuild: "Empower Build Rate",
  DamageBonusAbstractInfantry: "Bonus vs. Infantry",
  DamageBonusAbstractCavalry: "Bonus vs. Cavalry",
  DamageBonusBuilding: "Bonus vs. Building",
  DamageBonusShip: "Bonus vs. Ship",
  DamageBonusAbstractArcher: "Bonus vs. Ranged",
  DamageBonusGr_Cav_Sarissophoroi: "Bonus vs. Sarissophoroi",
  DamageBonusUnitTypeBldgStorehouse: "Bonus vs. Storehouse",
  DamageBonusAbstractArtillery: "Bonus vs. Siege",
  DamageBonusHuntable: "Bonus vs. Huntable",
  DamageBonusUnitTypeVillager1: "Bonus vs. Villager",
  DamageBonusAbstractPriest: "Bonus vs. Priests",
  DamageBonusEg_Cav_CamelRider: "Bonus vs. Camel Rider",
  AttackSpeed: "Rate-of-fire",
  DamageHand: "Melee-Infantry DPS",
  DamageRanged: "Pierce DPS",
  DamageCavalry: "Melee-Cavalry DPS",
  DamageSiege: "Crush DPS",
  DamageSiegeMeleeAttack: "Melee Crush DPS",
  DamageSiegeRangedAttack: "Ranged Crush DPS",
  MaximumContained: "Transport Capacity",
  AOERadius: "Charge Attack Damage Area",
  ArmorVulnerability: "Ignore Armor"
  // TODO chaos
}

function getDisplayName(effectName) {
  if (displayNames[effectName]) {
    return displayNames[effectName]
  }
  throw `Effect '${effectName}' is not handled`
}

const icons = {
  ActionEnableBurningAttack: "NONE",
  ActionEnableSelfHeal: "WorkRateSelfHeal",
  ActionEnableCharge: "NONE",
  ActionEnableHeal: "WorkRateSelfHeal",
  ActionEnableMeleeAttack: "NONE",
  ActionEnableRangedAttack: "NONE",
  ActionEnableAreaHeal: "NONE",
  ActionEnableMovementSpeedAuraVillager: "MaximumVelocity",
  ActionEnableAutoGather: "Cost",
  WorkRateSelfHeal: "WorkRateSelfHeal",
  GatherFood: "GatherFood",
  GatherGold: "GatherGold",
  GatherTree: "GatherTree",
  GatherStone: "GatherStone",
  GatherHuntable: "GatherFood",
  GatherHerdable: "GatherFood",
  GatherAbstractFruit: "Berry",
  GatherAbstractFarm: "GatherFood",
  GatherAbstractFish: "Fish",
  YieldTree: "YieldTree",
  YieldGold: "YieldGold",
  YieldStone: "YieldStone",
  YieldAbstractFish: "YieldAbstractFish",
  YieldHuntable: "TODO",
  YieldAbstractFruit: "YieldAbstractFruit",
  AutoGatherFood: "GatherFood",
  AutoGatherGold: "GatherGold",
  AutoGatherTree: "GatherTree",
  AutoGatherStone: "GatherStone",
  CarryCapacityFood: "CarryCapacityFood",
  CarryCapacityWood: "CarryCapacityWood",
  CarryCapacityGold: "CarryCapacityGold",
  CarryCapacityStone: "CarryCapacityStone",
  DamageArea: "DamageArea",
  AreaDamageReduction: "AreaDamageReduction",
  BuildingWorkRate: "BuildPoints",
  BuildPoints: "BuildPoints",
  ConvertResist: "ConvertResist",
  CostAll: "Cost",
  CostFood: "CostFood",
  CostWood: "CostWood",
  CostGold: "CostGold",
  CostStone: "CostStone",
  PopulationCount: "PopulationCount",
  BuildLimit: "BuildLimit",
  Damage: "DamageHand",
  DamageMeleeAttack: "DamageHand",
  DamageRangedAttack: "DamageRanged",
  DamageBonusReduction: "DamageBonusReduction",
  HitPercent: "CriticalHit",
  Hitpoints: "Hitpoints",
  LOS: "LOS",
  MaximumRange: "MaximumRange",
  MinimumRange: "MaximumRange",
  MaximumRangeConvert: "MaximumRange",
  MaximumRangeHeal: "MaximumRange",
  MaximumVelocity: "MaximumVelocity",
  TargetSpeedBoost: "TargetSpeedBoost",
  TargetSpeedBoostResist: "SnareResist",
  TrainPoints: "BuildPoints",
  ArmorRanged: "ArmorRanged",
  ArmorSiege: "ArmorSiege",
  ArmorHand: "ArmorHand",
  ArmorCavalry: "ArmorCavalry",
  ConvertStandardConvertable: "ConvertStandardConvertable",
  ConvertConvertableCavalry: "ConvertStandardConvertable",
  ConvertConvertableSiege: "ConvertStandardConvertable",
  ConvertConvertableInfantry: "ConvertStandardConvertable",
  Trade: "Cost",
  RateHeal: "RateHeal",
  RateHealInCombat: "RateHeal",
  Build: "ConstructionSpeed",
  BuildWatchPost: "WatchPostConstruction",
  EmpowerDropsite: "EmpowerDropsite",
  EmpowerActionTrain: "EmpowerActionTrain",
  EmpowerActionBuild: "EmpowerActionBuild",
  DamageBonusAbstractInfantry: "DamageBonusAbstractInfantry",
  DamageBonusAbstractCavalry: "DamageBonusAbstractCavalry",
  DamageBonusBuilding: "DamageBonusBuilding",
  DamageBonusShip: "DamageBonusShip",
  DamageBonusAbstractArcher: "DamageBonusAbstractArcher",
  DamageBonusGr_Cav_Sarissophoroi: "DamageBonusAbstractCavalry",
  DamageBonusUnitTypeBldgStorehouse: "DamageBonusBuilding",
  DamageBonusAbstractArtillery: "DamageBonusAbstractArtillery",
  DamageBonusHuntable: "DamageBonusHuntable",
  DamageBonusUnitTypeVillager1: "DamageBonusUnitTypeVillager1",
  DamageBonusAbstractPriest: "DamageBonusAbstractPriest",
  DamageBonusEg_Cav_CamelRider: "DamageBonusAbstractCavalry",
  AttackSpeed: "DamageOverTime",
  DamageHand: "DamageHand",
  DamageRanged: "DamageRanged",
  DamageCavalry: "DamageCavalry",
  DamageSiege: "DamageSiege",
  DamageSiegeMeleeAttack: "DamageSiege",
  DamageSiegeRangedAttack: "DamageSiege",
  MaximumContained: "PopulationCount",
  AOERadius: "DamageArea",
  ArmorVulnerability: "ArmorVulnerability"
  // TODO chaos
}

function getIcon(effectName) {
  if (icons[effectName]) {
    return icons[effectName]
  }
  throw `Icon for effect '${effectName}' is not handled`
}
