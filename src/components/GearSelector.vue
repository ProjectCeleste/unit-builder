<template>
  <div class="gear-selector is-relative">
    <div class="selected-gear" @click="open = !open">
      {{ type }}
      <Icon sprite="gear" :name="selected.icon" :title="selected.name" />
    </div>
    <keep-alive>
      <Dropdown
        v-if="open"
        :contents="contents"
        sprite="gear"
        @selected="onSelected"
      />
    </keep-alive>
  </div>
</template>

<script>
import Dropdown from "./Dropdown.vue"
import Icon from "./Icon.vue"
import Gear from "../data/gear.json"

export default {
  name: "GearSelector",
  components: { Dropdown, Icon },
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
      selected: { name: "None", icon: "Generic" }
    }
  },
  computed: {
    contents() {
      return Gear[this.type]
    }
  },
  watch: {
    modelValue(val) {
      if (!Object.keys(val).length) {
        this.onActivate()
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
          amount: amount
        })
      }
      this.$emit("update:modelValue", g)
    },
    onActivate() {
      if (!Object.keys(this.modelValue).length) {
        this.selected = this.contents[0]
        this.$emit("update:modelValue", { effects: [], level: 0 })
      }
    }
  }
}
</script>

<style lang="scss">
.selected-gear {
  &:hover {
    cursor: pointer;
  }
}
</style>
