<template>
  <form
    novalidate
    class="stat-range"
    :class="{
      'is-positive': effect.positive,
      'is-negative': !effect.positive,
      'stat-range-fixed': fixed
    }"
  >
    <span>{{ effectName }}</span>
    <input
      ref="input"
      class="stat-range-input"
      type="range"
      :min="min"
      :max="max"
      :value="modelValue"
      step="0.0001"
      :title="fixed ? 'This item has fixed stats' : ''"
      @input="onInput"
    />
    <span>{{
      toDisplay(effect, effect.absolute ? modelValue : modelValue - 1)
    }}</span>
    <span v-if="!effect.absolute && effect.type !== 'WorkRateSelfHeal'">
      %
    </span>
    <span v-if="effect.type === 'WorkRateSelfHeal'">/s</span>
  </form>
</template>

<script>
import effects from "../data/effects.json"
import { toDisplay } from "../stats.js"

// TODO invert negative stats range? (so highest value is at the right of the slider instead of left)

export default {
  name: "StatRange",
  props: {
    modelValue: {
      type: Number,
      default: undefined
    },
    effect: { type: Object, required: true },
    level: { type: Number, required: true },
    fixed: { type: Boolean, default: false }
  },
  emits: ["update:modelValue"],
  computed: {
    med() {
      return this.effect.amount + this.effect.scaling * this.level
    },
    min() {
      return this.fixed ? this.med : this.med * 0.95
    },
    max() {
      return this.fixed ? this.med : this.med * 1.05
    },
    effectName() {
      return effects[this.effect.type].name
    }
  },
  mounted() {
    // Patch for slider not updating when mounted on firefox
    this.$refs.input.value = this.modelValue
  },
  methods: {
    toDisplay,
    onInput($event) {
      this.$emit("update:modelValue", parseFloat($event.target.value))
    }
  }
}
</script>

<style lang="scss" scoped>
.stat-range {
  display: table-row;

  & > * {
    display: table-cell;
    vertical-align: middle;
  }

  .stat-range-input {
    cursor: pointer;
    height: 25px;
    padding: 0;
    margin: 0;
    padding-right: 15px;
    padding-left: 15px;
    outline: none;
    box-sizing: border-box;
    background: transparent;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 14px;
      height: 14px;
      background: #ebebeb;
      border-radius: 50%;
      cursor: pointer;
      margin-top: -4px;
      border: none;
    }

    &::-webkit-slider-runnable-track {
      width: 100%;
      height: 3px;
      cursor: pointer;
      background: #9a9994;
      border-radius: 1.3px;
      border: 0.2px solid #9a9994;
    }

    &::-moz-range-thumb {
      width: 14px;
      height: 14px;
      background: #ebebeb;
      border: none;
      cursor: pointer;
    }

    &::-moz-range-track {
      width: 100%;
      height: 3px;
      cursor: pointer;
      background: #9a9994;
      border-radius: 10px;
      border: 0.2px solid #9a9994;
    }
  }

  &.stat-range-fixed .stat-range-input {
    cursor: auto;

    &::-webkit-slider-thumb {
      width: 0px;
      height: 0px;
      cursor: auto;
    }

    &::-webkit-slider-runnable-track {
      cursor: auto;
    }

    &::-moz-range-thumb {
      width: 0px;
      height: 0px;
      cursor: auto;
    }

    &::-moz-range-track {
      cursor: auto;
    }
  }
}

@supports not (-ms-ime-align: auto) {
  .stat-range {
    min-width: 100%;
    -webkit-appearance: none;
    background: transparent;
  }
}
</style>
