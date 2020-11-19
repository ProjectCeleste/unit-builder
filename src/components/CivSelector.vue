<template>
  <div class="my-2 px-2 civ-selector is-flex is-justify-content-center">
    <div
      v-for="civ in civs"
      :key="civ"
      class="civ-selector-option"
      :class="{ selected: modelValue === civ }"
      @click="$emit('update:modelValue', civ)"
    >
      <Icon sprite="icons" :name="civ" :title="civ" size="sm" />
    </div>
  </div>
</template>

<script>
import Icon from "./Icon.vue"

export default {
  name: "CivSelector",
  components: { Icon },
  props: {
    modelValue: {
      type: String,
      required: true
    }
  },
  emits: ["update:modelValue"],
  data() {
    return {
      civs: require("../data/civs.json")
    }
  }
}
</script>

<style lang="scss" scoped>
.civ-selector {
  .civ-selector-option {
    display: flex;
    border-radius: 50%;
    border-width: 2px;
    border-color: transparent;
    border-style: solid;

    &.selected {
      border-color: $color-positive;
    }

    &:hover {
      cursor: pointer;

      &:not(.selected) {
        border-color: rgba($color-positive, 0.5);
      }
    }

    &:not(:last-child) {
      margin-right: 0.2rem;
    }
  }
}
</style>
