<template>
  <div class="civ-selector is-flex is-justify-content-center">
    <div
      v-for="civ in civs"
      :key="civ"
      class="mx-1 civ-selector-option"
      @click="$emit('selected', civ)"
    >
      <img
        :src="require(`../assets/img/Art/civs/${civ}.png`)"
        class="small-img"
        :title="civ"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: "CivSelector",
  emits: ["selected"],
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
