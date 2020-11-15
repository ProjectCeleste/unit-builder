<template>
  <form novalidate class="stat-range">
    <span>{{ effectName }}</span>
    <input
      ref="input"
      class="stat-range"
      :class="{ 'stat-range-fixed': effect.fixed }"
      type="range"
      :min="min"
      :max="max"
      :value="modelValue"
      step="0.0001"
      @input="onInput"
    />
    <span>{{ modelValueRounded }}</span>
    <span v-if="!effect.absolute">%</span>
  </form>
</template>

<script>
import effects from "../data/effects.json"

// TODO positive or negative

export default {
  name: "StatRange",
  props: {
    modelValue: {
      type: Number,
      default: undefined
    },
    effect: { type: Object, required: true },
    level: { type: Number, required: true }
  },
  emits: ["update:modelValue"],
  computed: {
    med() {
      return this.effect.amount + this.effect.scaling * this.level
    },
    min() {
      return this.med * 0.95
    },
    max() {
      return this.med * 1.05
    },
    effectName() {
      return effects[this.effect.type].name
    },
    modelValueRounded() {
      return ((this.modelValue - 1) * 100).toFixed(2)
    }
  },
  mounted() {
    // Patch for slider not updating when mounted on firefox
    this.$refs.input.value = this.modelValue
  },
  methods: {
    onInput($event) {
      this.$emit("update:modelValue", parseFloat($event.target.value))
    }
  }
}
</script>

<style lang="scss" scoped>
.stat-range {
  display: table-row;
  height: 25px;
  cursor: pointer;
  font: inherit;
  outline: none;
  box-sizing: border-box;
  padding: 0;
  margin: 0;
  padding-right: 15px;
  padding-left: 15px;

  & > * {
    display: table-cell;
    vertical-align: middle;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    background: #ebebeb;
    border-radius: 50%;
    cursor: pointer;
    margin-top: -4px;
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
    width: 12px;
    height: 12px;
    background: #ebebeb;
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

  &.stat-range-fixed {
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
