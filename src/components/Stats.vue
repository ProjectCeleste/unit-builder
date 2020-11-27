<template>
  <div class="stats-container">
    <div class="my-1 cost">
      <span class="is-flex-grow-1">Cost</span>
      <CostStats :cost="computedStatsCost" />
    </div>
    <div
      v-for="(stat, key) in computedStatsWithoutCost"
      :key="key"
      class="my-1"
    >
      <span class="is-flex-grow-1">{{ effectName(key) }}</span>
      <span>{{ formatEffect(key, stat) }}</span>
      <Icon sprite="icons" :name="effectIcon(key)" size="xs" class="ml-1" />
    </div>
  </div>
</template>

<script>
import effects from "../data/effects.json"
import Icon from "./Icon.vue"
import CostStats from "./CostStats.vue"
// import { effectAppliesToUnit } from "../stats.js"

export default {
  name: "Stats",
  components: { Icon, CostStats },
  props: {
    base: {
      type: Object,
      default() {
        return {}
      }
    },
    gear: {
      type: Object,
      default() {
        return {}
      }
    },
    advisors: {
      type: Object,
      default() {
        return {}
      }
    },
    milestones: {
      type: Object,
      default() {
        return {}
      }
    },
    upgrades: {
      type: Array,
      default() {
        return []
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
    computedStats() {
      const stats = {}
      for (let key in this.base) {
        stats[key] = this.base[key]
      }

      for (let key in this.gear) {
        const gear = this.gear[key]
        for (let i = 0; i < gear.effects.length; i++) {
          const effect = gear.effects[i]
          this.applyEffect(effect, stats)
        }
      }

      for (let i = 0; i < this.upgrades.length; i++) {
        const effect = this.upgrades[i]
        this.applyEffect(effect, stats)
      }
      return stats
    }
  },
  methods: {
    effectName(name) {
      return effects[name].name
    },
    effectIcon(name) {
      return effects[name].icon
    },
    formatEffect(name, value) {
      const effect = effects[name]
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
          effectName !== "ConvertStandardConvertable"
        ) {
          stats[effectName] = stats.ConvertStandardConvertable
        } else {
          stats[effectName] = effects[effectName].base
        }
      }
    },
    applyEffect(effect, stats) {
      if (effects[effect.type].type === "action") {
        return
      }
      let mod = effect.amount
      if (effect.absolute) {
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
              this.setBaseStat(stats, keyDmg)
              stats[keyDmg] *= mod
            }
          }
          break
        case "DamageMeleeAttack":
          for (let keyDmg in stats) {
            if (keyDmg === "DamageHand" || keyDmg === "DamageCavalry") {
              this.setBaseStat(stats, keyDmg)
              stats[keyDmg] *= mod
            }
          }
          break
        case "DamageRangedAttack":
          for (let keyDmg in stats) {
            if (keyDmg === "DamageRanged") {
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
            stats[effect.type] *= mod
          }
          break
        default:
          this.setBaseStat(stats, effect.type)
          if (effect.type.startsWith("Armor")) {
            stats[effect.type] = 1 - (1 - stats[effect.type]) / effect.amount
          } else {
            stats[effect.type] *= mod
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
