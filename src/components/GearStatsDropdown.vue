<template>
  <div class="dropdown p-2">
    <div class="is-bold wrap-word" :class="rarityClass">
      {{ gear.name }}
    </div>
    <div
      v-if="gear.levels && gear.levels.length"
      class="level-selector-container is-size-7"
    >
      <span>Level:</span>
      <span
        v-for="l in gear.levels"
        :key="l"
        class="level px-0-5"
        :class="{ selected: level === l }"
        @click="onLevelSelect(l)"
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
        @input="onInput"
      />
    </div>
    <span v-if="!gear.effects.length">No effects.</span>
  </div>
</template>

<script>
import StatRange from "./StatRange.vue"
import effects from "../data/effects.json"
import { rarityClass } from "../rarity.js"

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
    },
    rarityClass() {
      return rarityClass(this.gear.rarity)
    }
  },
  watch: {
    modelValue(val) {
      this.level = val.level
      this.effects = {}
      val.effects.forEach(e => {
        this.effects[e.type] = e.amount
      })
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
    },
    onLevelSelect(l) {
      this.level = l
      this.resetEffects()
      this.onInput()
    },
    onInput() {
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
}
</script>

<style lang="scss" scoped>
.dropdown {
  background-color: $tooltip-background-color;
  width: auto !important;
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
      &:hover {
        color: darken($color: $font-color, $amount: 20%) !important;
      }
    }
  }
}
</style>
