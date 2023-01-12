import { addUnitType } from "./unit_types.js"
import { addExtraUpgrade } from "./upgrades/build.js"
import { findByAttribute } from "./utils.js"
import { getTechtree } from "./api.js"

const effects = {}
const ignoredEffects = [
  "Enable",
  "Market",
  "TributePenalty",
  "UpdateVisual",
  "CostBuildingTechs",
  "CostBuildingAll",
  "ResourceTrickleRate",
  "Resource",
  "PopulationCapExtra"
]

const ignoredTargets = ["TechAll"]

export async function convertEffects(effects, civ, isAdvisor) {
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
          if (e.text.startsWith("PersiaTechAdvisorBahram")) {
            const techtree = await getTechtree()
            const tech = findByAttribute(techtree, "name", e.text)
            if (tech) {
              const subeffects = await convertEffects(
                tech.Effects.effect,
                civ,
                isAdvisor
              )
              subeffects.forEach(e => res.push(e))
            }
          } else {
            // Tech is not available through equipments.xml
            // so add it as extra upgrade for upgrades generation
            addExtraUpgrade(e.text, civ)
            res.push({
              type: "UnlockUpgrade",
              tech: e.text
            })
          }
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
          } else if (e.unittype === "Wood") {
            type = e.action + "Tree"
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
          /*type =
            e.unittype === "UnitTypeBldgWatchPost" ? "BuildWatchPost" : e.action*/
            if(e.target.text === "UnitTypeScout1" || e.unittype === "UnitTypeBldgWatchPost")
            {
              type = "BuildWatchPostOrBarracks" 
            }
            else {
              type = e.action
            }
          break
        case "AreaHeal":
          continue
      }
    } else if (type === "Damage") {
      switch (e.action) {
        case "MeleeAttack":
        case "RangedAttack":
        case "RangedAttack2":
          type += e.action
          break
        case "PoisonAttack":
          type = e.action
          break
        case "BurningAttack":
          type = e.action
          break
        case "BuildingAttack":
          type += "MeleeAttack"
          break
        case undefined:
        case null:
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
      switch (e.action) {
        case "RangedAttack":
          type += "DamageRanged"
          break
        case "BurningAttack":
          type = "BurningAttack"
          break
        case "RangedAttack2":
          type += "DamageRanged2"
          break
      }
    } else if (type === "DamageBonusReduction") {
      type = "ArmorDamageBonus"
    } else if (type === "MaximumRange" && e.action == "RangedAttack2") {
      continue
    } else if (type === "MaximumRange" && e.action == "BurningAttack") {
      type = "MaximumRange"
    } else if (type === "DamageArea") {
      type = e.action + "DamageArea"
    } else if (
      (type === "MaximumRange" && !e.action.startsWith("RangedAttack")) ||
      type === "ActionEnable"
    ) {
      type += e.action
    }

    

    const effect = {
      type: type,
      visible: e.visible,
      absolute: e.relativity === "Absolute",
      positive: e.bonus,
      amount: parseFloat(e.amount)
    }

    if (e.relativity === "Assign") {
      effect.assign = true
    }

    if (e.target && e.target.type !== "Player") {
      if (ignoredTargets.includes(e.target.type)) {
        continue
      }
      if (type === "ConvertConvertableBuilding") {
        effect.target = "Eg_Spc_PriestPtah"
        addUnitType("Eg_Spc_PriestPtah")
      }
      else {
        effect.target = e.target.text
        addUnitType(e.target.text)
      }
    } else {
      effect.scaling = parseFloat(e.scaling)
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
  if (name.startsWith("Convert") && name !== "ConvertResist" && name !== "ConvertConvertableBuilding") {
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
    self.findIndex(
      e =>
        e.type === effect.type &&
        e.target === effect.target &&
        e.tech === effect.tech
    )
  )
}

function getBase(effectName) {
  return effectName.startsWith("DamageBonus") ||
    effectName.startsWith("Empower") ||
    effectName.startsWith("ActionEnable") ||
    effectName.startsWith("Gather") ||
    effectName.startsWith("Yield") ||
    effectName.startsWith("AttackSpeed") ||
    effectName === "HitPercent" ||
    effectName === "TargetSpeedBoost" ||
    effectName === "ConvertResist" ||
    effectName === "Trade" ||
    effectName === "BuildingWorkRate" ||
    effectName === "WorkRateRepair" ||
    effectName === "HitPercentDamageMultiplier" ||
    effectName.startsWith("Charge")
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
    effectName === "WorkRateRepair" ||
    effectName === "HitPercentDamageMultiplier" ||
    effectName === "ChargeDamageMultiplier" ||
    effectName === "ChargeSpeedBoost"
  ) {
    return "multiplier" // starts with "x"
  }
  if (
    effectName.startsWith("WorkRate") ||
    effectName.startsWith("AutoGather") ||
    effectName.startsWith("RateHeal") ||
    effectName.startsWith("RateAreaHeal")
  ) {
    return "persecond" // ends with "/s"
  }
  if (effectName === "HitPercent") {
    return "percent" // ends with "%"
  }
  if (effectName === "ChargeRange") {
    return "normal" // ends with "%"
  }
  if (
    effectName === "TrainPoints" ||
    effectName === "BuildPoints" ||
    (effectName.startsWith("Convert") && effectName !== "ConvertResist") ||
    effectName.startsWith("Chaos")
  ) {
    return "time" // ends with "s"
  }

  return "normal" // value displayed with neither prefix nor suffix
}

const templates = {
  ActionEnablePoisonAttack: { name: "Poison Attack", icon: "NONE", sort: 0 },
  ActionEnableSpawnDeer_C: {
    name: "Spawn Sacred Deer every 30s",
    icon: "NONE",
    sort: 0
  },
  ActionEnableSpawnDeer_U: {
    name: "Spawn Sacred Deer every 25s",
    icon: "NONE",
    sort: 0
  },
  ActionEnableSpawnDeer_R: {
    name: "Spawn Sacred Deer every 20s",
    icon: "NONE",
    sort: 0
  },
  ActionEnableSpawnDeer_E: {
    name: "Spawn Sacred Deer every 15s",
    icon: "NONE",
    sort: 0
  },
  ActionEnableSpawnSheep_C: {
    name: "Spawn Sheep every 30s",
    icon: "NONE",
    sort: 0
  },
  ActionEnableSpawnSheep_U: {
    name: "Spawn Sheep every 25s",
    icon: "NONE",
    sort: 0
  },
  ActionEnableSpawnSheep_R: {
    name: "Spawn Sheep every 20s",
    icon: "NONE",
    sort: 0
  },
  ActionEnableSpawnSheep_E: {
    name: "Spawn Sheep every 15s",
    icon: "NONE",
    sort: 0
  },
  ActionEnableServilia_C: {
    name: "Increase Villagers and Caravan Speed by 4%",
    icon: "NONE",
    sort: 0
  },
  ActionEnableServilia_U: {
    name: "Increase Villagers and Caravan Speed by 6%",
    icon: "NONE",
    sort: 0
  },
  ActionEnableServilia_R: {
    name: "Increase Villagers and Caravan Speed by 8%",
    icon: "NONE",
    sort: 0
  },
  ActionEnableServilia_E: {
    name: "Increase Villagers and Caravan Speed by 10%",
    icon: "NONE",
    sort: 0
  },
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
  ActionEnableRangedAttack2: {
    name: "Grants Special Building Attack",
    icon: "NONE",
    sort: 0
  },
  ActionEnableAreaHeal: { name: "Grants Area Healing", icon: "NONE", sort: 0 },
  ActionEnableMovementSpeedAuraVillager: {
    name: "Grants Movement Speed Aura",
    icon: "MaximumVelocity",
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
  YieldTree: { name: "Wood Conservation", icon: "YieldTree", sort: 18 },
  YieldGold: { name: "Gold Conservation", icon: "YieldGold", sort: 19 },
  YieldStone: { name: "Stone Conservation", icon: "YieldStone", sort: 20 },
  YieldAbstractFish: {
    name: "Fish Conservation",
    icon: "YieldAbstractFish",
    sort: 17
  },
  YieldHuntable: {
    name: "Huntable Conservation",
    icon: "YieldHuntable",
    sort: 16
  },
  YieldHerdable: {
    name: "Herdable Conservation",
    icon: "YieldHerdable",
    sort: 15
  },
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
    sort: 21
  },
  CarryCapacityWood: {
    name: "Wood Carrying Capacity",
    icon: "CarryCapacityWood",
    sort: 22
  },
  CarryCapacityGold: {
    name: "Gold Carrying Capacity",
    icon: "CarryCapacityGold",
    sort: 23
  },
  CarryCapacityStone: {
    name: "Stone Carrying Capacity",
    icon: "CarryCapacityStone",
    sort: 24
  },
  DamageArea: { name: "Splash Area", icon: "DamageArea", sort: 51 },
  RangedAttackDamageArea: { name: "Ranged Splash Area", icon: "DamageArea", sort: 51 },
  MeleeAttackDamageArea: { name: "Melee Splash Area", icon: "DamageArea", sort: 51 },
  BurningAttackDamageArea: { name: "Burning Splash Area", icon: "DamageArea", sort: 52 },
  RangedAttack2DamageArea: { name: "Special Building Attack Splash Area", icon: "DamageArea", sort: 52 },
  AreaDamageReduction: {
    name: "Splash Damage Reduction",
    icon: "AreaDamageReduction",
    sort: 81
  },
  BuildingWorkRate: {
    name: "Train/Research Rate",
    icon: "BuildPoints",
    sort: 75
  },
  BuildPoints: {
    name: "Build Time",
    icon: "BuildPoints",
    sort: 100,
    lowerIsBetter: true
  },
  ConvertResist: {
    name: "Conversion Resistance",
    icon: "ConvertResist",
    sort: 82
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
  BuildLimit: { name: "Build Limit", icon: "BuildLimit", sort: 87 },
  Damage: { name: "Damage", icon: "DamageHand", sort: 0 },
  DamageMeleeAttack: { name: "Melee Damage", icon: "DamageHand", sort: 0 },
  DamageRangedAttack: { name: "Pierce Damage", icon: "DamageRanged", sort: 0 },
  PoisonAttack: { name: "Damage Over Time", icon: "DamageOverTime", sort: 45 },
  BurningAttack: { name: "Damage Over Time", icon: "DamageOverTime", sort: 46 },
  ArmorDamageBonus: {
    name: "Bonus Damage Protection",
    icon: "DamageBonusReduction",
    sort: 80
  },
  HitPercent: { name: "Critical Hit Chance", icon: "CriticalHit", sort: 31 },
  HitPercentDamageMultiplier: {
    name: "Critical Hit Damage",
    icon: "CriticalHit",
    sort: 32
  },
  Hitpoints: { name: "Health", icon: "Hitpoints", sort: 0 },
  LOS: { name: "Line-of-sight", icon: "LOS", sort: 84 },
  MaximumRange: { name: "Maximum Range", icon: "MaximumRange", sort: 50 },
  MaximumRangeBurningAttack: {
    name: "Maximum Range",
    icon: "MaximumRange",
    sort: 50
  },
  MaximumRange2: {
    name: "Special Building Attack Max Range",
    icon: "MaximumRange",
    sort: 50
  },
  MinimumRange: { name: "Minimum Range", icon: "MaximumRange", sort: 49 },
  MaximumRangeConvert: {
    name: "Maximum Conversion Range",
    icon: "MaximumRange",
    sort: 62
  },
  MaximumRangeChaos: {
    name: "Maximum Chaos Range",
    icon: "MaximumRange",
    sort: 63
  },
  MaximumRangeHeal: {
    name: "Maximum Healing Range",
    icon: "MaximumRange",
    sort: 67
  },
  MaximumRangeAreaHeal: {
    name: "Maximum Healing Range",
    icon: "MaximumRange",
    sort: 67
  },
  MaximumVelocity: {
    name: "Movement Speed",
    icon: "MaximumVelocity",
    sort: 85
  },
  TargetSpeedBoost: {
    name: "Snare",
    icon: "TargetSpeedBoost",
    sort: 48,
    lowerIsBetter: true
  },
  TargetSpeedBoostResist: {
    name: "Snare Resist",
    icon: "SnareResist",
    sort: 83
  },
  TrainPoints: {
    name: "Train Time",
    icon: "BuildPoints",
    sort: 88,
    lowerIsBetter: true
  },
  ArmorRanged: { name: "Pierce Armor", icon: "ArmorRanged", sort: 77 },
  ArmorSiege: { name: "Crush Armor", icon: "ArmorSiege", sort: 79 },
  ArmorHand: { name: "Melee-Infantry Armor", icon: "ArmorHand", sort: 76 },
  ArmorCavalry: { name: "Melee-Cavalry Armor", icon: "ArmorCavalry", sort: 78 },
  ConvertStandardConvertable: {
    name: "Conversion Rate",
    icon: "ConvertStandardConvertable",
    sort: 53,
    lowerIsBetter: true
  },
  ConvertConvertableCavalry: {
    name: "Convert Cavalry Rate",
    icon: "ConvertStandardConvertable",
    sort: 54,
    lowerIsBetter: true
  },
  ConvertConvertableSiege: {
    name: "Convert Siege Rate",
    icon: "ConvertStandardConvertable",
    sort: 55,
    lowerIsBetter: true
  },
  ConvertConvertableInfantry: {
    name: "Convert Infantry Rate",
    icon: "ConvertStandardConvertable",
    sort: 56,
    lowerIsBetter: true
  },
  ChaosStandardConvertable: { name: "Chaos Rate", icon: "Chaos", sort: 57 },
  ChaosConvertableCavalry: {
    name: "Cavalry Chaos Rate",
    icon: "Chaos",
    sort: 58,
    lowerIsBetter: true
  },
  ChaosConvertableSiege: { name: "Siege Chaos Rate", icon: "Chaos", sort: 59 },
  ChaosConvertableInfantry: {
    name: "Infantry Chaos Rate",
    icon: "Chaos",
    sort: 60,
    lowerIsBetter: true
  },
  ConvertConvertableBuilding: {
    name: "Convert Building Rate",
    icon: "ConvertStandardConvertable",
    sort: 61,
    lowerIsBetter: true
  },
  Trade: { name: "Trade", icon: "Cost", sort: 68 },
  RateHeal: { name: "Healing", icon: "RateHeal", sort: 64 },
  RateAreaHeal: { name: "Healing", icon: "RateHeal", sort: 64 },
  RateHealInCombat: { name: "Healing", icon: "RateHeal", sort: 65 },
  RateAreaHealInCombat: { name: "Healing", icon: "RateHeal", sort: 65 },
  HealArea: { name: "Healing Area", icon: "HealArea", sort: 66 },
  AreaHealArea: { name: "Healing Area", icon: "HealArea", sort: 66 },
  Build: {
    name: "Buildings Construction Speed",
    icon: "ConstructionSpeed",
    sort: 69
  },
  WorkRateRepair: { name: "Repair Speed", icon: "ConstructionSpeed", sort: 71 },
  BuildWatchPostOrBarracks: {
    name: "Watch Post Construction Speed",
    icon: "WatchPostConstruction",
    sort: 70
  },
  EmpowerDropsite: {
    name: "Empower Dropoff",
    icon: "EmpowerDropsite",
    sort: 72
  },
  EmpowerActionTrain: {
    name: "Empower Train Rate",
    icon: "EmpowerActionTrain",
    sort: 73
  },
  EmpowerActionBuild: {
    name: "Empower Build Rate",
    icon: "EmpowerActionBuild",
    sort: 74
  },
  DamageBonusAbstractInfantry: {
    name: "Bonus vs. Infantry",
    icon: "DamageBonusAbstractInfantry",
    sort: 33
  },
  DamageBonusAbstractCavalry: {
    name: "Bonus vs. Cavalry",
    icon: "DamageBonusAbstractCavalry",
    sort: 34
  },
  DamageBonusBuilding: {
    name: "Bonus vs. Building",
    icon: "DamageBonusBuilding",
    sort: 38
  },
  DamageBonusShip: {
    name: "Bonus vs. Ship",
    icon: "DamageBonusShip",
    sort: 41
  },
  DamageBonusAbstractArcher: {
    name: "Bonus vs. Ranged",
    icon: "DamageBonusAbstractArcher",
    sort: 37
  },
  DamageBonusGr_Cav_Sarissophoroi: {
    name: "Bonus vs. Sarissophoroi",
    icon: "DamageBonusAbstractCavalry",
    sort: 35
  },
  DamageBonusUnitTypeBldgStorehouse: {
    name: "Bonus vs. Storehouse",
    icon: "DamageBonusBuilding",
    sort: 39
  },
  DamageBonusAbstractArtillery: {
    name: "Bonus vs. Siege",
    icon: "DamageBonusAbstractArtillery",
    sort: 40
  },
  DamageBonusHuntable: {
    name: "Bonus vs. Huntable",
    icon: "DamageBonusHuntable",
    sort: 42
  },
  DamageBonusUnitTypeVillager1: {
    name: "Bonus vs. Villager",
    icon: "DamageBonusUnitTypeVillager1",
    sort: 43
  },
  DamageBonusAbstractPriest: {
    name: "Bonus vs. Priests",
    icon: "DamageBonusAbstractPriest",
    sort: 44
  },
  DamageBonusEg_Cav_CamelRider: {
    name: "Bonus vs. Camel Rider",
    icon: "DamageBonusAbstractCavalry",
    sort: 36
  },
  AttackSpeed: { name: "Attack Rate", icon: "DamageOverTime", sort: 0 },
  AttackSpeedDamageRanged: {
    name: "Ranged Attack Rate",
    icon: "DamageOverTime",
    sort: 0
  },
  AttackSpeedDamageRanged2: {
    name: "Special Building Ranged Attack Rate",
    icon: "DamageOverTime",
    sort: 0
  },
  DamageHand: { name: "Melee-Infantry DPS", icon: "DamageHand", sort: 25 },
  DamageRanged: { name: "Pierce DPS", icon: "DamageRanged", sort: 26 },
  DamageCavalry: { name: "Melee-Cavalry DPS", icon: "DamageCavalry", sort: 27 },
  DamageSiege: { name: "Crush DPS", icon: "DamageSiege", sort: 28 },
  DamageSiegeMeleeAttack: {
    name: "Melee Crush DPS",
    icon: "DamageSiege",
    sort: 29
  },
  DamageSiegeRangedAttack: {
    name: "Ranged Crush DPS",
    icon: "DamageSiege",
    sort: 30
  },
  DamageSiegeRangedAttack2: {
    name: "Special Building Attack Crush DPS",
    icon: "DamageSiege",
    sort: 30
  },
  MaximumContained: {
    name: "Transport Capacity",
    icon: "PopulationCount",
    sort: 86
  },
  AOERadius: {
    name: "Charge Attack Damage Area",
    icon: "DamageArea",
    sort: 93
  },
  ArmorVulnerability: {
    name: "Ignore Armor",
    icon: "ArmorVulnerability",
    sort: 47
  },
  UnlockUpgrade: { name: "Unlocks upgrade", icon: "NONE", sort: 0 },
  DisableUpgrade: { name: "Disables upgrade", icon: "NONE", sort: 0 },
  ChargeAbility: {
    name: "Can Charge",
    icon: "Chaos",
    sort: 89
  },
  ChargeDamageMultiplier: {
    name: "Charge Damage Multiplier",
    icon: "Chaos",
    sort: 89
  },
  ChargeRange: {
    name: "Charge Range",
    icon: "LOS",
    sort: 90
  },
  ChargeSpeedBoost: {
    name: "Charge Speed Bonus",
    icon: "MaximumVelocity",
    sort: 91
  },
  ChargeCooldown: {
    name: "Charge Cooldown",
    icon: "BuildPoints",
    sort: 92
  }
}

function getTemplate(effectName) {
  if (templates[effectName]) {
    return templates[effectName]
  }
  throw `Effect '${effectName}' is not handled`
}
