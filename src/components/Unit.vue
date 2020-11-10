<template>
  <UnitSelector v-model="selection" />
  <div class="unit-portrait is-flex is-flex-wrap-nowrap">
    <img
      :src="require(`../assets/img/Art/${selection.unit.icon}`)"
      class="medium-img mr-3"
      :title="selection.unit.name"
    />
    <div class="gear-selector-container is-flex is-flex-wrap-nowrap">
      <GearSelector
        v-for="(slot, key) in selection.unit.slots"
        :key="key"
        v-model="gear[slot]"
        :type="slot"
        class="mr-1 is-align-self-flex-end"
      />
    </div>
  </div>
  <Stats :gear="gear" />
</template>

<script>
import UnitSelector from "./UnitSelector.vue"
import GearSelector from "./GearSelector.vue"
import Stats from "./Stats.vue"

export default {
  name: "Unit",
  components: { UnitSelector, GearSelector, Stats },
  data() {
    return {
      selection: { civ: "greek", unit: { name: "None", icon: "32.png" } },
      gear: {}
    }
  },
  watch: {
    selection() {
      this.gear = {}
    }
  }
}
</script>

<style lang="scss"></style>
