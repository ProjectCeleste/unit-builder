<template>
  <form
    novalidate
    class="stat-range"
    :class="{
      'is-positive': effect.positive,
      'is-negative': !effect.positive,
      'stat-range-fixed': fixed
    }"
    @touchstart="$event.stopPropagation()"
    @touchend="$event.stopPropagation()"
    @submit="$event.preventDefault()"
  >
    <span>{{ effectName }}</span>
    <div class="input-container">
      <input
        ref="input"
        class="stat-range-input"
        type="range"
        :min="actualMin"
        :max="actualMax"
        :value="modelValue"
        step="0.0001"
        :title="fixed ? 'This item has fixed stats' : ''"
        @input="onInput"
      />
    </div>
    <div v-if="!fixed">
      <input
        v-model.number.lazy="displayInputValue"
        type="number"
        step="0.1"
        :min="min"
        :max="max"
        class="display-input has-text-right"
      />
    </div>
    <span v-else class="has-text-right">{{
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
import { fromDisplay, toDisplay } from "../stats.js"

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
  emits: ["update:modelValue", "input"],
  data() {
    return {
      displayInputValue: 0
    }
  },
  computed: {
    med() {
      return this.effect.amount + this.effect.scaling * this.level
    },
    min() {
      return this.fixed ? this.med : (this.med - 1) * 0.95 + 1
    },
    max() {
      return this.fixed ? this.med : (this.med - 1) * 1.05 + 1
    },
    effectName() {
      return effects[this.effect.type].name
    },
    actualMin() {
      return this.min > this.max ? this.max : this.min
    },
    actualMax() {
      return this.min > this.max ? this.min : this.max
    }
  },
  watch: {
    modelValue(val) {
      this.displayInputValue = toDisplay(
        this.effect,
        this.effect.absolute ? val : val - 1
      )
    },
    displayInputValue(val) {
      if (isNaN(val) || val === "") {
        val = parseFloat(
          toDisplay(this.effect, this.effect.absolute ? this.med : this.med - 1)
        )
      }
      val = fromDisplay(this.effect, val)
      if (val < this.actualMin) {
        val = this.actualMin
      } else if (val > this.actualMax) {
        val = this.actualMax
      }

      this.$emit("update:modelValue", val)
      this.$emit("input", val)
    }
  },
  mounted() {
    // Patch for slider not updating when mounted on firefox
    this.$refs.input.value = this.modelValue
    this.displayInputValue = toDisplay(
      this.effect,
      this.effect.absolute ? this.modelValue : this.modelValue - 1
    )
  },
  methods: {
    toDisplay,
    onInput($event) {
      const newVal = parseFloat($event.target.value)
      this.$emit("update:modelValue", newVal)
      this.$emit("input", newVal)
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
    white-space: normal;
    word-break: keep-all;
  }

  .input-container {
    width: 100%;
  }

  .display-input {
    appearance: none;
    border: none;
    background: none;
    outline: none;
    color: inherit;
    font-style: inherit;
    font-size: inherit;
    padding: 0;
    width: 45px;
  }
  .display-input[type="number"] {
    -moz-appearance: textfield;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
    }
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
    width: 100%;
    vertical-align: middle;

    appearance: none;
    -webkit-appearance: none;

    &::-webkit-slider-thumb {
      appearance: none;
      -webkit-appearance: none;
      width: 14px;
      height: 14px;
      background: #ebebeb;
      border-radius: 50%;
      cursor: pointer;
      margin-top: (-14px / 2);
      border: none;
    }

    &::-webkit-slider-runnable-track {
      appearance: none;
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
