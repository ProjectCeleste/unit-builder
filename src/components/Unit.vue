<template>
  <UnitSelector v-model="selection" />
  <div class="unit-portrait is-flex is-flex-wrap-nowrap">
    <Icon
      class="mr-3"
      sprite="units"
      :name="selection.unit.icon"
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
  <Stats :base="selection.unit.stats" :gear="gear" />
</template>

<script>
import UnitSelector from "./UnitSelector.vue"
import GearSelector from "./GearSelector.vue"
import Icon from "./Icon.vue"
import Stats from "./Stats.vue"

export default {
  name: "Unit",
  components: { UnitSelector, GearSelector, Stats, Icon },
  data() {
    return {
      selection: { civ: "greek", unit: { name: "None", icon: "Generic" } },
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
