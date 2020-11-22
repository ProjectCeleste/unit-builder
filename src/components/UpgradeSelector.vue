<template>
  <div class="upgrade-selector is-flex is-flex-direction-row is-flex-wrap">
    <Upgrade
      v-for="u in upgrades"
      :key="u.id"
      v-model="effects[u.id]"
      :upgrade="u"
    />
  </div>
</template>

<script>
import upgrades from "../data/upgrades.json"
import Upgrade from "./Upgrade.vue"

// TODO v-model

export default {
  name: "UpgradeSelector",
  components: { Upgrade },
  props: {
    unit: { type: Object, required: true }
  },
  emits: ["update:modelValue"],
  data() {
    return {
      effects: {}
    }
  },
  computed: {
    upgrades() {
      return upgrades.filter(this.upgradeAppliesToUnit)
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
      // FIXME total war applies on ballista, should only apply to persian units
      return this.unit.id === e.target || this.unit.types.includes(e.target)
    }
  }
}
</script>

<style lang="scss" scoped>
.upgrade {
  padding: #{map-get($spacing-values, "1")};
}
</style>
