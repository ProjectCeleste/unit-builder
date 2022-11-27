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
        <UnitSelector v-model="selection" @selected="onUnitSelected" />
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
              v-for="slot in selection.unit.slots"
              :key="slot"
              v-model="gear[slot]"
              :type="slot"
              class="mr-1 is-align-self-flex-end"
            />
          </div>
        </div>
        <div>
          <span>&nbsp;</span>
          <div v-for="type in selection.unit.types" :key="type">
            <div v-if="type.indexOf('UnitType') > -1"></div>
            <div v-else-if="type.indexOf('AbstractPriest') > -1">
              <div v-if="selection.unit.stats.ConvertStandardConvertable > 0">
                Converting Priest
              </div>
              <div v-if="selection.unit.stats.ChaosStandardConvertable > 0">
                Chaos Priest
              </div>
              <div v-else>
                Non-Converting Priest
              </div>
            </div>
            <div v-else-if="type.indexOf('Abstract') > -1">
              {{
                type
                  .replace("Abstract", "")
                  .replace("Archer", "Ranged")
                  .replace("Artillery", "Siege")
              }}
            </div>
            <div v-else>
              {{ type }}
            </div>
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
        :unit-id="unitId"
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
    unitId: { type: String, required: true },
    showDelete: { type: Boolean, default: true },
    modelValue: { type: Object, required: true }
  },
  emits: ["unit-deleted", "update:modelValue"],
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
    selection: {
      deep: true,
      handler() {
        this.$nextTick(() => {
          this.reset()
        })
      }
    },
    gear: {
      deep: true,
      handler() {
        this.updateModelValue()
      }
    },
    upgrades: {
      deep: true,
      handler() {
        this.updateModelValue()
      }
    },
    advisors: {
      deep: true,
      handler() {
        this.updateModelValue()
      }
    },
    milestones: {
      deep: true,
      handler() {
        this.updateModelValue()
      }
    },
    modelValue: {
      deep: true,
      handler(val) {
        this.$nextTick(() => {
          this.selection = val.selection
          this.gear = val.gear
          this.advisors = val.advisors
          this.upgrades = val.upgrades
          this.milestones = val.milestones
        })
      }
    }
  },
  mounted() {
    const modelValue = this.modelValue
    if (Object.keys(modelValue).length) {
      this.selection = modelValue.selection
      this.$nextTick(() => {
        this.gear = modelValue.gear
        this.advisors = modelValue.advisors
        this.upgrades = modelValue.upgrades
        this.milestones = modelValue.milestones
      })
    }
  },
  methods: {
    updateModelValue() {
      this.$emit("update:modelValue", {
        selection: this.selection,
        gear: this.gear,
        upgrades: this.upgrades,
        advisors: this.advisors,
        milestones: this.milestones
      })
    },
    reset() {
      this.gear = {}
      this.upgrades = {}
      this.advisors = []
      this.milestones = {}
    },
    onUnitSelected() {
      const originalUnitAdvisors = this.advisors
      const originalUnitMilestones = this.milestones
      const originalUnitSelection = this.modelValue.selection
      this.reset()
      if (this.selection.civ === originalUnitSelection.civ) {
        this.advisors = originalUnitAdvisors
        this.milestones = originalUnitMilestones
      }
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
