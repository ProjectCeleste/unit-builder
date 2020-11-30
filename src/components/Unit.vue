<template>
  <div class="unit is-relative">
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
    <Collapse
      v-if="selection.unit.name !== 'None'"
      title="Advisors"
      class="mb-2"
    >
      <div
        class="advisor-selector-container is-flex is-flex-wrap-nowrap is-justify-content-center card-content"
      >
        <AdvisorSelector
          v-for="i in [0, 1, 2, 3]"
          :key="i"
          v-model="advisors[i]"
          :unit="selection.unit"
          :civ="selection.civ"
          :age="i"
          class="mx-1 is-align-self-flex-end"
        />
      </div>
    </Collapse>
    <Collapse
      v-if="selection.unit.name !== 'None'"
      title="Upgrades"
      class="mb-2"
    >
      <UpgradeSelector
        v-model="upgrades"
        :unit="selection.unit"
        :civ="selection.civ"
        class="card-content"
      />
    </Collapse>
    <Collapse v-if="selection.unit.name !== 'None'" title="Stats">
      <Stats
        :unit="selection.unit"
        :gear="gear"
        :upgrades="upgrades"
        :advisors="advisors"
        class="card-content"
      />
    </Collapse>
  </div>
</template>

<script>
import UnitSelector from "./UnitSelector.vue"
import GearSelector from "./GearSelector.vue"
import UpgradeSelector from "./UpgradeSelector.vue"
import AdvisorSelector from "./AdvisorSelector.vue"
import Collapse from "./Collapse.vue"
import Icon from "./Icon.vue"
import Stats from "./Stats.vue"

export default {
  name: "Unit",
  components: {
    UnitSelector,
    GearSelector,
    Stats,
    Icon,
    Collapse,
    UpgradeSelector,
    AdvisorSelector
  },
  data() {
    return {
      selection: { civ: "greek", unit: { name: "None", icon: "Generic" } },
      gear: {},
      upgrades: {},
      advisors: []
    }
  },
  watch: {
    selection() {
      this.gear = {}
      this.upgrades = {}
      this.advisors = []
    }
  }
}
</script>

<style lang="scss">
.unit {
  min-width: 300px;

  &:first-child {
    margin-left: auto;
  }

  &:last-child {
    margin-right: auto;
  }
}
</style>
