<template>
  <div class="unit-selector is-relative">
    <div>
      <h4 class="title">
        Select a unit&nbsp;:&nbsp;
      </h4>
    </div>
    <div class="selected-unit is-flex" @click="open = !open">
      <Icon
        class="mr-2"
        sprite="units"
        :name="modelValue.unit.icon"
        :title="modelValue.unit.name"
        size="sm"
      />
      <span class="is-flex-grow-1 has-text-left">{{
        modelValue.unit.name
      }}</span>
      <Icon
        v-if="modelValue.unit.name != 'None'"
        class="ml-2"
        sprite="icons"
        :name="modelValue.civ"
        :title="modelValue.civ"
        size="sm"
      />
      <span class="select-arrow px-2">▼</span>
    </div>
    <keep-alive>
      <Dropdown
        v-if="open"
        ref="dropdown"
        v-click-outside="onClickOutside"
        sprite="units"
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
import Icon from "./Icon.vue"

const civs = require("../data/units.json")

export default {
  name: "UnitSelector",
  components: { Dropdown, CivSelector, Icon },
  props: {
    modelValue: {
      type: Object,
      default() {
        return { civ: "greek", unit: { name: "None", icon: "Generic" } }
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
