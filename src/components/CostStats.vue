<template>
  <template v-for="(stat, key) in cost" :key="key">
    <span class="ml-2">{{ stat.toFixed(0) }}</span>
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

export default {
  name: "CostStats",
  components: { Icon },
  props: {
    cost: { type: Object, required: true }
  }
}
</script>
