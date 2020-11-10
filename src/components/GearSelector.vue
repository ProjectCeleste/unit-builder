<template>
  <div class="gear-selector is-relative">
    <div class="selected-gear" @click="open = !open">
      {{ type }}
      {{ JSON.stringify(gear) }}
    </div>
    <keep-alive>
      <Dropdown
        v-if="open"
        v-model="gear"
        :contents="contents"
        @selected="open = false"
      />
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
        return {
          name: "None",
          icon: "32.png",
          effects: []
        }
      }
    }
  },
  data() {
    return {
      gear: {},
      open: false
    }
  },
  computed: {
    contents() {
      return Gear[this.type]
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
