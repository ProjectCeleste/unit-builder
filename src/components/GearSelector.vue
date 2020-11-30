<template>
  <div v-click-outside="onClickOutside" class="gear-selector">
    <div class="is-relative">
      <div class="selected-option" @click="open = !open">
        <Icon
          sprite="gear"
          :name="selected.icon.replace(/\s/g, '-')"
          :title="selected.name"
          size="md"
        />
      </div>
      <div class="adjust-stat-btn" @click="effectsOpen = !effectsOpen">
        <Icon sprite="icons" name="cog" title="Adjust effects" size="xs" />
      </div>
    </div>
    <keep-alive>
      <Dropdown
        v-if="open"
        :contents="contents"
        sprite="gear"
        @selected="onSelected"
      />
    </keep-alive>
    <keep-alive>
      <GearStatsDropdown
        ref="stats-dropdown"
        v-model="stats"
        :class="{ 'is-hidden': !effectsOpen }"
        :gear="selected"
      />
    </keep-alive>
  </div>
</template>

<script>
import Dropdown from "./Dropdown.vue"
import GearStatsDropdown from "./GearStatsDropdown.vue"
import Icon from "./Icon.vue"
import Gear from "../data/gear.json"

export default {
  name: "GearSelector",
  components: { Dropdown, GearStatsDropdown, Icon },
  props: {
    type: { type: String, required: true },
    modelValue: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  emits: ["update:modelValue"],
  data() {
    return {
      open: false,
      effectsOpen: false,
      selected: { name: "None", icon: "Generic", effects: [] },
      stats: { effects: [], level: 43 }
    }
  },
  computed: {
    contents() {
      return Gear[this.type]
    }
  },
  watch: {
    modelValue(val) {
      this.onActivate()
      if (Object.keys(val).length) {
        this.stats = val.stats
        this.selected = this.contents.find(g => g.id === val.selected)
      }
    },
    stats(val) {
      this.$emit("update:modelValue", {
        selected: this.selected.id,
        stats: val
      })
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
    onSelected(gear) {
      this.open = false
      this.effectsOpen = false
      this.selected = gear
      const g = {
        selected: gear.id,
        stats: {
          effects: [],
          level: gear.levels[gear.levels.length - 1]
        }
      }
      for (let i = 0; i < gear.effects.length; i++) {
        const effect = gear.effects[i]
        const amount = effect.amount + effect.scaling * g.stats.level
        g.stats.effects.push({
          type: effect.type,
          absolute: effect.absolute,
          amount: amount
        })
      }
      this.$nextTick(() => {
        const statsDropdown = this.$refs["stats-dropdown"]
        if (statsDropdown) {
          statsDropdown.reset()
        }
      })
      this.$emit("update:modelValue", g)
    },
    onActivate() {
      if (!Object.keys(this.modelValue).length) {
        this.selected = this.contents[0]
        this.stats = {
          effects: [],
          level: this.selected.levels[this.selected.levels.length - 1]
        }
      }
    },
    onClickOutside() {
      if (this.open) {
        this.open = false
      }
      if (this.effectsOpen) {
        this.effectsOpen = false
      }
    }
  }
}
</script>
