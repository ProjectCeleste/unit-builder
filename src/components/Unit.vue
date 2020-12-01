<template>
  <div class="unit is-relative">
    <div class="card mb-2">
      <div
        class="card-header is-flex is-flex-direction-row is-justify-content-space-between"
      >
        <h4 class="title is-size-5">
          Select a unit
        </h4>
        <Button
          v-if="showDelete"
          icon="close"
          tooltip="Delete unit"
          size="xs"
          class="is-align-self-flex-start"
          @click="$emit('unit-deleted')"
        />
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
      title="Milestones"
      class="mb-2"
    >
      <MilestoneSelector
        v-model="milestones"
        :civ="selection.civ"
        class="card-content"
      />
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
        :unlocked-tech="unlockedTech"
        class="card-content"
      />
    </Collapse>
    <Collapse v-if="selection.unit.name !== 'None'" title="Stats">
      <Stats
        :unit="selection.unit"
        :gear="gear"
        :upgrades="upgrades"
        :advisors="advisors"
        :milestones="milestones"
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
import MilestoneSelector from "./MilestoneSelector.vue"
import Collapse from "./Collapse.vue"
import Icon from "./Icon.vue"
import Stats from "./Stats.vue"
import Button from "./Button.vue"

export default {
  name: "Unit",
  components: {
    UnitSelector,
    GearSelector,
    Stats,
    Icon,
    Collapse,
    UpgradeSelector,
    AdvisorSelector,
    MilestoneSelector,
    Button
  },
  props: {
    showDelete: { type: Boolean, default: true }
  },
  emits: ["unit-deleted"],
  data() {
    return {
      selection: { civ: "greek", unit: { name: "None", icon: "Generic" } },
      gear: {},
      upgrades: {},
      advisors: [],
      milestones: {}
    }
  },
  computed: {
    unlockedTech() {
      let tech = []
      this.advisors.forEach(a => {
        tech = tech.concat(
          a.effects.filter(e => e.type === "UnlockUpgrade").map(e => e.tech)
        )
      })
      return tech
    }
  },
  watch: {
    selection() {
      this.$nextTick(() => {
        this.gear = {}
        this.upgrades = {}
        this.advisors = []
        this.milestones = {}
      })
    }
  }
}
</script>

<style lang="scss">
.unit {
  min-width: 300px;
  margin-left: #{map-get($spacing-values, "2")};
  margin-right: #{map-get($spacing-values, "2")};

  &:first-child {
    margin-left: auto;
  }

  &:last-child {
    margin-right: auto;
  }
}
</style>
