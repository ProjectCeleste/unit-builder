const effects = {}

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
    effectName.startsWith("AutoGather")
  ) {
    return "persecond" // ends with "/s"
  }
  if (
    effectName === "TargetSpeedBoostResist" ||
    effectName === "AreaDamageReduction" ||
    effectName === "DamageBonusReduction" ||
    effectName === "HitPercent" ||
    effectName === "RateHeal"
  ) {
    return "percent" // ends with "%"
  }
  if (
    effectName === "TrainPoints" ||
    effectName === "BuildPoints" ||
    effectName.startsWith("Convert") // TODO conversion rate should be named conversion time (display like in-game or not?)
  ) {
    return "time" // ends with "s"
  }

  return "normal" // value displayed with prefix nor suffix
}

const displayNames = {
  ActionEnableBurningAttack: "Burning Damage over 8s",
  ActionEnableSelfHeal: "Enables Self-Heal Action", // TODO maybe hide self-heal
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
  DamageSiege: "Crush DPS"
  // TODO chaos
  // TODO damageOverTime
}

function getDisplayName(effectName) {
  if (displayNames[effectName]) {
    return displayNames[effectName]
  }
  throw `Effect '${effectName}' is not handled`
}
