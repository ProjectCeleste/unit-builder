<template>
  <div class="upgrade-container">
    <div
      class="upgrade p-1"
      :title="upgrade.name"
      :class="{ selected: selected }"
      @click="onSelect"
      @mousemove="onMouseMove($event, upgrade)"
      @touchmove="onMouseMove($event, upgrade)"
      @mouseleave="$emit('mouseleave', $event)"
      @touchend="$emit('touchend', $event)"
      @touchcancel="$emit('mouseleave', $event)"
    >
      <Icon size="md" sprite="upgrades" :name="upgrade.icon" />
    </div>
    <Upgrade
      v-if="upgrade.chain"
      v-model="chainEffects"
      :upgrade="upgrade.chain"
      @mouseleave="$emit('mouseleave', $event)"
      @touchend="$emit('touchend', $event)"
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
    upgrade: { type: Object, required: true }
  },
  emits: ["update:modelValue", "mousemove", "mouseleave", "touchend"],
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
      this.$nextTick(() => {
        this.$emit("touchend")
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.upgrade {
  opacity: 0.5;
  transition: opacity 0.1s linear;

  &.selected {
    opacity: 1;
  }

  &:hover {
    cursor: pointer;
  }
}
</style>
