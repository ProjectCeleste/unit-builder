<template>
  <div
    class="upgrade-container is-flex is-flex-direction-row"
    :class="{ disabled: disabled }"
  >
    <Icon
      v-if="isChained"
      sprite="icons"
      size="sm"
      name="arrow-right"
      class="chain-indicator is-align-self-center"
      :class="{ selected: modelValue.selected }"
    />
    <div
      class="upgrade p-1"
      :title="upgrade.name"
      :class="{ selected: modelValue.selected }"
      @click="onSelect"
      @mousemove="onMouseMove($event, upgrade)"
      @touchmove="onMouseMove($event, upgrade)"
      @mouseleave="$emit('mouseleave', $event)"
      @touchend="$emit('mouseleave', $event)"
      @touchcancel="$emit('mouseleave', $event)"
    >
      <Icon size="md" sprite="upgrades" :name="upgrade.icon" />
    </div>
    <Upgrade
      v-if="
        upgrade.chain &&
          (!upgrade.chain.unlocked || unlockedTech.includes(upgrade.chain.id))
      "
      v-model="chain"
      :upgrade="upgrade.chain"
      :is-chained="true"
      @mouseleave="$emit('mouseleave', $event)"
      @mousemove="onMouseMove"
    />
  </div>
</template>

<script>
import Icon from "./Icon.vue"
import upgrades from "../data/upgrades.json"

export default {
  name: "Upgrade",
  components: { Icon },
  props: {
    modelValue: {
      type: Object,
      default() {
        return { selected: false, effects: [], chain: undefined }
      }
    },
    upgrade: { type: Object, required: true },
    unlockedTech: { type: Array, default: () => [] },
    isChained: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  },
  emits: ["update:modelValue", "mousemove", "mouseleave"],
  data() {
    return {
      chain: undefined
    }
  },
  watch: {
    modelValue: {
      deep: true,
      handler(val) {
        this.chain = val.chain
      }
    },
    chain: {
      deep: true,
      handler(val) {
        const newSelected = this.modelValue.selected || (val && val.selected)
        this.$emit("update:modelValue", {
          selected: newSelected,
          effects: newSelected ? this.upgrade.effects : [],
          chain: val
        })
      }
    },
    unlockedTech(val) {
      var fixGuardTowerSGreek = upgrades["greek"].filter(
        u => u.id === "TechTower2"
      )
      var fixGuardTowerSCeltic = upgrades["celtic"].filter(
        u => u.id === "TechTower2"
      )
      if (fixGuardTowerSGreek[0].chain.chain.id != undefined) {
        if (
          fixGuardTowerSGreek[0].chain.chain.id === "TechTowerS" &&
          this.unlockedTech.includes("TechTowerS")
        ) {
          /*unlocked means the complete opposite of what you would expect
          false means that it is an unlocked upgrade*/
          fixGuardTowerSGreek[0].chain.chain.unlocked = false
          fixGuardTowerSCeltic[0].chain.chain.unlocked = false
          /*const newSelected = this.modelValue.selected
          this.$emit("update:modelValue", {
            selected: newSelected,
            effects: newSelected ? this.upgrade.chain.effects : [],
            chain: fixGuardTowerSGreek[0].chain.chain
              ? undefined
              : this.modelValue.chain
          })*/
        } else if (
          fixGuardTowerSGreek[0].chain.chain.id === "TechTowerS" &&
          !this.unlockedTech.includes("TechTowerS")
        ) {
          /*unlocked means the complete opposite of what you would expect
          true means that it is a locked upgrade*/
          fixGuardTowerSGreek[0].chain.chain.unlocked = true
          fixGuardTowerSCeltic[0].chain.chain.unlocked = true
          /*const newSelected = this.modelValue.selected
          this.$emit("update:modelValue", {
            selected: newSelected,
            effects: newSelected ? this.upgrade.chain.effects : [],
            chain: undefined
          })*/
        }
      }
      if (
        this.upgrade.chain &&
        this.upgrade.chain.unlocked &&
        !val.includes(this.upgrade.chain.id)
      ) {
        const newSelected = this.modelValue.selected
        this.$emit("update:modelValue", {
          selected: newSelected,
          effects: newSelected ? this.upgrade.effects : [],
          chain: undefined
        })
      }
    }
  },
  mounted() {
    this.chain = this.modelValue.chain
  },
  methods: {
    onMouseMove($event, upgrade) {
      this.$emit("mousemove", $event, upgrade)
    },
    onSelect() {
      if (this.disabled) {
        return
      }
      const newSelected = !this.modelValue.selected
      let effects = []
      if (newSelected) {
        effects = effects.concat(this.upgrade.effects)
        if (this.modelValue.chain) {
          effects = effects.concat(this.chain.effects)
        }
      }
      this.$emit("update:modelValue", {
        selected: newSelected,
        effects: effects,
        chain: newSelected ? this.modelValue.chain : undefined
      })
      this.$emit("mouseleave")
    }
  }
}
</script>

<style lang="scss" scoped>
.upgrade-container {
  .upgrade,
  .chain-indicator {
    opacity: 0.35;
    transition: opacity 0.1s linear;

    &.selected {
      opacity: 1;
    }
  }

  .chain-indicator {
    margin-left: -5px;
    margin-right: -5px;
  }

  .upgrade:hover {
    cursor: pointer;
  }

  &.disabled {
    .upgrade:hover {
      cursor: not-allowed;
    }
  }
}
</style>
