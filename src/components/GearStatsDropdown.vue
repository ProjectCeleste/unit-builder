<template>
  <div class="dropdown p-2">
    <div class="is-bold gear-name">
      {{ gear.name }}
    </div>
    <div
      v-if="gear.levels && gear.levels.length"
      class="level-selector-container"
    >
      <span class="mr-1">Level:</span>
      <span
        v-for="l in gear.levels"
        :key="l"
        class="level px-1"
        :class="{ selected: level === l }"
        @click="level = l"
      >
        {{ l - 3 }}
      </span>
    </div>
    <div class="stats-range-container">
      <StatRange
        v-for="effect in filteredGearEffects"
        :key="effect.type"
        v-model="effects[effect.type]"
        :effect="effect"
        :level="level"
        :fixed="gear.fixed"
      />
    </div>
    <span v-if="!gear.effects.length">No effects.</span>
  </div>
</template>

<script>
import StatRange from "./StatRange.vue"
import effects from "../data/effects.json"

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
  computed: {
    filteredGearEffects() {
      return this.gear.effects.filter(e => effects[e.type].type !== "action")
    }
  },
  watch: {
    gear() {
      this.reset()
    },
    level(val) {
      this.resetEffects()
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
            absolute: this.findEffect(type).absolute,
            amount: this.effects[type]
          })
        }
        this.$emit("update:modelValue", g)
      }
    }
  },
  methods: {
    findEffect(type) {
      for (let key in this.gear.effects) {
        const e = this.gear.effects[key]
        if (e.type === type) {
          return e
        }
      }
      return undefined
    },
    reset() {
      this.level = this.gear.levels[this.gear.levels.length - 1]
      this.resetEffects()
    },
    resetEffects() {
      this.effects = {}
      this.gear.effects.forEach(e => {
        this.effects[e.type] = e.amount + e.scaling * this.level
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.dropdown {
  background-color: $tooltip-background-color;
  width: auto !important;
}

.gear-name {
  word-break: keep-all;
  white-space: normal;
}

.stats-range-container {
  display: table;
  width: 100%;
}

.level-selector-container {
  .level {
    &:hover {
      cursor: pointer;
    }

    &:not(.selected) {
      color: $color-muted;
    }
  }
}
</style>
