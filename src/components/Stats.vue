<template>
  <div class="stats-container">
    <div class="my-1 cost">
      <span class="is-flex-grow-1">Cost</span>
      <CostStats :cost="computedStatsCost" />
    </div>
    <div v-for="key in orderedStatsKeys" :key="key" class="my-1">
      <span class="is-flex-grow-1 mr-1">{{ effectName(key) }}</span>
      <span :class="comparisonClass(key, computedStatsWithoutCost[key])">
        {{ formatEffect(key, computedStatsWithoutCost[key]) }}
      </span>
      <Icon sprite="icons" :name="effectIcon(key)" size="xs" class="ml-1" />
    </div>
  </div>
</template>

<script>
import effects from "../data/effects.json"
import Icon from "./Icon.vue"
import CostStats from "./CostStats.vue"
import Comparable from "../mixins/Comparable.js"
import { effectAppliesToUnit } from "../stats.js"

export default {
  name: "Stats",
  components: { Icon, CostStats },
  mixins: [Comparable],
  props: {
    unitId: { type: String, required: true },
    unit: {
      type: Object,
      required: true
    },
    gear: {
      type: Object,
      default() {
        return {}
      }
    },
    advisors: {
      type: Array,
      default() {
        return []
      }
    },
    milestones: {
      type: Object,
      default() {
        return {}
      }
    },
    upgrades: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  computed: {
    computedStatsCost() {
      const stats = {}
      for (let key in this.computedStats) {
        if (key.startsWith("Cost")) {
          stats[key] = this.computedStats[key]
        }
      }

      if ("PopulationCount" in this.computedStats) {
        stats["PopulationCount"] = this.computedStats["PopulationCount"]
      }

      return stats
    },
    computedStatsWithoutCost() {
      const stats = {}
      for (let key in this.computedStats) {
        if (key !== "PopulationCount" && !key.startsWith("Cost")) {
          stats[key] = this.computedStats[key]
        }
      }

      return stats
    },
    orderedStatsKeys() {
      return Object.keys(this.computedStatsWithoutCost).sort((a, b) => {
        return effects[a].sort - effects[b].sort
      })
    },
    computedStats() {
      const stats = {}
      // Base stats
      for (let key in this.unit.stats) {
        stats[key] = this.unit.stats[key]
      }
      //JSON does not allow me to write infinity in the data, so 1000 is assumed as infinity in the code
      if (stats["ConvertResist"] === 1000) {
        stats["ConvertResist"] = Infinity
      }
      // Remove stats from inactive actions
      this.unit.inactiveActions.forEach(a => {
        for (let key in stats) {
          if (key === a) {
            delete stats[key]
          }
        }
      })

      for (let upgradeID in this.upgrades) {
        this.filterActionEnable(this.upgrades[upgradeID]).forEach(e => {
          this.applyEffect(e, stats, this.unit)
        })
      }

      for (let key in this.gear) {
        const gear = this.gear[key]
        for (let i = 0; i < gear.stats.effects.length; i++) {
          const effect = gear.stats.effects[i]
          this.applyEffect(effect, stats, this.unit)
        }
      }

      for (let civ in this.milestones) {
        const civMilestones = this.milestones[civ]
        for (let i = 0; i < civMilestones.length; i++) {
          const milestone = civMilestones[i]
          const milestoneEffects = milestone.effects.filter(e =>
            effectAppliesToUnit(e, this.unit)
          )
          for (let j = 0; j < milestoneEffects.length; j++) {
            this.applyEffect(milestoneEffects[j], stats, this.unit)
          }
        }
      }

      for (let i = 0; i < this.advisors.length; i++) {
        const advisorEffects = this.advisors[i].effects.filter(e =>
          effectAppliesToUnit(e, this.unit)
        )
        for (let j = 0; j < advisorEffects.length; j++) {
          this.applyEffect(advisorEffects[j], stats, this.unit)
        }
      }

      const upgradeEffects = []
      for (let upgradeID in this.upgrades) {
        this.filterUpgradeEffects(this.upgrades[upgradeID], upgradeEffects)
      }
      upgradeEffects
        .filter(e => !e.type.startsWith("ActionEnable"))
        .forEach(e => this.applyEffect(e, stats, this.unit))

      if (stats.ScaleByContainedUnitsRangedAttack) {
        stats["MaxDmgMaxContained"] =
          stats["DamageRanged"] * stats["MaximumContained"]
      }
      if (stats.Training_Garden4Age2) {
        stats["Training_Garden4Age2"] = stats["TrainPoints"] * 0.888487048
        stats["Training_Garden8Age3"] = stats["TrainPoints"] * 0.730690205
        stats["Training_Garden12Age4"] = stats["TrainPoints"] * 0.556837418
      }

      this.$store.commit("setUnitStats", { id: this.unitId, stats })
      return stats
    }
  },
  methods: {
    effectName(name) {
      let e = effects[name].name
      if (name === "RateHeal" || name === "RateAreaHeal") {
        e += " (Out of Combat)"
      }
      /* Norse Inf Scout1 actually builds a Barracks and not a Watchpost but same advisors affects him*/
      if (
        this.unit.id === "No_Inf_Scout1" &&
        name === "BuildWatchPostOrBarracks"
      ) {
        e = "Barracks Construction Speed"
      }
      if (this.unit.id === "No_Inf_ThrowingAxeman" && name === "DamageRanged") {
        e = "Melee-Infantry DPS (Ranged)"
      }
      if (
        this.unit.stats.ScaleByContainedUnitsRangedAttack &&
        name === "DamageRanged"
      ) {
        e = "Pierce DPS per unit"
      }
      /* Enneris only has Bonus vs Buildings from the RangedAttack2*/
      /*if (this.unit.id === "Ro_Shp_Enneris" && name === "DamageBonusBuilding") {
        e = "Special Attack Bonus vs Buildings"
      }*/
      return e
    },
    effectIcon(name) {
      let e = effects[name].icon
      if (this.unit.id === "No_Inf_ThrowingAxeman" && name === "DamageRanged") {
        e = "DamageHand"
      }
      return e
    },
    formatEffect(name, value) {
      const effect = effects[name]
      if (name === "HitPercent") {
        value = (value - 1) * 100
      }
      let formattedValue = value.toFixed(2)

      switch (effect.type) {
        case "multiplier":
          formattedValue = "x" + formattedValue
          break
        case "persecond":
          formattedValue += "/s"
          break
        case "percent":
          formattedValue += "%"
          break
        case "time":
          formattedValue += "s"
          break
      }
      return formattedValue
    },
    setBaseStat(stats, effectName) {
      if (!(effectName in stats)) {
        /*if (
          effectName.startsWith("Convert") &&
          effectName !== "ConvertResist" &&
          effectName !== "ConvertStandardConvertable"
        ) {
          stats[effectName] = this.unit.stats.ConvertStandardConvertable
        } else if (
          effectName.startsWith("Chaos") &&
          effectName !== "ChaosStandardConvertable"
        ) {
          stats[effectName] = this.unit.stats.ChaosStandardConvertable
        } else {*/
        stats[effectName] = effects[effectName].base
        /*}*/
      }
    },
    filterUpgradeEffects(upgrade, res) {
      if (upgrade === undefined) {
        return
      }
      const effects = upgrade.effects.filter(e =>
        effectAppliesToUnit(e, this.unit)
      )
      for (let i = 0; i < effects.length; i++) {
        const e = effects[i]
        res.push({
          type: e.type,
          absolute: e.absolute,
          amount: e.amount
        })
      }
      this.filterUpgradeEffects(upgrade.chain, res)
    },
    filterActionEnable(upgrade) {
      const actionEnable = []
      this.filterUpgradeEffects(upgrade, actionEnable)
      return actionEnable.filter(e => e.type.startsWith("ActionEnable"))
    },
    applyEffect(effect, stats, unit) {
      if (effect.type === "UnlockUpgrade" || effect.type === "DisableUpgrade") {
        return
      }
      if (effects[effect.type].type === "action") {
        const actionName = effect.type.replace("ActionEnable", "")
        let affectedStats = []
        switch (actionName) {
          case "MeleeAttack":
            affectedStats.push("DamageMelee")
            break
          case "RangedAttack":
            affectedStats.push("DamageRanged")
            affectedStats.push("RangedAttackDamageArea")
            affectedStats.push("MaximumRange")
            affectedStats.push("MaxDmgMaxContained")
            affectedStats.push("AttackIfContainsUnitsRangedAttack")
            affectedStats.push("ScaleByContainedUnitsRangedAttack")
            break
          case "RangedAttack2":
            affectedStats.push("DamageSiegeRangedAttack2")
            affectedStats.push("DamagePierceRangedAttack2")
            affectedStats.push("RangedAttack2DamageArea")
            affectedStats.push("MaximumRange2")
            affectedStats.push("DamageBonusBuildingRangedAttack2")
            break
          case "Heal":
            affectedStats.push("RateHeal")
            affectedStats.push("MaximumRangeHeal")
            affectedStats.push("HealArea")
            break
          case "AreaHeal":
            affectedStats.push("RateAreaHealInCombat")
            affectedStats.push("MaximumRangeAreaHeal")
            affectedStats.push("AreaHealArea")
            delete stats["RateHealInCombat"]
            delete stats["MaximumRangeHeal"]
            delete stats["HealArea"]
            break
          case "Charge":
            affectedStats.push("ChargeDamageMultiplier")
            affectedStats.push("ChargeRange")
            affectedStats.push("ChargeSpeedBoost")
            affectedStats.push("ChargeCooldown")
            break
          case "BurningAttack":
            affectedStats.push("BurningAttack")
            affectedStats.push("BurningAttackDamageOverTimeDuration")
            affectedStats.push("BurningAttackDamageOverTimeRate")
            break
          case "PoisonAttack":
            affectedStats.push("PoisonAttack")
            affectedStats.push("PoisonAttackDamageOverTimeDuration")
            affectedStats.push("PoisonAttackDamageOverTimeRate")
            break
          case "Servilia_E":
            affectedStats.push("Servilia_ESpeedRange")
            affectedStats.push("Servilia_ESpeed")
            break
          case "Servilia_R":
            affectedStats.push("Servilia_RSpeedRange")
            affectedStats.push("Servilia_RSpeed")
            break
          case "Servilia_U":
            affectedStats.push("Servilia_USpeedRange")
            affectedStats.push("Servilia_USpeed")
            break
          case "Servilia_C":
            affectedStats.push("Servilia_CSpeedRange")
            affectedStats.push("Servilia_CSpeed")
            break
          case "Theode_E":
            affectedStats.push("Theode_EMaxHPRange")
            affectedStats.push("Theode_EMaxHP")
            delete stats["HealthAuraMaxHPRange"]
            delete stats["HealthAuraMaxHP"]
            break
          case "Theode_R":
            affectedStats.push("Theode_RMaxHPRange")
            affectedStats.push("Theode_RMaxHP")
            delete stats["HealthAuraMaxHPRange"]
            delete stats["HealthAuraMaxHP"]
            break
          case "Theode_U":
            affectedStats.push("Theode_UMaxHPRange")
            affectedStats.push("Theode_UMaxHP")
            delete stats["HealthAuraMaxHPRange"]
            delete stats["HealthAuraMaxHP"]
            break
          case "Theode_C":
            affectedStats.push("Theode_CMaxHPRange")
            affectedStats.push("Theode_CMaxHP")
            delete stats["HealthAuraMaxHPRange"]
            delete stats["HealthAuraMaxHP"]
            break
          default:
            affectedStats.push(actionName)
        }
        affectedStats.forEach(s => {
          if (effect.amount === 0) {
            // Disable
            for (let key in unit.stats) {
              if (key === s) {
                delete stats[key]
              }
            }
          } else {
            if (unit.inactiveActions.find(a => a === s)) {
              for (let key in unit.stats) {
                if (key === s && stats[key] === undefined) {
                  stats[key] = unit.stats[key]
                }
              }
            }
          }
        })
        return
      }
      let mod = effect.amount
      if (effect.assign) {
        stats[effect.type] = mod
        return
      } else if (effect.absolute) {
        this.setBaseStat(stats, effect.type)
        stats[effect.type] += mod
        return
      }

      switch (effect.type) {
        case "Damage":
          // If type is Damage, apply to all damage subtypes
          for (let keyDmg in stats) {
            if (
              keyDmg.startsWith("Damage") &&
              !keyDmg.startsWith("DamageBonus") &&
              !keyDmg.startsWith("DamageAura") &&
              keyDmg != "DamageArea"
            ) {
              stats[keyDmg] *= mod
            }
          }
          break
        case "AttackSpeedDamageBuilding":
          break
        case "AttackSpeedDamageMelee":
          for (let keyDmg in stats) {
            if (
              keyDmg === "DamageHand" ||
              keyDmg === "DamageCavalry" ||
              keyDmg === "DamageSiegeMeleeAttack"
            ) {
              this.setBaseStat(stats, keyDmg)
              stats[keyDmg] *= mod
            }
          }
          break
        case "AttackSpeedDamageRanged":
          ;[
            "DamageRanged",
            "DamageSiegeRangedAttack",
            "DamageSiegeRangedAttack2"
          ].forEach(e => {
            if (stats[e]) {
              stats[e] *= mod
            }
          })
          break
        case "DamageMeleeAttack":
          for (let keyDmg in stats) {
            if (
              keyDmg === "DamageHand" ||
              keyDmg === "DamageCavalry" ||
              keyDmg === "DamageSiegeMeleeAttack"
            ) {
              this.setBaseStat(stats, keyDmg)
              stats[keyDmg] *= mod
            }
          }
          break
        case "DamageRangedAttack":
        case "DamageRangedAttack2":
          for (let keyDmg in stats) {
            if (
              keyDmg === "DamageRanged" ||
              keyDmg === "DamageSiegeRangedAttack" ||
              keyDmg === "DamageSiegeRangedAttack2"
            ) {
              this.setBaseStat(stats, keyDmg)
              stats[keyDmg] *= mod
            }
          }
          break
        case "DamageSiege":
          for (let keyDmg in stats) {
            if (keyDmg.startsWith("DamageSiege")) {
              this.setBaseStat(stats, keyDmg)
              stats[keyDmg] *= mod
            }
          }
          break
        case "MaximumRange":
          for (let keyRange in stats) {
            if (keyRange.startsWith("MaximumRange")) {
              this.setBaseStat(stats, keyRange)
              stats[keyRange] *= mod
            }
          }
          break
        case "DamageBonusAbstractInfantry":
          ;[
            "DamageBonusAbstractInfantryRangedAttack",
            "DamageBonusAbstractInfantryMeleeAttack"
          ].forEach(e => {
            if (stats[e]) {
              stats[e] *= mod
            } else {
              stats[e] = 1 * mod
              let melee_stuff = 0
              let ranged_stuff = 0
              if (
                stats["DamageCavalry"] ||
                stats["DamageHand"] ||
                (stats["DamageSiegeMeleeAttack"] && unit.id === "No_Sie_Ram")
              ) {
                melee_stuff = 1
              }
              if (
                stats["DamageRanged"] ||
                stats["DamageSiegeRangedAttack"] ||
                stats["DamageSiegeRangedAttack2"]
              ) {
                ranged_stuff = 1
              }
              if (melee_stuff === 1 && ranged_stuff === 0) {
                delete stats["DamageBonusAbstractInfantryRangedAttack"]
              }
              if (melee_stuff === 0 && ranged_stuff === 1) {
                delete stats["DamageBonusAbstractInfantryMeleeAttack"]
              }
              if (melee_stuff === 0 && ranged_stuff === 0) {
                delete stats["DamageBonusAbstractInfantryRangedAttack"]
                delete stats["DamageBonusAbstractInfantryMeleeAttack"]
              }
            }
          })
          break
        case "DamageBonusAbstractCavalry":
          ;[
            "DamageBonusAbstractCavalryRangedAttack",
            "DamageBonusAbstractCavalryMeleeAttack"
          ].forEach(e => {
            if (stats[e]) {
              stats[e] *= mod
            } else {
              stats[e] = 1 * mod
              let melee_stuff = 0
              let ranged_stuff = 0
              if (
                stats["DamageCavalry"] ||
                stats["DamageHand"] ||
                (stats["DamageSiegeMeleeAttack"] && unit.id === "No_Sie_Ram")
              ) {
                melee_stuff = 1
              }
              if (
                stats["DamageRanged"] ||
                stats["DamageSiegeRangedAttack"] ||
                stats["DamageSiegeRangedAttack2"]
              ) {
                ranged_stuff = 1
              }
              if (melee_stuff === 1 && ranged_stuff === 0) {
                delete stats["DamageBonusAbstractCavalryRangedAttack"]
              }
              if (melee_stuff === 0 && ranged_stuff === 1) {
                delete stats["DamageBonusAbstractCavalryMeleeAttack"]
              }
              if (melee_stuff === 0 && ranged_stuff === 0) {
                delete stats["DamageBonusAbstractCavalryRangedAttack"]
                delete stats["DamageBonusAbstractCavalryMeleeAttack"]
              }
            }
          })
          break
        case "DamageBonusBuilding":
          ;[
            "DamageBonusBuildingRangedAttack",
            "DamageBonusBuildingMeleeAttack",
            "DamageBonusBuildingRangedAttack2"
          ].forEach(e => {
            if (stats[e]) {
              stats[e] *= mod
            } else {
              stats[e] = 1 * mod
              let melee_stuff = 0
              let ranged_stuff = 0
              if (
                stats["DamageCavalry"] ||
                stats["DamageHand"] ||
                stats["DamageSiegeMeleeAttack"]
              ) {
                melee_stuff = 1
              }
              if (
                stats["DamageRanged"] ||
                stats["DamageSiegeRangedAttack"] ||
                stats["DamageSiegeRangedAttack2"]
              ) {
                ranged_stuff = 1
              }
              if (melee_stuff === 1 && ranged_stuff === 0) {
                delete stats["DamageBonusBuildingRangedAttack"]
              }
              if (melee_stuff === 0 && ranged_stuff === 1) {
                delete stats["DamageBonusBuildingMeleeAttack"]
              }
              if (melee_stuff === 0 && ranged_stuff === 0) {
                delete stats["DamageBonusBuildingRangedAttack"]
                delete stats["DamageBonusBuildingMeleeAttack"]
              }
              if (!stats["DamageSiegeRangedAttack2"]) {
                delete stats["DamageBonusBuildingRangedAttack2"]
              }
            }
          })
          break
        case "DamageBonusShip":
          ;[
            "DamageBonusShipRangedAttack",
            "DamageBonusShipMeleeAttack"
          ].forEach(e => {
            if (stats[e]) {
              stats[e] *= mod
            } else {
              stats[e] = 1 * mod
              let melee_stuff = 0
              let ranged_stuff = 0
              if (
                stats["DamageCavalry"] ||
                stats["DamageHand"] ||
                (stats["DamageSiegeMeleeAttack"] && unit.id === "No_Sie_Ram")
              ) {
                melee_stuff = 1
              }
              if (
                stats["DamageRanged"] ||
                stats["DamageSiegeRangedAttack"] ||
                stats["DamageSiegeRangedAttack2"]
              ) {
                ranged_stuff = 1
              }
              if (melee_stuff === 1 && ranged_stuff === 0) {
                delete stats["DamageBonusShipRangedAttack"]
              }
              if (melee_stuff === 0 && ranged_stuff === 1) {
                delete stats["DamageBonusShipMeleeAttack"]
              }
              if (melee_stuff === 0 && ranged_stuff === 0) {
                delete stats["DamageBonusShipRangedAttack"]
                delete stats["DamageBonusShipMeleeAttack"]
              }
            }
          })
          break
        case "DamageBonusAbstractArcher":
          ;[
            "DamageBonusAbstractArcherRangedAttack",
            "DamageBonusAbstractArcherMeleeAttack"
          ].forEach(e => {
            if (stats[e]) {
              stats[e] *= mod
            } else {
              stats[e] = 1 * mod
              let melee_stuff = 0
              let ranged_stuff = 0
              if (
                stats["DamageCavalry"] ||
                stats["DamageHand"] ||
                (stats["DamageSiegeMeleeAttack"] && unit.id === "No_Sie_Ram")
              ) {
                melee_stuff = 1
              }
              if (
                stats["DamageRanged"] ||
                stats["DamageSiegeRangedAttack"] ||
                stats["DamageSiegeRangedAttack2"]
              ) {
                ranged_stuff = 1
              }
              if (melee_stuff === 1 && ranged_stuff === 0) {
                delete stats["DamageBonusAbstractArcherRangedAttack"]
              }
              if (melee_stuff === 0 && ranged_stuff === 1) {
                delete stats["DamageBonusAbstractArcherMeleeAttack"]
              }
              if (melee_stuff === 0 && ranged_stuff === 0) {
                delete stats["DamageBonusAbstractArcherRangedAttack"]
                delete stats["DamageBonusAbstractArcherMeleeAttack"]
              }
            }
          })
          break
        case "DamageBonusAbstractArtillery":
          ;[
            "DamageBonusAbstractArtilleryRangedAttack",
            "DamageBonusAbstractArtilleryMeleeAttack"
          ].forEach(e => {
            if (stats[e]) {
              stats[e] *= mod
            } else {
              stats[e] = 1 * mod
              let melee_stuff = 0
              let ranged_stuff = 0
              if (
                stats["DamageCavalry"] ||
                stats["DamageHand"] ||
                (stats["DamageSiegeMeleeAttack"] && unit.id === "No_Sie_Ram")
              ) {
                melee_stuff = 1
              }
              if (
                stats["DamageRanged"] ||
                stats["DamageSiegeRangedAttack"] ||
                stats["DamageSiegeRangedAttack2"]
              ) {
                ranged_stuff = 1
              }
              if (melee_stuff === 1 && ranged_stuff === 0) {
                delete stats["DamageBonusAbstractArtilleryRangedAttack"]
              }
              if (melee_stuff === 0 && ranged_stuff === 1) {
                delete stats["DamageBonusAbstractArtilleryMeleeAttack"]
              }
              if (melee_stuff === 0 && ranged_stuff === 0) {
                delete stats["DamageBonusAbstractArtilleryRangedAttack"]
                delete stats["DamageBonusAbstractArtilleryMeleeAttack"]
              }
            }
          })
          break
        case "DamageBonusHuntable":
          ;[
            "DamageBonusHuntableRangedAttack",
            "DamageBonusHuntableMeleeAttack"
          ].forEach(e => {
            if (stats[e]) {
              stats[e] *= mod
            } else {
              stats[e] = 1 * mod
              let melee_stuff = 0
              let ranged_stuff = 0
              if (
                stats["DamageCavalry"] ||
                stats["DamageHand"] ||
                (stats["DamageSiegeMeleeAttack"] && unit.id === "No_Sie_Ram")
              ) {
                melee_stuff = 1
              }
              if (
                stats["DamageRanged"] ||
                stats["DamageSiegeRangedAttack"] ||
                stats["DamageSiegeRangedAttack2"]
              ) {
                ranged_stuff = 1
              }
              if (melee_stuff === 1 && ranged_stuff === 0) {
                delete stats["DamageBonusHuntableRangedAttack"]
              }
              if (melee_stuff === 0 && ranged_stuff === 1) {
                delete stats["DamageBonusHuntableMeleeAttack"]
              }
              if (melee_stuff === 0 && ranged_stuff === 0) {
                delete stats["DamageBonusHuntableRangedAttack"]
                delete stats["DamageBonusHuntableMeleeAttack"]
              }
            }
          })
          break
        case "DamageBonusUnitTypeVillager1":
          ;[
            "DamageBonusUnitTypeVillager1RangedAttack",
            "DamageBonusUnitTypeVillager1MeleeAttack"
          ].forEach(e => {
            if (stats[e]) {
              stats[e] *= mod
            } else {
              stats[e] = 1 * mod
              let melee_stuff = 0
              let ranged_stuff = 0
              if (
                stats["DamageCavalry"] ||
                stats["DamageHand"] ||
                (stats["DamageSiegeMeleeAttack"] && unit.id === "No_Sie_Ram")
              ) {
                melee_stuff = 1
              }
              if (
                stats["DamageRanged"] ||
                stats["DamageSiegeRangedAttack"] ||
                stats["DamageSiegeRangedAttack2"]
              ) {
                ranged_stuff = 1
              }
              if (melee_stuff === 1 && ranged_stuff === 0) {
                delete stats["DamageBonusUnitTypeVillager1RangedAttack"]
              }
              if (melee_stuff === 0 && ranged_stuff === 1) {
                delete stats["DamageBonusUnitTypeVillager1MeleeAttack"]
              }
              if (melee_stuff === 0 && ranged_stuff === 0) {
                delete stats["DamageBonusUnitTypeVillager1RangedAttack"]
                delete stats["DamageBonusUnitTypeVillager1MeleeAttack"]
              }
            }
          })
          break
        case "DamageBonusAbstractVillager":
          ;[
            "DamageBonusAbstractVillagerRangedAttack",
            "DamageBonusAbstractVillagerMeleeAttack"
          ].forEach(e => {
            if (stats[e]) {
              stats[e] *= mod
            } else {
              stats[e] = 1 * mod
              let melee_stuff = 0
              let ranged_stuff = 0
              if (
                stats["DamageCavalry"] ||
                stats["DamageHand"] ||
                (stats["DamageSiegeMeleeAttack"] && unit.id === "No_Sie_Ram")
              ) {
                melee_stuff = 1
              }
              if (
                stats["DamageRanged"] ||
                stats["DamageSiegeRangedAttack"] ||
                stats["DamageSiegeRangedAttack2"]
              ) {
                ranged_stuff = 1
              }
              if (melee_stuff === 1 && ranged_stuff === 0) {
                delete stats["DamageBonusAbstractVillagerRangedAttack"]
              }
              if (melee_stuff === 0 && ranged_stuff === 1) {
                delete stats["DamageBonusAbstractVillagerMeleeAttack"]
              }
              if (melee_stuff === 0 && ranged_stuff === 0) {
                delete stats["DamageBonusAbstractVillagerRangedAttack"]
                delete stats["DamageBonusAbstractVillagerMeleeAttack"]
              }
            }
          })
          break
        case "DamageBonusAbstractPriest":
          ;[
            "DamageBonusAbstractPriestRangedAttack",
            "DamageBonusAbstractPriestMeleeAttack"
          ].forEach(e => {
            if (stats[e]) {
              stats[e] *= mod
            } else {
              stats[e] = 1 * mod
              let melee_stuff = 0
              let ranged_stuff = 0
              if (
                stats["DamageCavalry"] ||
                stats["DamageHand"] ||
                (stats["DamageSiegeMeleeAttack"] && unit.id === "No_Sie_Ram")
              ) {
                melee_stuff = 1
              }
              if (
                stats["DamageRanged"] ||
                stats["DamageSiegeRangedAttack"] ||
                stats["DamageSiegeRangedAttack2"]
              ) {
                ranged_stuff = 1
              }
              if (melee_stuff === 1 && ranged_stuff === 0) {
                delete stats["DamageBonusAbstractPriestRangedAttack"]
              }
              if (melee_stuff === 0 && ranged_stuff === 1) {
                delete stats["DamageBonusAbstractPriestMeleeAttack"]
              }
              if (melee_stuff === 0 && ranged_stuff === 0) {
                delete stats["DamageBonusAbstractPriestMeleeAttack"]
                delete stats["DamageBonusAbstractPriestRangedAttack"]
              }
            }
          })
          break
        case "TargetSpeedBoostRangedAttack":
          ;[
            "TargetSpeedBoostRangedAttack",
            "TargetSpeedBoostPoisonAttack"
          ].forEach(e => {
            if (stats[e]) {
              stats[e] *= mod
            } else {
              stats[e] = 1 * mod
            }
            let melee_stuff = 0
            let ranged_stuff = 0
            let poison_stuff = 0
            if (
              stats["DamageCavalry"] ||
              stats["DamageHand"] ||
              (stats["DamageSiegeMeleeAttack"] && unit.id === "No_Sie_Ram")
            ) {
              melee_stuff = 1
            }
            if (
              stats["DamageRanged"] ||
              stats["DamageSiegeRangedAttack"] ||
              stats["DamageSiegeRangedAttack2"]
            ) {
              ranged_stuff = 1
            }
            if (stats["PoisonAttack"]) {
              poison_stuff = 1
            }
            if (poison_stuff === 0) {
              delete stats["TargetSpeedBoostPoisonAttack"]
            }
            if (melee_stuff === 1 && ranged_stuff === 0) {
              delete stats["TargetSpeedBoostRangedAttack"]
            }
            if (melee_stuff === 0 && ranged_stuff === 1) {
              //delete stats["TargetSpeedBoostMeleeAttack"]
            }
            if (melee_stuff === 0 && ranged_stuff === 0) {
              //delete stats["TargetSpeedBoostMeleeAttack"]
              delete stats["TargetSpeedBoostRangedAttack"]
            }
          })
          break
        case "TargetSpeedBoostMeleeAttack":
          ;["TargetSpeedBoostMeleeAttack"].forEach(e => {
            if (stats[e]) {
              stats[e] *= mod
            } else {
              stats[e] = 1 * mod
            }
            let melee_stuff = 0
            let ranged_stuff = 0
            if (
              stats["DamageCavalry"] ||
              stats["DamageHand"] ||
              (stats["DamageSiegeMeleeAttack"] && unit.id === "No_Sie_Ram")
            ) {
              melee_stuff = 1
            }
            if (
              stats["DamageRanged"] ||
              stats["DamageSiegeRangedAttack"] ||
              stats["DamageSiegeRangedAttack2"]
            ) {
              ranged_stuff = 1
            }
            if (melee_stuff === 1 && ranged_stuff === 0) {
              //delete stats["TargetSpeedBoostRangedAttack"]
            }
            if (melee_stuff === 0 && ranged_stuff === 1) {
              delete stats["TargetSpeedBoostMeleeAttack"]
            }
            if (melee_stuff === 0 && ranged_stuff === 0) {
              delete stats["TargetSpeedBoostMeleeAttack"]
              //delete stats["TargetSpeedBoostRangedAttack"]
            }
          })
          break
        case "HitPercentRangedAttack":
          ;["HitPercentRangedAttack"].forEach(e => {
            if (stats[e]) {
              stats[e] = ((stats[e] / 100 + 1) * mod - 1) * 100
            } else {
              stats[e] = (mod - 1) * 100
            }
            let melee_stuff = 0
            let ranged_stuff = 0
            if (
              stats["DamageCavalry"] ||
              stats["DamageHand"] ||
              (stats["DamageSiegeMeleeAttack"] && unit.id === "No_Sie_Ram")
            ) {
              melee_stuff = 1
            }
            if (
              stats["DamageRanged"] ||
              stats["DamageSiegeRangedAttack"] ||
              stats["DamageSiegeRangedAttack2"]
            ) {
              ranged_stuff = 1
            }
            if (melee_stuff === 1 && ranged_stuff === 0) {
              delete stats["HitPercentRangedAttack"]
            }
            if (melee_stuff === 0 && ranged_stuff === 1) {
              //delete stats["TargetSpeedBoostMeleeAttack"]
            }
            if (melee_stuff === 0 && ranged_stuff === 0) {
              //delete stats["TargetSpeedBoostMeleeAttack"]
              delete stats["HitPercentRangedAttack"]
            }
          })
          break
        case "HitPercentMeleeAttack":
          ;["HitPercentMeleeAttack"].forEach(e => {
            if (stats[e]) {
              stats[e] = ((stats[e] / 100 + 1) * mod - 1) * 100
            } else {
              stats[e] = (mod - 1) * 100
            }
            let melee_stuff = 0
            let ranged_stuff = 0
            if (
              stats["DamageCavalry"] ||
              stats["DamageHand"] ||
              (stats["DamageSiegeMeleeAttack"] && unit.id === "No_Sie_Ram")
            ) {
              melee_stuff = 1
            }
            if (
              stats["DamageRanged"] ||
              stats["DamageSiegeRangedAttack"] ||
              stats["DamageSiegeRangedAttack2"]
            ) {
              ranged_stuff = 1
            }
            if (melee_stuff === 1 && ranged_stuff === 0) {
              //delete stats["TargetSpeedBoostRangedAttack"]
            }
            if (melee_stuff === 0 && ranged_stuff === 1) {
              delete stats["HitPercentMeleeAttack"]
            }
            if (melee_stuff === 0 && ranged_stuff === 0) {
              delete stats["HitPercentMeleeAttack"]
              //delete stats["TargetSpeedBoostRangedAttack"]
            }
          })
          break
        case "GatherFood":
          ;["GatherFood"].forEach(e => {
            if (stats[e]) {
              stats[e] *= mod
            }
          })
          break
        case "GatherGold":
          ;["GatherGold"].forEach(e => {
            if (stats[e]) {
              stats[e] *= mod
            }
          })
          break
        case "GatherTree":
          ;["GatherTree"].forEach(e => {
            if (stats[e]) {
              stats[e] *= mod
            }
          })
          break
        case "GatherStone":
          ;["GatherStone"].forEach(e => {
            if (stats[e]) {
              stats[e] *= mod
            }
          })
          break
        case "GatherHuntable":
          ;["GatherHuntable"].forEach(e => {
            if (stats[e]) {
              stats[e] *= mod
            }
          })
          break
        case "GatherHerdable":
          ;["GatherHerdable"].forEach(e => {
            if (stats[e]) {
              stats[e] *= mod
            }
          })
          break
        case "GatherAbstractFruit":
          ;["GatherAbstractFruit"].forEach(e => {
            if (stats[e]) {
              stats[e] *= mod
            }
          })
          break
        case "GatherAbstractFarm":
          ;["GatherAbstractFarm"].forEach(e => {
            if (stats[e]) {
              stats[e] *= mod
            }
          })
          break
        case "GatherAbstractFish":
          ;["GatherAbstractFish"].forEach(e => {
            if (stats[e]) {
              stats[e] *= mod
            }
          })
          break
        case "CarryCapacityFood":
          ;["CarryCapacityFood"].forEach(e => {
            if (stats[e]) {
              stats[e] *= mod
            }
          })
          break
        case "CarryCapacityWood":
          ;["CarryCapacityWood"].forEach(e => {
            if (stats[e]) {
              stats[e] *= mod
            }
          })
          break
        case "CarryCapacityGold":
          ;["CarryCapacityGold"].forEach(e => {
            if (stats[e]) {
              stats[e] *= mod
            }
          })
          break
        case "CarryCapacityStone":
          ;["CarryCapacityStone"].forEach(e => {
            if (stats[e]) {
              stats[e] *= mod
            }
          })
          break
        case "CostAll":
        case "Cost":
          this.setBaseStat(stats, "CostFood")
          this.setBaseStat(stats, "CostWood")
          this.setBaseStat(stats, "CostGold")
          this.setBaseStat(stats, "CostStone")
          stats.CostFood *= mod
          stats.CostWood *= mod
          stats.CostGold *= mod
          stats.CostStone *= mod
          break
        case "RateHeal":
          if (stats.RateHealInCombat !== undefined) {
            stats.RateHealInCombat *= mod
          } else {
            if (stats.RateAreaHeal !== undefined) {
              stats.RateAreaHeal *= mod
            } else if (stats.RateAreaHealInCombat !== undefined) {
              stats.RateAreaHealInCombat *= mod
            } else {
              stats[effect.type] *= mod
            }
          }
          break
        default:
          if (
            (effect.type.startsWith("Armor") &&
              effect.type !== "ArmorVulnerability") ||
            effect.type === "TargetSpeedBoostResist" ||
            effect.type === "AreaDamageReduction"
          ) {
            this.setBaseStat(stats, effect.type)
            stats[effect.type] = 1 - (1 - stats[effect.type]) / effect.amount
            return
          }
          if (
            (effect.type.startsWith("Convert") &&
              effect.type !== "ConvertResist") ||
            effect.type === "MaximumRangeConvert"
          ) {
            const chaosKey = effect.type.replace("Convert", "Chaos")
            if (stats["ChaosStandardConvertable"]) {
              this.setBaseStat(stats, chaosKey)
              stats[chaosKey] *= mod
              return
            }
          }

          if (effect.type.startsWith("Empower")) {
            mod = (mod - 1) / 11 + 1
          }

          this.setBaseStat(stats, effect.type)
          stats[effect.type] *= mod

          if (unit.types.includes("Unit")) {
            delete stats["BuildingWorkRate"]
          }
      }
    }
  }
}
</script>

<style lang="scss">
.stats-container {
  display: flex;
  flex-direction: column;
  width: 100%;

  div {
    display: flex;
    flex-direction: row;

    & > * {
      align-self: center;
    }
  }
}
</style>
