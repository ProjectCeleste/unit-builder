<template>
  <div class="stats-container">
    <div v-for="(stat, key) in computedStats" :key="key" class="my-1">
      <span>{{ key }}</span>
      <span>{{ stat }}</span>
    </div>
  </div>
</template>

<script>
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
      if (stats.Cost) {
        stats.Cost = {}
        for (let keyCost in this.base.Cost) {
          stats.Cost[keyCost] = this.base.Cost[keyCost]
        }
      }

      for (let key in this.gear) {
        const gear = this.gear[key]
        for (let i = 0; i < gear.effects.length; i++) {
          const effect = gear.effects[i]
          if (effect.absolute) {
            stats[effect.type] += effect
            continue
          }

          // TODO if stat not present, add it (some start at one, others at zero)
          // examples: GatherHerdable, Build

          let mod = effect.amount
          if (
            effect.type.indexOf("Convert") == 0 ||
            effect.type == "TargetSpeedBoost"
          ) {
            // TODO conversion rate too
            mod *= -1
          }

          // If type is Damage, apply to all damage subtypes
          switch (effect.type) {
            case "Damage":
              for (let keyDmg in stats) {
                if (
                  keyDmg.startsWith("Damage") &&
                  !keyDmg.startsWith("DamageBonus") &&
                  keyDmg != "DamageArea"
                ) {
                  stats[keyDmg] *= mod
                }
              }
              continue
            case "CostAll":
            case "Cost":
              for (let keyCost in stats.Cost) {
                stats.Cost[keyCost] *= mod
              }
              break
            case "CostFood":
            case "CostWood":
            case "CostGold":
            case "CostStone":
              stats.Cost[effect.type.substring(4)] *= mod
              break
            default:
              stats[effect.type] *= mod
          }
        }
      }
      // TODO filter advisors, milestones and upgrades if not applied
      return stats
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
