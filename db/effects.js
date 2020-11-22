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
    // TODO rate of fire (techtree:20931), call it "AttackSpeed"
    // TODO TargetSpeedBoostResist special case (100% instead of 1000%)
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
      type: getType(name)
    }
    // TODO lower is better for comparison
    // TODO effect icon
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
    effectName.startsWith("Build") ||
    effectName.startsWith("Gather") ||
    effectName.startsWith("Yield") ||
    effectName === "HitPercent" ||
    effectName === "ConvertResist" ||
    effectName === "AttackSpeed" ||
    effectName === "FishGather" ||
    effectName === "Trade"
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
    effectName === "FishGather" ||
    effectName === "BuildingWorkRate" ||
    effectName === "TargetSpeedBoost" ||
    effectName === "Build" ||
    effectName === "BuildWatchPost"
  ) {
    return "multiplier" // starts with "x"
  }
  if (
    effectName.startsWith("WorkRate") ||
    effectName.startsWith("AutoGather") ||
    effectName === "RateHeal"
  ) {
    return "persecond" // ends with "/s"
  }
  if (
    effectName === "TargetSpeedBoostResist" ||
    effectName === "AreaDamageReduction" ||
    effectName === "DamageBonusReduction" ||
    effectName.startsWith("Yield") ||
    effectName === "HitPercent" ||
    effectName === "ArmorVulnerability"
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
  FishGather: "Gathering Fish",
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
  RateHeal: "Healing",
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
