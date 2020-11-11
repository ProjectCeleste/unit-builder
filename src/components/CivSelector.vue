<template>
  <div class="civ-selector is-flex is-justify-content-center">
    <div
      v-for="civ in civs"
      :key="civ"
      class="mx-1 civ-selector-option"
      @click="$emit('update:modelValue', civ)"
    >
      <img
        :src="require(`../assets/img/art/civs/${civ}.png`)"
        class="small-img"
        :title="civ"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: "CivSelector",
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
.civ-selector-option {
  &:hover {
    cursor: pointer;
  }
}
</style>
