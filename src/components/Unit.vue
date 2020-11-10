<template>
  <UnitSelector v-model="selection" />
  <div class="unit-portrait">
    <img
      :src="require(`../assets/img/Art/${selection.unit.icon}`)"
      class="medium-img"
      :title="selection.unit.name"
    />
  </div>
</template>

<script>
import UnitSelector from "./UnitSelector.vue"

export default {
  name: "Unit",
  components: { UnitSelector },
  data() {
    return {
      selection: { civ: "greeks", unit: { name: "None", icon: "32.png" } }
    }
  }
}
</script>

<style lang="scss"></style>
