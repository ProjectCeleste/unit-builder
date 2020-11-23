<template>
  <div class="upgrade-container">
    <div
      class="upgrade p-1"
      :title="upgrade.name"
      :class="{ selected: selected }"
      @click="selected = !selected"
      @mouseleave="$emit('mouseleave', $event)"
      @mousemove="onMouseMove($event, upgrade)"
    >
      <Icon size="md" sprite="upgrades" :name="upgrade.icon" />
    </div>
    <Upgrade
      v-if="upgrade.chain"
      v-model="chainEffects"
      :upgrade="upgrade.chain"
      @mouseleave="$emit('mouseleave', $event)"
      @mousemove="onMouseMove"
    />
  </div>
</template>

<script>
import Icon from "./Icon.vue"

// TODO chained upgrades

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
  emits: ["update:modelValue", "mousemove", "mouseleave"],
  data() {
    return {
      selected: false,
      chainEffects: []
    }
  },
  watch: {
    selected(val) {
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
    }
  },
  methods: {
    onMouseMove($event, upgrade) {
      this.$emit("mousemove", $event, upgrade)
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
