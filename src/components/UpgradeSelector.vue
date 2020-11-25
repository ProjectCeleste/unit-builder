<template>
  <div
    class="upgrade-selector is-flex is-flex-direction-row is-flex-wrap is-relative"
  >
    <Upgrade
      v-for="u in upgrades"
      :key="u.id"
      v-model="effects[u.id]"
      :upgrade="u"
      @mouseleave="hoveredUpgrade = null"
      @mousemove="onMouseMove"
    />
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
      effects: {},
      x: 0,
      y: 0,
      hoveredUpgrade: null
    }
  },
  computed: {
    upgrades() {
      return upgrades[this.civ].filter(this.upgradeAppliesToUnit)
    }
  },
  watch: {
    effects: {
      deep: true,
      handler(val) {
        const effects = []
        for (let upgradeID in val) {
          const u = val[upgradeID].filter(this.effectAppliesToUnit)
          for (let i = 0; i < u.length; i++) {
            const e = u[i]
            effects.push({
              type: e.type,
              absolute: e.absolute,
              amount: e.amount
            })
          }
        }
        this.$emit("update:modelValue", effects)
      }
    },
    unit() {
      this.effects = {}
    }
  },
  methods: {
    upgradeAppliesToUnit(u) {
      for (let i = 0; i < u.effects.length; i++) {
        const e = u.effects[i]
        if (this.effectAppliesToUnit(e)) {
          return true
        }
      }
      return false
    },
    effectAppliesToUnit(e) {
      const isTarget =
        this.unit.id === e.target || this.unit.types.includes(e.target)
      if (isTarget) {
        if (e.type === "MaximumRangeConvert") {
          return this.unit.stats.ConvertStandardConvertable !== undefined
        } else if (e.type === "DamageRangedAttack") {
          return this.unit.stats.DamageRanged !== undefined
        } else if (e.type === "DamageMeleeAttack") {
          return (
            this.unit.stats.DamageHand !== undefined ||
            this.unit.stats.DamageCavalry !== undefined
          )
        } else if (e.type.startsWith("Gather")) {
          return Object.keys(this.unit.stats).includes(e.type)
        } else if (e.type.startsWith("Yield")) {
          const resource = e.type.substring("Yield".length)
          return Object.keys(this.unit.stats).includes(`Gather${resource}`)
        }
      }

      return isTarget
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
