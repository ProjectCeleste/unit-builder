<template>
  <div class="unit-selector is-relative">
    <div>
      <h4 class="title">
        Select a unit&nbsp;:&nbsp;
      </h4>
    </div>
    <div class="selected-unit is-flex" @click="open = !open">
      <img
        :src="require(`../assets/img/Art/${modelValue.unit.icon}.png`)"
        class="small-img mr-2"
      />
      <span class="is-flex-grow-1 has-text-left">{{
        modelValue.unit.name
      }}</span>
      <img
        v-if="modelValue.unit.name != 'None'"
        :src="require(`../assets/img/Art/civs/${modelValue.civ}.png`)"
        class="small-img ml-2"
      />
      <span class="select-arrow px-2">▼</span>
    </div>
    <keep-alive>
      <Dropdown
        v-if="open"
        ref="dropdown"
        v-click-outside="onClickOutside"
        :contents="units"
        @selected="selectedUnitChanged"
      >
        <template #header>
          <CivSelector v-model="civ" />
        </template>
      </Dropdown>
    </keep-alive>
  </div>
</template>

<script>
// FIXME click outside doesn't work

import Dropdown from "./Dropdown.vue"
import CivSelector from "./CivSelector.vue"

const civs = require("../data/units.json")

export default {
  name: "UnitSelector",
  components: { Dropdown, CivSelector },
  props: {
    modelValue: {
      type: Object,
      default() {
        return { civ: "greek", unit: { name: "None", icon: "32" } }
      }
    }
  },
  emits: ["update:modelValue"],
  data() {
    return {
      open: false,
      civ: "greek"
    }
  },
  computed: {
    units() {
      return civs[this.civ]
    }
  },
  watch: {
    civ() {
      if (this.$refs.dropdown) {
        this.$refs.dropdown.resetContentsScroll()
      }
    }
  },
  methods: {
    selectedUnitChanged(s) {
      this.open = false
      this.$emit("update:modelValue", { civ: this.civ, unit: s })
    },
    onClickOutside() {
      this.open = false
    }
  }
}
</script>

<style lang="scss" scoped>
.unit-selector {
  .selected-unit {
    line-height: 32px;

    &:hover {
      cursor: pointer;
    }

    .select-arrow {
      border-left: 1px solid #7a7a7a; // TODO use color variable
    }
  }
}
</style>
