<template>
  <div class="upgrade-selector is-flex is-flex-direction-column is-flex-wrap">
    <div class="is-flex is-flex-direction-row">
      <Upgrade
        v-for="u in upgrades"
        :key="u.id"
        v-model="upgradeValues[u.id]"
        :upgrade="u"
        :disabled="isDisabled(u.id)"
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
        :disabled="isDisabled(u.id)"
        @mouseleave="hoveredUpgrade = null"
        @mousemove="onMouseMove"
      />
    </div>
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
import { upgradeAppliesToUnit } from "../stats.js"

export default {
  name: "UpgradeSelector",
  components: { Upgrade, Tooltip, Preview },
  props: {
    modelValue: {
      type: Object,
      default() {
        return {}
      }
    },
    civ: { type: String, required: true },
    unit: { type: Object, required: true },
    unlockedTech: { type: Array, default: () => [] }
  },
  emits: ["update:modelValue"],
  data() {
    return {
      upgradeValues: {},
      disabledTech: [],
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
        .filter(u => !u.unlocked || this.unlockedTech.includes(u.id))
    },
    chainedUpgrades() {
      return upgrades[this.civ]
        .filter(u => upgradeAppliesToUnit(u, this.unit))
        .filter(u => u.chain !== undefined)
        .filter(u => !u.unlocked || this.unlockedTech.includes(u.id))
    }
  },
  watch: {
    modelValue: {
      deep: true,
      handler(val) {
        this.upgradeValues = val
        this.updateDisabledTech()
      }
    },
    upgradeValues: {
      deep: true,
      handler(val) {
        this.updateDisabledTech()
        this.$emit("update:modelValue", val)
      }
    }
  },
  methods: {
    onMouseMove(event, upgrade) {
      this.hoveredUpgrade = upgrade
      if (this.hoveredUpgrade) {
        if (event.type === "touchmove") {
          return
        }
        this.$nextTick(() => {
          const borderWidth = 4
          const scrollbarWidth = 15
          const parentBounds = this.$el.parentElement.parentElement.parentElement.getBoundingClientRect()
          this.x = event.clientX - parentBounds.left + 15 + borderWidth / 2

          const boundRight =
            this.x +
            parentBounds.left +
            this.$refs.tooltip.$el.clientWidth +
            borderWidth

          if (boundRight >= window.innerWidth - scrollbarWidth) {
            this.x -= boundRight - window.innerWidth + scrollbarWidth
          }

          if (this.x < 0) {
            this.x =
              window.innerWidth -
              this.$refs.tooltip.$el.clientWidth -
              borderWidth
          }

          this.y = event.clientY - parentBounds.top + 15 + borderWidth / 2

          const boundBottom =
            this.y +
            parentBounds.top +
            this.$refs.tooltip.$el.clientHeight +
            borderWidth

          if (boundBottom >= window.innerHeight) {
            this.y -= boundBottom - window.innerHeight
          }

          if (this.y < event.clientY - parentBounds.top + 15 - borderWidth) {
            this.y =
              event.clientY -
              this.$refs.tooltip.$el.clientHeight -
              parentBounds.top -
              15 -
              borderWidth / 2
          }
        })
      }
    },
    updateDisabledTech() {
      this.disabledTech = []
      for (let key in this.upgradeValues) {
        this.checkContainsDisableTech(this.upgradeValues[key])
      }
    },
    checkContainsDisableTech(u) {
      if (u.selected) {
        this.disabledTech = this.disabledTech.concat(
          u.effects.filter(e => e.type === "DisableUpgrade").map(e => e.tech)
        )

        if (u.chain) {
          this.checkContainsDisableTech(u.chain)
        }
      }
    },
    isDisabled(id) {
      return this.disabledTech.includes(id)
    }
  }
}
</script>
