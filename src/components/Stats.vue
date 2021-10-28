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
      if (
        this.unit.id === "Ro_Inf_Aquilifer" ||
        this.unit.id === "Ro_Cav_PrimusPilus" ||
        this.unit.id === "No_Inf_Chief" ||
        this.unit.types.includes("Ship") ||
        this.unit.id.endsWith("_Bldg_Fortress") ||
        this.unit.id.endsWith("_Bldg_TownCenter") ||
        this.unit.types.includes("AbstractWall")
      ) {
        stats["ConvertResist"] = Infinity
      }

      // Remove stats from inactive actions
      this.unit.inactiveActions.forEach(a => {
        for (let key in stats) {
          if (key.startsWith(a)) {
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
      return e
    },
    effectIcon(name) {
      return effects[name].icon
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
        if (
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
        } else {
          stats[effectName] = effects[effectName].base
        }
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
          case "RangedAttack2":
            affectedStats.push("DamageRanged")
            break
          case "Heal":
            affectedStats.push("RateHeal")
            affectedStats.push("MaximumRangeHeal")
            affectedStats.push("HealArea")
            break
          case "AreaHeal":
            affectedStats.push("RateAreaHeal")
            affectedStats.push("MaximumRangeAreaHeal")
            affectedStats.push("AreaHealArea")
            break
          default:
            affectedStats.push(actionName)
        }
        affectedStats.forEach(s => {
          if (effect.amount === 0) {
            // Disable
            for (let key in unit.stats) {
              if (key.startsWith(s)) {
                delete stats[key]
              }
            }
          } else {
            if (unit.inactiveActions.find(a => a === s)) {
              for (let key in unit.stats) {
                if (key.startsWith(s) && stats[key] === undefined) {
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
        case "AttackSpeed":
          // If type is Damage, apply to all damage subtypes
          for (let keyDmg in stats) {
            if (
              keyDmg.startsWith("Damage") &&
              !keyDmg.startsWith("DamageBonus") &&
              keyDmg != "DamageArea"
            ) {
              stats[keyDmg] *= mod
            }
          }
          break
        case "AttackSpeedDamageRanged":
          ;["DamageRanged", "DamageSiegeRangedAttack"].forEach(e => {
            if (stats[e]) {
              stats[e] *= mod
            }
          })
          break
        case "AttackSpeedDamageRanged2":
          ;["DamageSiegeRangedAttack2"].forEach(e => {
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
      }
      if (
        this.unit.id === "Ro_Inf_Aquilifer" ||
        this.unit.id === "Ro_Cav_PrimusPilus" ||
        this.unit.id === "No_Inf_Chief" ||
        this.unit.types.includes("Ship") ||
        this.unit.id.endsWith("_Bldg_Fortress") ||
        this.unit.id.endsWith("_Bldg_TownCenter") ||
        this.unit.types.includes("AbstractWall")
      ) {
        stats["ConvertResist"] = Infinity
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
