<template>
  <div
    class="upgrade-selector is-flex is-flex-direction-column is-flex-wrap is-relative"
  >
    <div class="is-flex is-flex-direction-row">
      <Upgrade
        v-for="u in upgrades"
        :key="u.id"
        v-model="upgradeValues[u.id]"
        :upgrade="u"
        @mouseleave="hoveredUpgrade = null"
        @mousemove="onMouseMove"
      />
    </div>
    <div class="is-flex is-flex-direction-column">
      <Upgrade
        v-for="u in chainedUpgrades"
        :key="u.id"
        v-model="upgradeValues[u.id]"
        :upgrade="u"
        @mouseleave="hoveredUpgrade = null"
        @mousemove="onMouseMove"
      />
    </div>
    {{ upgradeValues }}
    <Tooltip v-if="hoveredUpgrade" ref="tooltip" :x="x" :y="y">
      <Preview :item="hoveredUpgrade" type="upgrades" />
    </Tooltip>
  </div>
</template>

<script>
import upgrades from "../data/upgrades.json"
import Upgrade from "./Upgrade.vue"
import Tooltip from "./Tooltip.vue"
import Preview from "./Preview.vue"
import { upgradeAppliesToUnit, effectAppliesToUnit } from "../stats.js"

export default {
  name: "UpgradeSelector",
  components: { Upgrade, Tooltip, Preview },
  props: {
    modelValue: {
      type: Array,
      default() {
        return []
      }
    },
    civ: { type: String, required: true },
    unit: { type: Object, required: true }
  },
  emits: ["update:modelValue"],
  data() {
    return {
      upgradeValues: {},
      x: 0,
      y: 0,
      hoveredUpgrade: null
    }
  },
  computed: {
    upgrades() {
      return upgrades[this.civ]
        .filter(u => upgradeAppliesToUnit(u, this.unit))
        .filter(u => u.chain === undefined)
    },
    chainedUpgrades() {
      return upgrades[this.civ]
        .filter(u => upgradeAppliesToUnit(u, this.unit))
        .filter(u => u.chain !== undefined)
    }
  },
  watch: {
    upgradeValues: {
      deep: true,
      handler(val) {
        const effects = []
        for (let upgradeID in val) {
          const u = val[upgradeID]
          this.applyEffects(u, effects)
        }
        this.$emit("update:modelValue", effects)
      }
    },
    unit() {
      this.upgradeValues = {}
    }
  },
  methods: {
    applyEffects(upgrade, res) {
      if (upgrade === undefined) {
        return
      }
      const effects = upgrade.effects.filter(e =>
        effectAppliesToUnit(e, this.unit)
      )
      for (let i = 0; i < effects.length; i++) {
        const e = effects[i]
        res.push({
          type: e.type,
          absolute: e.absolute,
          amount: e.amount
        })
      }
      this.applyEffects(upgrade.chain, res)
    },
    onMouseMove(event, upgrade) {
      this.hoveredUpgrade = upgrade
      if (this.hoveredUpgrade) {
        if (event.type === "touchmove") {
          return
        }
        this.$nextTick(() => {
          this.x =
            event.clientX +
            15 -
            this.$el.parentElement.getBoundingClientRect().left

          if (
            this.x +
              this.$el.parentElement.getBoundingClientRect().left +
              this.$refs.tooltip.$el.clientWidth +
              4 >
            document.body.clientWidth
          ) {
            this.x =
              event.clientX -
              this.$refs.tooltip.$el.clientWidth -
              15 -
              this.$el.parentElement.getBoundingClientRect().left -
              4
          }

          if (this.x < 0) {
            this.x =
              window.innerWidth -
              this.$refs.tooltip.$el.clientWidth -
              this.$el.parentElement.getBoundingClientRect().left -
              4
          }

          this.y =
            event.clientY +
            15 -
            this.$el.parentElement.getBoundingClientRect().top

          if (
            this.y +
              this.$el.parentElement.getBoundingClientRect().top +
              this.$refs.tooltip.$el.clientHeight +
              4 >
            window.innerHeight
          ) {
            this.y =
              event.clientY -
              this.$refs.tooltip.$el.clientHeight -
              15 -
              this.$el.parentElement.getBoundingClientRect().top
          }

          if (this.y < 0) {
            this.y =
              window.innerHeight -
              this.$refs.tooltip.$el.clientHeight -
              this.$el.parentElement.getBoundingClientRect().top -
              4
          }
        })
      }
    }
  }
}
</script>
