<template>
  <div class="upgrade-container is-flex is-flex-direction-row">
    <Icon
      v-if="isChained"
      sprite="icons"
      size="sm"
      name="arrow-right"
      class="chain-indicator is-align-self-center"
      :class="{ selected: selected }"
    />
    <div
      class="upgrade p-1"
      :title="upgrade.name"
      :class="{ selected: selected }"
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
      v-model="chainEffects"
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
      type: Array,
      default() {
        return []
      }
    },
    upgrade: { type: Object, required: true },
    isChained: { type: Boolean, default: false }
  },
  emits: ["update:modelValue", "mousemove", "mouseleave"],
  data() {
    return {
      selected: false,
      chainEffects: []
    }
  },
  watch: {
    selected(val) {
      // Unselect next upgrades in the chain too
      if (!val) {
        this.chainEffects = []
      }
      this.$emit(
        "update:modelValue",
        val
          ? this.upgrade.effects.slice().concat(this.chainEffects)
          : this.chainEffects
      )
    },
    modelValue(val) {
      if (!val.length) {
        this.selected = false
      }
    },
    chainEffects(val) {
      this.$emit(
        "update:modelValue",
        this.selected ? this.upgrade.effects.slice().concat(val) : val
      )

      // Select previous upgrades in the chain too
      if (!this.selected && val.length) {
        this.selected = true
      }
    }
  },
  methods: {
    onMouseMove($event, upgrade) {
      this.$emit("mousemove", $event, upgrade)
    },
    onSelect() {
      this.selected = !this.selected
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
}
</style>
