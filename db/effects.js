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
  /*"CostBuildingTechs",*/
  "CostBuildingAll",
  "ResourceTrickleRate",
  "Resource",
  "PopulationCapExtra"
]

/*const ignoredTargets = ["TechAll"]*/

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
      /*if (e.type === "Data") {
        if (e.status !== "obtainable" && isAdvisor && e.subtype === "Enable" && e.relativity === "Absolute") {
          const civs = ["greek","egyptian","celtic","persian","babylonian","roman","norse"]
    
          if (civ === undefined) {
            for (let i = 0; i < civs.length; i++) { 
              addExtraUpgrade(e.target.text + "_a", civs[i])
              res.push({
                type: "AdvisorUniqueUnit",
                tech: e.target.text + "_a"
              })
            }
          } else {
            addExtraUpgrade(e.target.text + "_a", civ)
            res.push({
              type: "AdvisorUniqueUnit",
              tech: e.target.text + "_a"
            })
          }
        }
      }*/
      continue
    }
    //console.log(e.action)
    if (type === "WorkRate") {
      //console.log(e.action)
      switch (e.action) {
        case "Gather":
        case "AutoGather":
        case "Empower":
        case "Convert":
        case "Convert2":
          if (e.unittype === "BerryBush") {
            type = e.action + "AbstractFruit"
          } else if (e.unittype === "Fish") {
            type = e.action + "AbstractFish"
          } else if (e.unittype === "Wood") {
            type = e.action + "Tree"
          } else if (e.action === "Convert" || e.action === "Convert2") {
            type = "Convert" + e.unittype
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
        case "BurningAttack":
            /*type = "BurningAttack"*/
            continue
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
        case "ShrineGather":
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
          type = "RangedAttack"
          break
        case "BuildingAttack":
          type += "BuildingAttack"
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
    } /*else if (type === "DamageBonus" || type === "Yield") {
      type += e.unittype
    } */
      else if (type === "DamageBonus" || type === "Yield") {
      type += e.unittype
    } else if (type === "Armor") {
      type += e.damagetype
    } else if (type === "Haste") {
      /*type = "AttackSpeed"*/
      switch (e.action) {
        case "RangedAttack":
          type = "AttackSpeedDamageRanged"
          break
        case "BurningAttack":
          type = "AttackSpeedDamageRanged"
          break
        case "RangedAttack2":
          type = "AttackSpeedDamageRanged"
          break
        case "MeleeAttack":
          type = "AttackSpeedDamageMelee"
          break
        case "BuildingAttack":
          type = "AttackSpeedDamageBuilding"
          break
      }
    } else if (type === "DamageBonusReduction") {
      type = "ArmorDamageBonus"
    } else if (type === "TargetSpeedBoost") {
      type += e.action
    } else if (type === "HitPercentDamageMultiplier") {
      type += e.action
    } else if (type === "HitPercent") {
      type += e.action
    } else if (type === "MaximumRange" && e.action == "RangedAttack2") {
      continue
    } else if (type === "MaximumRange" && e.action == "MeleeAttack") {
      type = "MaximumRangeMeleeAttack"
    } else if (type === "MaximumRange" && e.action == "BurningAttack") {
      /*type = "MaximumRange"*/
      continue
    } else if (type === "MaximumRange" && e.action == "Convert") {
      type = "MaximumRangeConvert"
    } else if (type === "MaximumRange" && e.action == "Convert2") {
      continue
    } else if (type === "GathererLimit") {
      type = "GathererLimit"
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
      /*if (ignoredTargets.includes(e.target.type)) {
        continue
      }*/
      if (e.target.type === "TechAll") {
        effect.target = e.target.type
        addUnitType(e.target.type)
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
  if ((name.startsWith("Convert")) && name !== "ConvertResist" && name !== "ConvertConvertableBuilding" && name !== "Convert2ConvertableBuilding") {
    addEffect(name.replace("Convert", "Chaos"))
  }
  if (name == "AutoGatherGold") {
    addEffect(name.replace("AutoGatherGold", "AutoGatherGoldIndia"))
  }
  /*
  if (name.startsWith("Chaos")) {
    console.log(name)
  }*/
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
    /*effectName.startsWith("HitPercent") ||*/
    (effectName.startsWith("TargetSpeedBoost") && !effectName === "TargetSpeedBoostResist") ||
    effectName === "ConvertResist" ||
    effectName === "Trade" ||
    effectName === "BuildingWorkRate" ||
    effectName === "WorkRateRepair" ||
    effectName.startsWith("HitPercentDamageMultiplier") ||
    effectName === "HealdamageBonusUnit" ||
    (effectName.includes("Aura") && !effectName.includes("Range"))
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
    (effectName.startsWith("TargetSpeedBoost") && !effectName === "TargetSpeedBoostResist") ||
    effectName === "Build" ||
    effectName.startsWith("Yield") ||
    effectName === "BuildWatchPost" ||
    effectName === "Trade" ||
    effectName === "WorkRateRepair" ||
    effectName.startsWith("HitPercentDamageMultiplier") ||
    effectName === "ChargeDamageMultiplier" ||
    effectName === "ChargeSpeedBoost" ||
    effectName === "HealdamageBonusUnit" ||
    effectName === "CaravanGoldCoop" || 
    effectName.endsWith("RiteBuff") ||
    (effectName.includes("Aura") && !effectName.includes("Range"))
  ) {
    return "multiplier" // starts with "x"
  }
  if (
    effectName.startsWith("WorkRate") ||
    effectName.startsWith("AutoGather") ||
    effectName.startsWith("RateHeal") ||
    effectName.startsWith("RateAreaHeal") ||
    effectName.endsWith("DamageOverTimeRate")
  ) {
    return "persecond" // ends with "/s"
  }
  if (effectName.startsWith("HitPercent") && !effectName.startsWith("DamageMultiplier")) {
    return "percent" // ends with "%"
  }/*
  if (effectName === "ChargeRange") {
    return "normal" // ends with "%"
  }*/
  if (
    effectName === "TrainPoints" ||
    effectName.startsWith("Training_Garden") ||
    effectName === "BuildPoints" ||
    (effectName.startsWith("Convert") && effectName !== "ConvertResist") ||
    effectName.startsWith("Chaos") ||
    effectName.endsWith("DamageOverTimeDuration")
  ) {
    return "time" // ends with "s"
  }

  return "normal" // value displayed with neither prefix nor suffix
}

const templates = {
  ActionEnableConvert: { name: "Convert", icon: "NONE", sort: 0 },
  ActionEnableConvert2: { name: "Convert2", icon: "NONE", sort: 0 },
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
  ActionEnableTheode_C: {
    name: "Chief stuff C",
    icon: "NONE",
    sort: 0
  },
  ActionEnableTheode_U: {
    name: "Chief stuff U",
    icon: "NONE",
    sort: 0
  },
  ActionEnableTheode_R: {
    name: "Chief stuff R",
    icon: "NONE",
    sort: 0
  },
  ActionEnableTheode_E: {
    name: "Chief stuff E",
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
  ActionEnableHealthAura: {
    name: "Enables Health Aura",
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
  YieldAbstractFarm: {
    name: "Farm Conservation",
    icon: "YieldAbstractFruit",
    sort: 17
  },
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
  AutoGatherGoldIndia: { name: "Generating Gold (only India)", icon: "GatherGold", sort: 12 },
  AutoGatherShrineGather: { name: "Generating Extra Gold at Indian Shrine", icon: "GatherGold", sort: 13 },
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
  DamageArea: { name: "Damage Area", icon: "DamageArea", sort: 64 },
  RangedAttackDamageArea: { name: "Ranged Damage Area", icon: "DamageArea", sort: 64 },
  MeleeAttackDamageArea: { name: "Melee Damage Area", icon: "DamageArea", sort: 39 },
  BurningAttackDamageArea: { name: "Burning Damage Area", icon: "DamageArea", sort: 98 },
  RangedAttack2DamageArea: { name: "Special Building Ranged Damage Area", icon: "DamageArea", sort: 153 },
  AreaDamageReduction: {
    name: "Splash Damage Reduction",
    icon: "AreaDamageReduction",
    sort: 171
  },
  BuildingWorkRate: {
    name: "Train/Research Rate",
    icon: "BuildPoints",
    sort: 160
  },
  BuildPoints: {
    name: "Build Time",
    icon: "BuildPoints",
    sort: 200,
    lowerIsBetter: true
  },
  ConvertResist: {
    name: "Conversion Resistance",
    icon: "ConvertResist",
    sort: 172
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
  BuildLimit: { name: "Build Limit", icon: "BuildLimit", sort: 191 },
  Damage: { name: "Damage", icon: "DamageHand", sort: 0 },
  DamageMeleeAttack: { name: "Melee Damage", icon: "DamageHand", sort: 0 },
  DamageBuildingAttack: { name: "Crush Damage", icon: "DamageHand", sort: 0 },
  DamageRangedAttack: { name: "Pierce Damage", icon: "DamageRanged", sort: 0 },
  PoisonAttack: { name: "Total Poison Damage Over Time", icon: "DamageOverTime", sort: 92 },
  BurningAttack: { name: "Total Burning Damage Over Time", icon: "DamageOverTime", sort: 95 },
  PoisonAttackDamageOverTimeDuration: { name: "Poison Duration", icon: "BuildPoints", sort: 93 },
  BurningAttackDamageOverTimeDuration: { name: "Burning Duration", icon: "BuildPoints", sort: 96 },
  PoisonAttackDamageOverTimeRate: { name: "Posion Damage per sec", icon: "DamageOverTime", sort: 94 },
  BurningAttackDamageOverTimeRate: { name: "Burning Damage per sec", icon: "DamageOverTime", sort: 97 },
  ArmorDamageBonus: {
    name: "Bonus Damage Protection",
    icon: "DamageBonusReduction",
    sort: 170
  },
  HitPercent: { name: "Critical Hit Chance", icon: "CriticalHit", sort: 48 },
  HitPercentDamageMultiplier: {
    name: "Critical Hit Damage",
    icon: "CriticalHit",
    sort: 48
  },
  HitPercentMeleeAttack: { name: "Critical Hit Chance - Melee", icon: "CriticalHit", sort: 48 },
  HitPercentDamageMultiplierMeleeAttack: {
    name: "Critical Hit Damage - Melee",
    icon: "CriticalHit",
    sort: 48
  },
  HitPercentRangedAttack: { name: "Critical Hit Chance - Ranged", icon: "CriticalHit", sort: 82 },
  HitPercentDamageMultiplierRangedAttack: {
    name: "Critical Hit Damage - Ranged",
    icon: "CriticalHit",
    sort: 82
  },
  Hitpoints: { name: "Health", icon: "Hitpoints", sort: 0 },
  LOS: { name: "Line-of-sight", icon: "LOS", sort: 180 },
  MaximumRange: { name: "Maximum Range", icon: "MaximumRange", sort: 66 },
  WorkRateBurningAttack: {
    name: "Work Rate Burning Attack??",
    icon: "MaximumRange",
    sort: 66
  },
  MaximumRangeBurningAttack: {
    name: "Maximum Range",
    icon: "MaximumRange",
    sort: 66
  },
  MaximumRangeMeleeAttack: {
    name: "Maximum Range for Melee",
    icon: "MaximumRange",
    sort: 40
  },
  MaximumRange2: {
    name: "Special Building Max Range",
    icon: "MaximumRange",
    sort: 154
  },
  MinimumRange: { name: "Minimum Range", icon: "MaximumRange", sort: 65, lowerIsBetter: true },
  MaximumRangeConvert: {
    name: "Maximum Conversion Range",
    icon: "MaximumRange",
    sort: 140
  },
  MaximumRangeConvert2: {
    name: "Maximum Conversion Range",
    icon: "MaximumRange",
    sort: 140
  },
  MaximumRangeChaos: {
    name: "Maximum Chaos Range",
    icon: "MaximumRange",
    sort: 130
  },
  MaximumRangeChaos2: {
    name: "Maximum Chaos Range",
    icon: "MaximumRange",
    sort: 130
  },
  MaximumRangeHeal: {
    name: "Maximum Healing Range",
    icon: "MaximumRange",
    sort: 150
  },
  MaximumRangeAreaHeal: {
    name: "Maximum Healing Range",
    icon: "MaximumRange",
    sort: 150
  },
  MaximumVelocity: {
    name: "Movement Speed",
    icon: "MaximumVelocity",
    sort: 182
  },
  TargetSpeedBoost: {
    name: "Snare",
    icon: "TargetSpeedBoost",
    sort: 70,
    lowerIsBetter: true
  },
  TargetSpeedBoostRangedAttack: {
    name: "Snare - Ranged",
    icon: "TargetSpeedBoost",
    sort: 70,
    lowerIsBetter: true
  },
  TargetSpeedBoostMeleeAttack: {
    name: "Snare - Melee",
    icon: "TargetSpeedBoost",
    sort: 47,
    lowerIsBetter: true
  },
  TargetSpeedBoostPoisonAttack: {
    name: "Snare - Poison",
    icon: "TargetSpeedBoost",
    sort: 70,
    lowerIsBetter: true
  },
  TargetSpeedBoostBurningAttack: {
    name: "Snare - Burning",
    icon: "TargetSpeedBoost",
    sort: 70,
    lowerIsBetter: true
  },
  TargetSpeedBoostResist: {
    name: "Snare Resist",
    icon: "SnareResist",
    sort: 173
  },
  TrainPoints: {
    name: "Train Time",
    icon: "BuildPoints",
    sort: 195,
    lowerIsBetter: true
  },
  ArmorRanged: { name: "Pierce Armor", icon: "ArmorRanged", sort: 167 },
  ArmorSiege: { name: "Crush Armor", icon: "ArmorSiege", sort: 169 },
  ArmorHand: { name: "Melee-Infantry Armor", icon: "ArmorHand", sort: 166 },
  ArmorCavalry: { name: "Melee-Cavalry Armor", icon: "ArmorCavalry", sort: 168 },
  ConvertStandardConvertable: {
    name: "Conversion Rate",
    icon: "ConvertStandardConvertable",
    sort: 134,
    lowerIsBetter: true
  },
  Convert2StandardConvertable: {
    name: "Conversion Rate",
    icon: "ConvertStandardConvertable",
    sort: 134,
    lowerIsBetter: true
  },
  ConvertConvertableCavalry: {
    name: "Convert Cavalry Rate",
    icon: "ConvertStandardConvertable",
    sort: 136,
    lowerIsBetter: true
  },
  Convert2ConvertableCavalry: {
    name: "Convert Cavalry Rate",
    icon: "ConvertStandardConvertable",
    sort: 136,
    lowerIsBetter: true
  },
  ConvertConvertableSiege: {
    name: "Convert Siege Rate",
    icon: "ConvertStandardConvertable",
    sort: 137,
    lowerIsBetter: true
  },
  Convert2ConvertableSiege: {
    name: "Convert Siege Rate",
    icon: "ConvertStandardConvertable",
    sort: 137,
    lowerIsBetter: true
  },
  ConvertConvertableInfantry: {
    name: "Convert Infantry Rate",
    icon: "ConvertStandardConvertable",
    sort: 135,
    lowerIsBetter: true
  },
  Convert2ConvertableInfantry: {
    name: "Convert Infantry Rate",
    icon: "ConvertStandardConvertable",
    sort: 135,
    lowerIsBetter: true
  },
  ChaosStandardConvertable: { name: "Chaos Rate", icon: "Chaos", sort: 124 , lowerIsBetter: true},
  Chaos2StandardConvertable: { name: "Chaos Rate", icon: "Chaos", sort: 124 , lowerIsBetter: true},
  ChaosConvertableCavalry: {
    name: "Cavalry Chaos Rate",
    icon: "Chaos",
    sort: 126,
    lowerIsBetter: true
  },
  Chaos2ConvertableCavalry: {
    name: "Cavalry Chaos Rate",
    icon: "Chaos",
    sort: 126,
    lowerIsBetter: true
  },
  ChaosConvertableSiege: { name: "Siege Chaos Rate", icon: "Chaos", sort: 127 , lowerIsBetter: true},
  Chaos2ConvertableSiege: { name: "Siege Chaos Rate", icon: "Chaos", sort: 127 , lowerIsBetter: true},
  ChaosConvertableInfantry: {
    name: "Infantry Chaos Rate",
    icon: "Chaos",
    sort: 125,
    lowerIsBetter: true
  },
  Chaos2ConvertableInfantry: {
    name: "Infantry Chaos Rate",
    icon: "Chaos",
    sort: 125,
    lowerIsBetter: true
  },
  ConvertConvertableBuilding: {
    name: "Convert Building Rate",
    icon: "ConvertStandardConvertable",
    sort: 138,
    lowerIsBetter: true
  },
  Convert2ConvertableBuilding: {
    name: "Convert Building Rate",
    icon: "ConvertStandardConvertable",
    sort: 138,
    lowerIsBetter: true
  },
  Trade: { name: "Trade", icon: "Cost", sort: 155 },
  RateHeal: { name: "Healing", icon: "RateHeal", sort: 144 },
  RateAreaHeal: { name: "Healing", icon: "RateHeal", sort: 144 },
  RateHealInCombat: { name: "Healing", icon: "RateHeal", sort: 145 },
  RateAreaHealInCombat: { name: "Healing", icon: "RateHeal", sort: 145 },
  HealArea: { name: "Healing Area", icon: "HealArea", sort: 146 },
  AreaHealArea: { name: "Healing Area", icon: "HealArea", sort: 146 },
  Build: {
    name: "Buildings Construction Speed",
    icon: "ConstructionSpeed",
    sort: 104
  },
  WorkRateRepair: { name: "Repair Speed", icon: "ConstructionSpeed", sort: 103 },
  BuildWatchPostOrBarracks: {
    name: "Watch Post Construction Speed",
    icon: "WatchPostConstruction",
    sort: 105
  },
  EmpowerDropsite: {
    name: "Empower Dropoff",
    icon: "EmpowerDropsite",
    sort: 152
  },
  EmpowerActionTrain: {
    name: "Empower Train Rate",
    icon: "EmpowerActionTrain",
    sort: 153
  },
  EmpowerActionBuild: {
    name: "Empower Build Rate",
    icon: "EmpowerActionBuild",
    sort: 154
  },
  DamageBonusAbstractInfantry: {
    name: "Bonus vs. Infantry",
    icon: "DamageBonusAbstractInfantry",
    sort: 0
  },
  DamageBonusAbstractInfantryRangedAttack: {
    name: "Bonus vs. Infantry - Ranged",
    icon: "DamageBonusAbstractInfantry",
    sort: 51
  },
  DamageBonusAbstractInfantryMeleeAttack: {
    name: "Bonus vs. Infantry - Melee",
    icon: "DamageBonusAbstractInfantry",
    sort: 26
  },
  DamageBonusAbstractCavalry: {
    name: "Bonus vs. Cavalry",
    icon: "DamageBonusAbstractCavalry",
    sort: 0
  },
  DamageBonusAbstractCavalryRangedAttack: {
    name: "Bonus vs. Cavalry - Ranged",
    icon: "DamageBonusAbstractCavalry",
    sort: 52
  },
  DamageBonusAbstractCavalryMeleeAttack: {
    name: "Bonus vs. Cavalry - Melee",
    icon: "DamageBonusAbstractCavalry",
    sort: 27
  },
  DamageBonusBuilding: {
    name: "Bonus vs. Building",
    icon: "DamageBonusBuilding",
    sort: 0
  },
  DamageBonusBuildingRangedAttack: {
    name: "Bonus vs. Building - Ranged",
    icon: "DamageBonusBuilding",
    sort: 53
  },
  DamageBonusBuildingMeleeAttack: {
    name: "Bonus vs. Building - Melee",
    icon: "DamageBonusBuilding",
    sort: 28
  },
  DamageBonusBuildingRangedAttack2: {
    name: "Bonus vs. Building - Special Ranged",
    icon: "DamageBonusBuilding",
    sort: 151
  },
  DamageBonusShip: {
    name: "Bonus vs. Ship",
    icon: "DamageBonusShip",
    sort: 0
  },
  DamageBonusShipRangedAttack: {
    name: "Bonus vs. Ship - Ranged",
    icon: "DamageBonusShip",
    sort: 54
  },
  DamageBonusShipMeleeAttack: {
    name: "Bonus vs. Ship - Melee",
    icon: "DamageBonusShip",
    sort: 29
  },
  DamageBonusAbstractArcher: {
    name: "Bonus vs. Ranged",
    icon: "DamageBonusAbstractArcher",
    sort: 0
  },
  DamageBonusAbstractArcherRangedAttack: {
    name: "Bonus vs. Ranged - Ranged",
    icon: "DamageBonusAbstractArcher",
    sort: 55
  },
  DamageBonusAbstractArcherMeleeAttack: {
    name: "Bonus vs. Ranged - Melee",
    icon: "DamageBonusAbstractArcher",
    sort: 30
  },
  DamageBonusAbstractArcherPoisonAttack: {
    name: "Bonus vs. Ranged - Poison",
    icon: "DamageBonusAbstractArcher",
    sort: 55
  },
  DamageBonusGr_Cav_SarissophoroiRangedAttack: {
    name: "Bonus vs. Sarissophoroi",
    icon: "DamageBonusAbstractCavalry",
    sort: 56
  },
  DamageBonusUnitTypeMobileStorehouse1: {
    name: "Bonus vs. Storehouse",
    icon: "DamageBonusBuilding",
    sort: 31
  },
  DamageBonusUnitTypeMobileStorehouse1MeleeAttack: {
    name: "Bonus vs. Storehouse",
    icon: "DamageBonusBuilding",
    sort: 31
  },
  DamageBonusUnitTypeMobileStorehouse1RangedAttack: {
    name: "Bonus vs. Storehouse",
    icon: "DamageBonusBuilding",
    sort: 57
  },
  DamageBonusAbstractArtillery: {
    name: "Bonus vs. Siege",
    icon: "DamageBonusAbstractArtillery",
    sort: 0
  },
  DamageBonusAbstractArtilleryRangedAttack: {
    name: "Bonus vs. Siege - Ranged",
    icon: "DamageBonusAbstractArtillery",
    sort: 58
  },
  DamageBonusAbstractArtilleryMeleeAttack: {
    name: "Bonus vs. Siege - Melee",
    icon: "DamageBonusAbstractArtillery",
    sort: 32
  },
  DamageBonusHuntable: {
    name: "Bonus vs. Huntable",
    icon: "DamageBonusHuntable",
    sort: 0
  },
  DamageBonusHuntableRangedAttack: {
    name: "Bonus vs. Huntable - Ranged",
    icon: "DamageBonusHuntable",
    sort: 59
  },
  DamageBonusHuntableMeleeAttack: {
    name: "Bonus vs. Huntable - Melee",
    icon: "DamageBonusHuntable",
    sort: 33
  },
  DamageBonusUnitTypeVillager1: {
    name: "Bonus vs. Villager",
    icon: "DamageBonusUnitTypeVillager1",
    sort: 0
  },
  DamageBonusUnitTypeVillager1RangedAttack: {
    name: "Bonus vs. Villager - Ranged",
    icon: "DamageBonusUnitTypeVillager1",
    sort: 60
  },
  DamageBonusUnitTypeVillager1MeleeAttack: {
    name: "Bonus vs. Villager - Melee",
    icon: "DamageBonusUnitTypeVillager1",
    sort: 34
  },
  DamageBonusAbstractVillager: {
    name: "Bonus vs. Villager",
    icon: "DamageBonusUnitTypeVillager1",
    sort: 0
  },
  DamageBonusAbstractVillagerRangedAttack: {
    name: "Bonus vs. Villager - Ranged",
    icon: "DamageBonusUnitTypeVillager1",
    sort: 60
  },
  DamageBonusAbstractVillagerMeleeAttack: {
    name: "Bonus vs. Villager - Melee",
    icon: "DamageBonusUnitTypeVillager1",
    sort: 34
  },
  DamageBonusAbstractPriest: {
    name: "Bonus vs. Priests",
    icon: "DamageBonusAbstractPriest",
    sort: 0
  },
  DamageBonusAbstractPriestRangedAttack: {
    name: "Bonus vs. Priests - Ranged",
    icon: "DamageBonusAbstractPriest",
    sort: 61
  },
  DamageBonusAbstractPriestMeleeAttack: {
    name: "Bonus vs. Priests - Melee",
    icon: "DamageBonusAbstractPriest",
    sort: 35
  },
  DamageBonusCamelMeleeAttack: {
    name: "Bonus vs. Camel",
    icon: "DamageBonusHuntable",
    sort: 36
  },
  DamageBonusDeerAlpineMeleeAttack: {
    name: "Bonus vs. Deer Alpine",
    icon: "DamageBonusHuntable",
    sort: 36
  },
  DamageBonusAntelopeMeleeAttack: {
    name: "Bonus vs. Antelope",
    icon: "DamageBonusHuntable",
    sort: 36
  },
  DamageBonusDeerMeleeAttack: {
    name: "Bonus vs. Deer",
    icon: "DamageBonusHuntable",
    sort: 36
  },
  DamageBonusDeerRedMeleeAttack: {
    name: "Bonus vs. Deer (Red)",
    icon: "DamageBonusHuntable",
    sort: 36
  },
  DamageBonusGazelleMeleeAttack: {
    name: "Bonus vs. Gazelle",
    icon: "DamageBonusHuntable",
    sort: 36
  },
  DamageBonusIn_SacredCowMeleeAttack: {
    name: "Bonus vs. Sacred Cow",
    icon: "DamageBonusHuntable",
    sort: 36
  },
  DamageBonusIn_SacredCowRangedAttack: {
    name: "Bonus vs. Sacred Cow",
    icon: "DamageBonusHuntable",
    sort: 60
  },
  AttackSpeed: { name: "Attack Rate", icon: "DamageOverTime", sort: 0 },
  AttackSpeedDamageBuilding: {
    name: "Attack Rate",
    icon: "DamageOverTime",
    sort: 0
  },
  AttackSpeedDamageMelee: {
    name: "Attack Rate - Melee",
    icon: "DamageOverTime",
    sort: 0
  },
  AttackSpeedDamageRanged: {
    name: "Attack Rate - Ranged",
    icon: "DamageOverTime",
    sort: 0
  },
  AttackSpeedDamageRanged2: {
    name: "Special Ranged Attack Rate",
    icon: "DamageOverTime",
    sort: 0
  },
  DamageHand: { name: "Melee-Infantry DPS", icon: "DamageHand", sort: 25 },
  DamageRanged: { name: "Pierce DPS", icon: "DamageRanged", sort: 50 },
  DamageCavalry: { name: "Melee-Cavalry DPS", icon: "DamageCavalry", sort: 25 },
  DamageSiege: { name: "Crush DPS", icon: "DamageSiege", sort: 25 },
  DamageSiegeMeleeAttack: {
    name: "Melee Unit DPS",
    icon: "DamageSiege",
    sort: 25
  },
  DamageSiegeBuildingAttack: {
    name: "Building Crush DPS",
    icon: "DamageSiege",
    sort: 25
  },
  DamageSiegeRangedAttack: {
    name: "Ranged Crush DPS",
    icon: "DamageSiege",
    sort: 50
  },
  DamageSiegeRangedAttack2: {
    name: "Special Building Ranged Crush DPS",
    icon: "DamageSiege",
    sort: 150
  },
  MaximumContained: {
    name: "Transport Capacity",
    icon: "PopulationCount",
    sort: 186
  },
  AOERadius: {
    name: "Charge Attack Damage Area",
    icon: "DamageArea",
    sort: 179
  },
  ArmorVulnerability: {
    name: "Ignore Armor",
    icon: "ArmorVulnerability",
    sort: 100
  },
  UnlockUpgrade: { name: "Unlocks upgrade", icon: "NONE", sort: 0 },
  AdvisorUniqueUnit: { name: "Advisor Unique Unit", icon: "NONE", sort: 0 },
  DisableUpgrade: { name: "Disables upgrade", icon: "NONE", sort: 0 },
  ChargeAbility: {
    name: "Can Charge",
    icon: "Chaos",
    sort: 175
  },
  ChargeDamageMultiplier: {
    name: "Charge Damage Multiplier",
    icon: "Chaos",
    sort: 175
  },
  ChargeRange: {
    name: "Charge Range",
    icon: "MaximumRange",
    sort: 176
  },
  ChargeSpeedBoost: {
    name: "Charge Speed Bonus",
    icon: "MaximumVelocity",
    sort: 177
  },
  ChargeCooldown: {
    name: "Charge Cooldown",
    icon: "BuildPoints",
    sort: 178
  },
  HealdamageBonusUnit: {
    name: "Healing Damage Bonus all Units",
    icon: "Chaos",
    sort: 147
  },
  SacrificeHuntable: {
    name: "Can Sacrifice Huntable",
    icon: "DamageBonusHuntable",
    sort: 147
  },
  MovementSpeedAuraSpeedRange: {
    name: "Military Speed Aura Buff Range",
    icon: "DamageArea",
    sort: 110
  },
  MovementSpeedAuraSpeed: {
    name: "Military Speed Aura Buff",
    icon: "DamageArea",
    sort: 111
  },
  MovementSpeedAuraVillagerSpeedRange: {
    name: "Villager Speed Aura Buff Range",
    icon: "DamageArea",
    sort: 112
  },
  MovementSpeedAuraVillagerSpeed: {
    name: "Villager Speed Aura Buff",
    icon: "DamageArea",
    sort: 112
  },
  Servilia_ESpeedRange: {
    name: "Villager Speed Aura Buff Range",
    icon: "DamageArea",
    sort: 112
  },
  Servilia_ESpeed: {
    name: "Villager Speed Aura Buff",
    icon: "DamageArea",
    sort: 112
  },
  Servilia_RSpeedRange: {
    name: "Villager Speed Aura Buff Range",
    icon: "DamageArea",
    sort: 112
  },
  Servilia_RSpeed: {
    name: "Villager Speed Aura Buff",
    icon: "DamageArea",
    sort: 112
  },
  Servilia_USpeedRange: {
    name: "Villager Speed Aura Buff Range",
    icon: "DamageArea",
    sort: 112
  },
  Servilia_USpeed: {
    name: "Villager Speed Aura Buff",
    icon: "DamageArea",
    sort: 112
  },
  Servilia_CSpeedRange: {
    name: "Villager Speed Aura Buff Range",
    icon: "DamageArea",
    sort: 112
  },
  Servilia_CSpeed: {
    name: "Villager Speed Aura Buff",
    icon: "DamageArea",
    sort: 112
  },
  DamageAuraDamageRange: {
    name: "Damage Aura Buff Range",
    icon: "DamageArea",
    sort: 113
  },
  DamageAuraDamage: {
    name: "Damage Aura Buff",
    icon: "DamageArea",
    sort: 114
  },
  HealthAuraMaxHPRange: {
    name: "HP Aura Buff Range",
    icon: "DamageArea",
    sort: 115
  },
  HealthAuraMaxHP: {
    name: "HP Aura Buff",
    icon: "DamageArea",
    sort: 116
  },
  Theode_CMaxHPRange: {
    name: "HP Aura Buff Range",
    icon: "DamageArea",
    sort: 115
  },
  Theode_CMaxHP: {
    name: "HP Aura Buff",
    icon: "DamageArea",
    sort: 116
  },
  Theode_UMaxHPRange: {
    name: "HP Aura Buff Range",
    icon: "DamageArea",
    sort: 115
  },
  Theode_UMaxHP: {
    name: "HP Aura Buff",
    icon: "DamageArea",
    sort: 116
  },
  Theode_RMaxHPRange: {
    name: "HP Aura Buff Range",
    icon: "DamageArea",
    sort: 115
  },
  Theode_RMaxHP: {
    name: "HP Aura Buff",
    icon: "DamageArea",
    sort: 116
  },
  Theode_EMaxHPRange: {
    name: "HP Aura Buff Range",
    icon: "DamageArea",
    sort: 115
  },
  Theode_EMaxHP: {
    name: "HP Aura Buff",
    icon: "DamageArea",
    sort: 116
  },
  DebuffAuraDamageRange: {
    name: "Enemy Damage Aura Debuff Range",
    icon: "DamageArea",
    sort: 117
  },
  DebuffAuraDamage: {
    name: "Enemy Damage Aura Debuff",
    icon: "DamageArea",
    sort: 118
  },
  PerfectAccuracy: {
    name: "Ranged Attack Tracks Target",
    icon: "DamageRanged",
    sort: 83
  },
  AttackIfContainsUnitsRangedAttack: {
    name: "Only Attack with units inside",
    icon: "DamageRanged",
    sort: 84
  },
  AttackCooldownRangedAttack: {
    name: "Ranged Attack Cooldown",
    icon: "BuildPoints",
    sort: 62
  },
  ScaleByContainedUnitsRangedAttack: {
    name: "Damage scales with units inside",
    icon: "DamageRanged",
    sort: 84
  },
  MaxDmgMaxContained: {
    name: "Damage at max Capacity",
    icon: "BuildPoints",
    sort: 187
  },
  Training_Garden4Age2: {
    name: "Train Time 4x Age II Gardens",
    icon: "BuildPoints",
    sort: 196,
    lowerIsBetter: true
  },
  Training_Garden8Age3: {
    name: "Train Time 8x Age III Gardens",
    icon: "BuildPoints",
    sort: 197,
    lowerIsBetter: true
  },
  Training_Garden12Age4: {
    name: "Train Time 12x Age IV Gardens",
    icon: "BuildPoints",
    sort: 198,
    lowerIsBetter: true
  },
  ResearchPoints: {
    name: "Research Time",
    icon: "BuildPoints",
    sort: 199
  },
  CostBuildingTechs: {
    name: "Tech Cost",
    icon: "CostWood",
    sort: 0,
    lowerIsBetter: true
  },
  CostBuildingAll: {
    name: "Tech Cost",
    icon: "CostWood",
    sort: 0,
    lowerIsBetter: true
  },
  CaravanGoldPerSec150: {
    name: "Gold/Sec Solo Small Map (150m)",
    icon: "CostGold",
    sort: 159
  },
  CaravanGoldPerSec300: {
    name: "Gold/Sec Solo Average Map (300m)",
    icon: "CostGold",
    sort: 160
  },
  CaravanGoldPerSec500: {
    name: "Gold/Sec Solo Huge Map (500m)",
    icon: "CostGold",
    sort: 161
  },
  CaravanGoldPerSec300_50_Carry: {
    name: "Short Dist Gold Carry/Trip 50+%Trade",
    icon: "CarryCapacityGold",
    sort: 164
  },
  CaravanGoldPerSec300_50: {
    name: "Gold/Sec Solo Avg Map 50+%Trade",
    icon: "CostGold",
    sort: 165
  },
  CaravanGoldPerSec300_100_Carry: {
    name: "Short Dist Gold Carry/Trip 100+%Trade",
    icon: "CarryCapacityGold",
    sort: 162
  },
  CaravanGoldPerSec300_100: {
    name: "Gold/Sec Solo Avg Map 50+%Trade",
    icon: "CostGold",
    sort: 163
  },
  CaravanGoldCoop: {
    name: "Gold/Sec Coop 50% Trade Bonus",
    icon: "CostGold",
    sort: 167
  },
  FishBoatTimeToFish: {
    name: "Time to Fish",
    icon: "BuildPoints",
    sort: 25,
    lowerIsBetter: true
  },
  FishBoatTimeToTravel_100Size: {
    name: "Time to Travel from 100m",
    icon: "BuildPoints",
    sort: 26,
    lowerIsBetter: true
  },
  FishBoatFishPerSec_100Size: {
    name: "Food/Sec from 100m",
    icon: "CostFood",
    sort: 27
  },
  AndrastaRiteBuff: {
    name: "Andrasta Rite Damage Buff",
    icon: "Chaos",
    sort: 205
  },
  RatisRiteBuff: {
    name: "Ratis Rite Bonus vs Building Buff",
    icon: "DamageBonusBuilding",
    sort: 206
  },
  RudiobusRiteBuff: {
    name: "Rudiobus Rite Movement Buff",
    icon: "MaximumVelocity",
    sort: 207
  },
  DamaraRiteBuff: {
    name: "Damara Rite Train Time Buff",
    icon: "BuildPoints",
    sort: 208
  },
  GathererLimit: {
    name: "Gatherer Limit",
    icon: "PopulationCount",
    sort: 209
  }
}

function getTemplate(effectName) {
  if (templates[effectName]) {
    return templates[effectName]
  }
  throw `Effect '${effectName}' is not handled`
}

