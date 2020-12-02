<template>
  <template v-for="(stat, key) in cost" :key="key">
    <span class="ml-2" :class="comparisonClass(key, stat)">{{
      stat.toFixed(0)
    }}</span>
    <Icon
      sprite="icons"
      :name="key"
      size="xs"
      class="ml-1 is-align-self-center"
    />
  </template>
</template>

<script>
import Icon from "./Icon.vue"
import Comparable from "../mixins/Comparable.js"

export default {
  name: "CostStats",
  components: { Icon },
  mixins: [Comparable],
  props: {
    cost: { type: Object, required: true }
  }
}
</script>
