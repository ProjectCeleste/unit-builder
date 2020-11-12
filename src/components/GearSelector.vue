<template>
  <div class="gear-selector is-relative">
    <div class="selected-gear" @click="open = !open">
      {{ type }}
    </div>
    <keep-alive>
      <Dropdown v-if="open" :contents="contents" @selected="onSelected" />
    </keep-alive>
  </div>
</template>

<script>
import Dropdown from "./Dropdown.vue"
import Gear from "../data/gear.json"

export default {
  name: "GearSelector",
  components: { Dropdown },
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
      open: false
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
      this.$emit("update:modelValue", gear)
    },
    onActivate() {
      if (!Object.keys(this.modelValue).length) {
        this.$emit("update:modelValue", this.contents[0])
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
