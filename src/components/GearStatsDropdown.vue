<template>
  <div class="dropdown">
    <!-- TODO Level selector -->
    <div class="stats-range-container">
      <StatRange
        v-for="effect in gear.effects"
        :key="effect.type"
        v-model="effects[effect.type]"
        :effect="effect"
        :level="level"
      />
    </div>
    <span v-if="!gear.effects.length">No effects.</span>
  </div>
</template>

<script>
import StatRange from "./StatRange.vue"

export default {
  name: "GearStatsDropdown",
  components: { StatRange },
  props: {
    modelValue: {
      type: Object,
      default() {
        return { effects: [], level: 0 }
      }
    },
    gear: { type: Object, required: true }
  },
  emits: ["update:modelValue"],
  data() {
    return {
      effects: {},
      level: 43
    }
  },
  watch: {
    gear() {
      this.reset()
    },
    level(val) {
      this.$emit("update:modelValue", {
        effects: this.effects,
        level: val
      })
    },
    effects: {
      deep: true,
      handler() {
        const g = {
          effects: [],
          level: this.level
        }
        for (let type in this.effects) {
          g.effects.push({
            type: type,
            absolute: false,
            amount: this.effects[type]
          })
        }
        this.$emit("update:modelValue", g)
      }
    }
  },
  methods: {
    reset() {
      this.effects = {}
      this.level = this.gear.levels[this.gear.levels.length - 1]
      this.gear.effects.forEach(e => {
        this.effects[e.type] = e.amount + e.scaling * this.level
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.stats-range-container {
  display: table;
}
</style>
