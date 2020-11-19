<template>
  <div class="card mb-2">
    <div class="card-header">
      <h4 class="title is-size-5">
        Select a unit
      </h4>
    </div>
    <div class="card-content">
      <UnitSelector v-model="selection" />
      <div
        v-if="selection.unit.name !== 'None'"
        class="mt-2 unit-portrait is-flex is-flex-wrap-nowrap is-justify-content-center"
      >
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
    </div>
  </div>
  <div v-if="selection.unit.name !== 'None'" class="card">
    <div class="card-header">
      <h4 class="title is-size-5">
        Stats
      </h4>
    </div>
    <Stats :base="selection.unit.stats" :gear="gear" class="card-content" />
  </div>
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
