<template>
  <div
    class="upgrade-container is-flex is-flex-direction-row"
    :class="{ disabled: disabled }"
  >
    <Icon
      v-if="isChained"
      sprite="icons"
      size="sm"
      name="arrow-right"
      class="chain-indicator is-align-self-center"
      :class="{ selected: modelValue.selected }"
    />
    <div
      class="upgrade p-1"
      :title="upgrade.name"
      :class="{ selected: modelValue.selected }"
      @click="onSelect"
      @mousemove="onMouseMove($event, upgrade)"
      @touchmove="onMouseMove($event, upgrade)"
      @mouseleave="$emit('mouseleave', $event)"
      @touchend="$emit('mouseleave', $event)"
      @touchcancel="$emit('mouseleave', $event)"
    >
      <Icon size="md" sprite="upgrades" :name="upgrade.icon" />
    </div>
    <Upgrade
      v-if="upgrade.chain"
      v-model="chain"
      :upgrade="upgrade.chain"
      :is-chained="true"
      @mouseleave="$emit('mouseleave', $event)"
      @mousemove="onMouseMove"
    />
  </div>
</template>

<script>
import Icon from "./Icon.vue"

export default {
  name: "Upgrade",
  components: { Icon },
  props: {
    modelValue: {
      type: Object,
      default() {
        return { selected: false, effects: [], chain: undefined }
      }
    },
    upgrade: { type: Object, required: true },
    isChained: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  },
  emits: ["update:modelValue", "mousemove", "mouseleave"],
  data() {
    return {
      chain: undefined
    }
  },
  watch: {
    modelValue: {
      deep: true,
      handler(val) {
        this.chain = val.chain
      }
    },
    chain: {
      deep: true,
      handler(val) {
        const newSelected = this.modelValue.selected || (val && val.selected)
        this.$emit("update:modelValue", {
          selected: newSelected,
          effects: newSelected ? this.upgrade.effects : [],
          chain: val
        })
      }
    }
  },
  mounted() {
    this.chain = this.modelValue.chain
  },
  methods: {
    onMouseMove($event, upgrade) {
      this.$emit("mousemove", $event, upgrade)
    },
    onSelect() {
      if (this.disabled) {
        return
      }
      const newSelected = !this.modelValue.selected
      let effects = []
      if (newSelected) {
        effects = effects.concat(this.upgrade.effects)
        if (this.modelValue.chainSelected) {
          effects = effects.concat(this.chain.effects)
        }
      }
      this.$emit("update:modelValue", {
        selected: newSelected,
        effects: effects,
        chainSelected: newSelected ? this.modelValue.chainSelected : false
      })
      this.$emit("mouseleave")
    }
  }
}
</script>

<style lang="scss" scoped>
.upgrade-container {
  .upgrade,
  .chain-indicator {
    opacity: 0.35;
    transition: opacity 0.1s linear;

    &.selected {
      opacity: 1;
    }
  }

  .chain-indicator {
    margin-left: -5px;
    margin-right: -5px;
  }

  .upgrade:hover {
    cursor: pointer;
  }

  &.disabled {
    .upgrade:hover {
      cursor: not-allowed;
    }
  }
}
</style>
