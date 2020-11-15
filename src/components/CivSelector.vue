<template>
  <div class="mb-2 civ-selector is-flex is-justify-content-center">
    <div
      v-for="civ in civs"
      :key="civ"
      class="civ-selector-option mr-3"
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

    &:hover {
      cursor: pointer;
    }
  }
}
</style>
