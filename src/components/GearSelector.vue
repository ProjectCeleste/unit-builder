<template>
  <div class="gear-selector is-relative">
    <div class="selected-gear" @click="open = !open">
      <Icon
        sprite="gear"
        :name="selected.icon"
        :title="selected.name"
        size="md"
      />
    </div>
    <div class="adjust-stat-btn" @click="effectsOpen = !effectsOpen">
      <Icon sprite="icons" name="cog" title="Adjust effects" size="xs" />
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
        this.stats = val
      }
    },
    stats(val) {
      this.$emit("update:modelValue", val)
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
        effects: [],
        level: gear.levels[gear.levels.length - 1]
      }
      // TODO customize levels and value
      for (let i = 0; i < gear.effects.length; i++) {
        const effect = gear.effects[i]
        const amount = effect.amount + effect.scaling * g.level
        g.effects.push({
          type: effect.type,
          absolute: effect.absolute,
          // TODO fixed
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
    }
  }
}
</script>

<style lang="scss" scoped>
.selected-gear {
  position: relative;
  display: flex;

  &:hover {
    cursor: pointer;
  }
}

.adjust-stat-btn {
  display: inline-flex;
  position: absolute;
  bottom: 0;
  right: 0;
  padding-bottom: 2.5px;
  padding-right: 2.5px;

  &:hover {
    cursor: pointer;
  }
}
</style>
