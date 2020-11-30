<template>
  <div v-click-outside="onClickOutside" class="advisor-selector">
    <div class="is-relative">
      <div class="selected-option" @click="open = !open">
        <Icon
          sprite="advisors"
          :name="selected.icon"
          :title="'Age ' + (age + 1) + ' - ' + selected.name"
          size="md"
          :class="rarityClass(selected, selectedRarity)"
        />
      </div>
      <div
        v-if="selected.name !== 'None'"
        class="adjust-stat-btn"
        @click="effectsOpen = !effectsOpen"
      >
        <Icon sprite="icons" name="cog" title="Choose Rarity" size="xs" />
      </div>
    </div>
    <keep-alive>
      <Dropdown
        v-if="open"
        :contents="contents"
        sprite="advisors"
        @selected="onSelected"
      />
    </keep-alive>
    <keep-alive>
      <div v-if="effectsOpen" class="rarity-selector dropdown">
        <div class="is-bold wrap-word p-2">
          {{ selected.name }}
        </div>
        <div class="rarity-selector-container pb-2">
          <div
            v-for="rarity in selected.rarities"
            :key="rarity.rarity"
            class="is-flex is-flex-direction-row wrap-word advisor-rarity px-2"
            @click="onRaritySelected(rarity.rarity)"
          >
            <Icon
              sprite="advisors"
              :name="selected.icon"
              size="md mr-2"
              class="is-align-self-center"
              :class="rarityClass(rarity, rarity.rarity)"
            />
            <span class="is-align-self-center">{{ rarity.description }}</span>
          </div>
        </div>
      </div>
    </keep-alive>
  </div>
</template>

<script>
import Dropdown from "./Dropdown.vue"
import Icon from "./Icon.vue"
import Advisors from "../data/advisors.json"
import { rarityClass } from "../rarity.js"

export default {
  name: "AdvisorSelector",
  components: { Dropdown, Icon },
  props: {
    modelValue: {
      type: Object,
      default() {
        return {}
      }
    },
    civ: { type: String, required: true },
    unit: { type: Object, required: true },
    age: { type: Number, required: true }
  },
  emits: ["update:modelValue"],
  data() {
    return {
      open: false,
      effectsOpen: false,
      selected: { name: "None", icon: "none" },
      selectedRarity: 0
    }
  },
  computed: {
    contents() {
      return Advisors[this.age].filter(
        a => a.civ === undefined || a.civ === this.civ
      )
    }
  },
  watch: {
    modelValue(val) {
      this.onActivate()
      if (Object.keys(val).length) {
        this.selected = Advisors[this.age].find(a => a.id === val.id)
        this.selectedRarity = val.rarity
      }
    },
    open(val) {
      if (val) {
        this.effectsOpen = false
      }
    },
    effectsOpen(val) {
      if (val) {
        this.open = false
      }
    }
  },
  activated() {
    this.onActivate()
  },
  mounted() {
    this.onActivate()
  },
  methods: {
    onActivate() {
      if (!Object.keys(this.modelValue).length) {
        const advisor = this.contents[0]
        this.selectedRarity =
          advisor.rarities[advisor.rarities.length - 1].rarity
        this.onSelected(advisor)
      }
    },
    onSelected(advisor) {
      this.open = false
      this.effectsOpen = false
      const rarity = advisor.rarities[advisor.rarities.length - 1]
      this.selectedRarity = rarity.rarity
      const a = {
        id: advisor.id,
        rarity: this.selectedRarity,
        effects: rarity.effects.slice()
      }
      this.$emit("update:modelValue", a)
    },
    onRaritySelected(r) {
      this.selectedRarity = r
      this.effectsOpen = false
      const rarity = this.selected.rarities[this.selectedRarity]
      const a = {
        id: this.selected.id,
        rarity: this.selectedRarity,
        effects: rarity.effects.slice()
      }
      this.$emit("update:modelValue", a)
    },
    onClickOutside() {
      if (this.open) {
        this.open = false
      }
      if (this.effectsOpen) {
        this.effectsOpen = false
      }
    },
    rarityClass(advisor, rarity) {
      return advisor.name === "None" ? {} : rarityClass(rarity)
    }
  }
}
</script>

<style lang="scss">
.rarity-selector {
  background-color: $tooltip-background-color;
}

.advisor-rarity {
  &:hover {
    cursor: pointer;
    background-color: $tooltip-item-background-color-hover;
  }

  .icon {
    border-radius: $border-radius-element;
  }
}
</style>
