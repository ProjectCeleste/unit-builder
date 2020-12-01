<template>
  <div class="my-2 px-2 civ-selector is-flex is-justify-content-center">
    <div
      v-for="civ in civs"
      :key="civ"
      class="civ-selector-option"
      :class="{ selected: modelValue === civ }"
      @click="$emit('update:modelValue', civ)"
    >
      <Icon
        sprite="icons"
        :name="civ"
        :title="civ.charAt(0).toUpperCase() + civ.slice(1)"
        size="sm"
      />
    </div>
  </div>
</template>

<script>
import Icon from "./Icon.vue"
import Civs from "../data/civs.json"

export default {
  name: "CivSelector",
  components: { Icon },
  props: {
    modelValue: {
      type: String,
      required: true
    },
    except: { type: String, default: undefined }
  },
  emits: ["update:modelValue"],
  computed: {
    civs() {
      return this.except ? Civs.filter(c => c !== this.except) : Civs
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
