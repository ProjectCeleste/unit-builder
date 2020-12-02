<template>
  <div v-click-outside="onClickOutside" class="unit-selector is-relative">
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
        :title="
          modelValue.civ.charAt(0).toUpperCase() + modelValue.civ.slice(1)
        "
        size="sm"
      />
      <span class="select-arrow">
        <Icon sprite="icons" name="arrow-right" size="sm" />
      </span>
    </div>
    <keep-alive>
      <Dropdown
        v-if="open"
        ref="dropdown"
        :preview="false"
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
  mounted() {
    if (this.modelValue.unit.id === undefined) {
      this.$emit("update:modelValue", {
        civ: this.civ,
        unit: civs["greek"].find(u => u.id === "Gr_Inf_Spearman")
      })
    }
  },
  methods: {
    selectedUnitChanged(s) {
      this.open = false
      this.$emit("update:modelValue", { civ: this.civ, unit: s })
    },
    onClickOutside() {
      if (this.open) {
        this.open = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.unit-selector {
  .selected-unit {
    line-height: 32px;
    border-radius: $border-radius-element;
    border: 1px solid $color--border;
    background-color: $tooltip-background-color;

    &:hover {
      cursor: pointer;
    }

    .select-arrow {
      border-left: 1px solid $color--border;

      .icon {
        transform: rotate(90deg);
      }
    }
  }
}

.dropdown {
  transform: none;
  max-width: 100%;
  width: 100%;
  left: auto;
  right: auto;
}
</style>
