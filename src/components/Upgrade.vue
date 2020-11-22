<template>
  <div
    class="upgrade"
    :title="upgrade.name"
    :class="{ selected: selected }"
    @click="selected = !selected"
  >
    <Icon size="md" sprite="upgrades" :name="upgrade.icon" />
  </div>
</template>

<script>
import Icon from "./Icon.vue"

// TODO hover tooltip
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
  emits: ["update:modelValue"],
  data() {
    return {
      selected: false
    }
  },
  watch: {
    selected(val) {
      this.$emit("update:modelValue", val ? this.upgrade.effects : [])
    },
    modelValue(val) {
      if (!val.length) {
        this.selected = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.upgrade {
  opacity: 0.5;
  transition: opacity 0.1s ease-in-out;

  &.selected {
    opacity: 1;
  }

  &:hover {
    cursor: pointer;
  }
}
</style>
