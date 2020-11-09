<template>
  <div class="unit-selector is-relative">
    <div>
      <h4 class="title">
        Select a unit&nbsp;:&nbsp;
      </h4>
    </div>
    <div class="selected-unit is-flex" @click="open = !open">
      <img
        :src="require(`../assets/img/Art/${selected.icon}`)"
        class="small-img mr-2"
      />
      <span class="is-flex-grow-1 has-text-left">{{ selected.name }}</span>
      <img src="https://via.placeholder.com/32" class="small-img ml-2" />
      <span class="select-arrow px-2">▼</span>
    </div>
    <keep-alive>
      <Dropdown
        v-if="open"
        v-click-outside="onClickOutside"
        :contents="units"
        @selected="selectedUnitChanged"
      >
        <template #header>
          <CivSelector @selected="selectedCivChanged" />
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
  data() {
    return {
      open: false,
      units: civs.greeks,
      selected: { name: "None", icon: "32.png" }
    }
  },
  methods: {
    selectedUnitChanged(s) {
      this.selected = s
      this.open = false
    },
    selectedCivChanged(s) {
      this.units = civs[s]
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
