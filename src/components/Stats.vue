<template>
  <div class="stats-container">
    <!-- TODO cost and population -->
    <div v-for="(stat, key) in computedStats" :key="key" class="my-1">
      <span>{{ effectName(key) }}</span>
      <span>{{ stat }}</span>
    </div>
  </div>
</template>

<script>
import effects from "../data/effects.json"

export default {
  name: "Stats",
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
      type: Object,
      default() {
        return {}
      }
    }
  },
  computed: {
    computedStats() {
      const stats = {}
      for (let key in this.base) {
        stats[key] = this.base[key]
      }

      for (let key in this.gear) {
        const gear = this.gear[key]
        for (let i = 0; i < gear.effects.length; i++) {
          const effect = gear.effects[i]
          let mod = effect.amount
          if (effect.absolute) {
            this.setBaseStat(stats, effect.type)
            stats[effect.type] += mod
            continue
          }

          if (
            (effect.type.indexOf("Convert") === 0 &&
              effect.type !== "ConvertResist") ||
            effect.type === "TargetSpeedBoost"
          ) {
            mod *= -1
          }

          // If type is Damage, apply to all damage subtypes
          switch (effect.type) {
            case "Damage":
            case "AttackSpeed":
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
            default:
              this.setBaseStat(stats, effect.type)
              if (effect.type.startsWith("Armor")) {
                stats[effect.type] =
                  1 - (1 - stats[effect.type]) / effect.amount
              } else {
                stats[effect.type] *= mod
              }
          }
        }
      }
      // TODO filter advisors, milestones and upgrades if not applied
      return stats
    }
  },
  methods: {
    effectName(name) {
      return effects[name].name
    },
    formatEffect(name, value) {
      // const effect = effects[name]
      // TODO handle effect type
      return value
    },
    setBaseStat(stats, effectName) {
      if (!(effectName in stats)) {
        stats[effectName] = effects[effectName].base
      }
    }
  }
}
</script>

<style lang="scss">
.stats-container {
  display: table;

  div {
    display: table-row;
  }
}
</style>
